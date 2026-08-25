"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/session";
import { audit } from "@/lib/admin/audit";
import {
  cancelOrderAndRelease,
  markPaidManually,
  markRefunded,
  orderSummary,
  type OperationError,
} from "@/lib/admin/orders";

/**
 * Zásahy do objednávky.
 *
 * Každá akce se nejdřív ptá, kdo ji volá (`requireAdmin`), pak si ověří vstup
 * zodem — `id` z formuláře je pořád jen text od prohlížeče, ne důkaz — a nakonec
 * zapíše do auditu. Výsledek se předává přes `?zprava=` v adrese, ne přes
 * návratovou hodnotu: stránka tak zůstane obyčejnou serverovou stránkou bez
 * klientského stavu a odkaz se dá po zásahu klidně obnovit.
 */

const Vstup = z.object({
  id: z.uuid({ message: "Neplatné číslo objednávky." }),
});

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "neznama";
}

/** Kód hlášky, kterou detail objednávky vypíše nad stránkou. */
function chyba(reason: OperationError): string {
  switch (reason) {
    case "bez_databaze":
      return "bez-databaze";
    case "neexistuje":
      return "neexistuje";
    case "jiny_stav":
      return "jiny-stav";
    default:
      return "chyba";
  }
}

/** Po zásahu se musí přepočítat detail, výpis i přehled — všude jsou stejná čísla. */
function osvez(id: string): void {
  revalidatePath(`/admin/objednavky/${id}`);
  revalidatePath("/admin/objednavky");
  revalidatePath("/admin");
}

/* ------------------------------------------------- 1. ruční zaplacení */

export async function oznacitZaplacene(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = Vstup.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/objednavky?zprava=neexistuje");

  const { id } = parsed.data;
  const result = await markPaidManually(id);

  if (!result.ok) {
    // Audit i u odmítnutého pokusu — je vidět, že se o to někdo pokusil.
    await audit(admin.id, "objednavka.zaplaceno_rucne.odmitnuto", {
      entity: "orders",
      entityId: id,
      detail: { duvod: result.reason },
      ip: await clientIp(),
    });
    osvez(id);
    redirect(`/admin/objednavky/${id}?zprava=${chyba(result.reason)}`);
  }

  await audit(admin.id, "objednavka.zaplaceno_rucne", {
    entity: "orders",
    entityId: id,
    detail: { cislo: result.data.orderNumber, poznamka: "Platba přijata mimo bránu (převod nebo hotově)." },
    ip: await clientIp(),
  });

  osvez(id);
  redirect(`/admin/objednavky/${id}?zprava=zaplaceno`);
}

/* --------------------------------------- 2. zrušení a uvolnění kapacity */

export async function zrusitObjednavku(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = Vstup.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/objednavky?zprava=neexistuje");

  const { id } = parsed.data;
  const result = await cancelOrderAndRelease(id);

  if (!result.ok) {
    await audit(admin.id, "objednavka.zruseni.odmitnuto", {
      entity: "orders",
      entityId: id,
      detail: { duvod: result.reason },
      ip: await clientIp(),
    });
    osvez(id);
    redirect(`/admin/objednavky/${id}?zprava=${chyba(result.reason)}`);
  }

  await audit(admin.id, "objednavka.zruseni", {
    entity: "orders",
    entityId: id,
    detail: {
      cislo: result.data.orderNumber,
      puvodniStav: result.data.previousStatus,
      uvolnenoMist: result.data.releasedSeats,
      smazanoRezervaci: result.data.removedHolds,
    },
    ip: await clientIp(),
  });

  // Uvolněná místa mění obsazenost časovek, takže i sezóna ukazuje jinak.
  revalidatePath("/admin/sezona");
  osvez(id);
  redirect(`/admin/objednavky/${id}?zprava=zruseno&mista=${result.data.releasedSeats}`);
}

/* ------------------------------------------------- 3. vrácení peněz */

export async function oznacitVracene(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = Vstup.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/objednavky?zprava=neexistuje");

  const { id } = parsed.data;
  const result = await markRefunded(id);

  if (!result.ok) {
    await audit(admin.id, "objednavka.vraceno.odmitnuto", {
      entity: "orders",
      entityId: id,
      detail: { duvod: result.reason },
      ip: await clientIp(),
    });
    osvez(id);
    redirect(`/admin/objednavky/${id}?zprava=${chyba(result.reason)}`);
  }

  await audit(admin.id, "objednavka.vraceno", {
    entity: "orders",
    entityId: id,
    detail: {
      cislo: result.data.orderNumber,
      puvodniStav: result.data.previousStatus,
      poznamka:
        "Objednávka označena za vrácenou. Peníze vrací majitel ručně v bance nebo v Comgate, systém do brány nesahá.",
    },
    ip: await clientIp(),
  });

  osvez(id);
  redirect(`/admin/objednavky/${id}?zprava=vraceno`);
}

/* --------------------------------------- 4. opětovné odeslání vstupenky */

/**
 * Zatím jen zápis do záznamu změn. Rozesílání e-mailů dostane na starost jiná
 * část administrace; do té doby se aspoň pozná, že si o to majitel řekl.
 */
export async function poslatVstupenkuZnovu(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = Vstup.safeParse({ id: formData.get("id") });
  if (!parsed.success) redirect("/admin/objednavky?zprava=neexistuje");

  const { id } = parsed.data;
  const order = await orderSummary(id);
  if (!order) redirect(`/admin/objednavky/${id}?zprava=neexistuje`);

  await audit(admin.id, "objednavka.vstupenka.znovu_odeslat", {
    entity: "orders",
    entityId: id,
    detail: { cislo: order.orderNumber, odeslano: false },
    ip: await clientIp(),
  });

  redirect(`/admin/objednavky/${id}?zprava=email-nezapojen`);
}
