"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import { requireAdmin } from "@/lib/admin/session";
import { audit } from "@/lib/admin/audit";

/**
 * Zásahy do poptávek: odbavit, vrátit mezi nevyřízené, smazat.
 *
 * Výsledek se předává přes `?zprava=` v adrese — stránka poptávek tak zůstane
 * obyčejnou serverovou stránkou bez klientského stavu. Spolu s hláškou se vrací
 * i filtr, ve kterém majitel byl, aby po odbavení jedné poptávky nespadl zpátky
 * na začátek celého seznamu.
 *
 * `redirect()` se volá zásadně mimo `try` — uvnitř se šíří jako výjimka
 * a `catch` by ho spolkl i s přesměrováním.
 */

const Vstup = z.object({
  id: z.uuid(),
  /** Filtr, ve kterém majitel byl. Skládá se zpátky do adresy, viz `zpetnaAdresa`. */
  dotaz: z.string().max(200).optional(),
});

type Vysledek = "ok" | "neexistuje" | "chyba";

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "neznama";
}

/**
 * Sestaví adresu zpět na seznam.
 *
 * Řetězec ze skrytého pole se nikdy nelepí do adresy tak, jak přišel — projde
 * přes `URLSearchParams` a propustíme z něj jen dva známé parametry. Jinak by
 * šlo formulářem podstrčit cokoli, včetně cizí adresy.
 */
function zpetnaAdresa(dotaz: string | undefined, zprava: string): string {
  const vstup = new URLSearchParams(dotaz ?? "");
  const q = new URLSearchParams();
  for (const key of ["druh", "stav"]) {
    const value = vstup.get(key);
    if (value) q.set(key, value.slice(0, 40));
  }
  q.set("zprava", zprava);
  return `/admin/poptavky?${q.toString()}`;
}

/** Poptávka pro audit — bez textu zprávy, ten do záznamu změn nepatří. */
async function popis(id: string): Promise<{ kind: string; name: string; email: string } | null> {
  const [row] = await getDb()
    .select({
      kind: schema.inquiries.kind,
      name: schema.inquiries.name,
      email: schema.inquiries.email,
    })
    .from(schema.inquiries)
    .where(eq(schema.inquiries.id, id))
    .limit(1);
  return row ?? null;
}

/* --------------------------------------------------- vyřízeno / nevyřízeno */

async function prepnoutVyrizeni(
  adminId: string,
  id: string,
  vyrizeno: boolean,
  ip: string,
): Promise<Vysledek> {
  try {
    const detail = await popis(id);
    if (!detail) return "neexistuje";

    await getDb()
      .update(schema.inquiries)
      .set({ handledAt: vyrizeno ? sql`now()` : null })
      .where(eq(schema.inquiries.id, id));

    await audit(adminId, vyrizeno ? "poptavka.vyrizena" : "poptavka.vracena", {
      entity: "inquiries",
      entityId: id,
      detail: { druh: detail.kind, jmeno: detail.name, email: detail.email },
      ip,
    });
    return "ok";
  } catch (error) {
    console.error("Změna stavu poptávky selhala:", error);
    return "chyba";
  }
}

/**
 * Obě tlačítka míří sem, liší se jen cílovým stavem. Ten je daný tím, které
 * tlačítko obsluha stiskla, ne tím, co pošle prohlížeč ve formuláři.
 */
async function nastavitVyrizeni(formData: FormData, vyrizeno: boolean): Promise<void> {
  const admin = await requireAdmin();
  const parsed = Vstup.safeParse({ id: formData.get("id"), dotaz: formData.get("dotaz") });
  if (!parsed.success) redirect(zpetnaAdresa(undefined, "neexistuje"));

  const { id, dotaz } = parsed.data;
  if (!hasDatabaseUrl()) redirect(zpetnaAdresa(dotaz, "bez-databaze"));

  const vysledek = await prepnoutVyrizeni(admin.id, id, vyrizeno, await clientIp());
  if (vysledek !== "ok") redirect(zpetnaAdresa(dotaz, vysledek));

  revalidatePath("/admin/poptavky");
  revalidatePath("/admin");
  redirect(zpetnaAdresa(dotaz, vyrizeno ? "vyrizeno" : "vraceno"));
}

export async function oznacitVyrizene(formData: FormData): Promise<void> {
  await nastavitVyrizeni(formData, true);
}

export async function vratitNevyrizene(formData: FormData): Promise<void> {
  await nastavitVyrizeni(formData, false);
}

/* ----------------------------------------------------------------- smazání */

async function smazat(adminId: string, id: string, ip: string): Promise<Vysledek> {
  try {
    const detail = await popis(id);
    if (!detail) return "neexistuje";

    await getDb().delete(schema.inquiries).where(eq(schema.inquiries.id, id));

    // Po smazání se poptávka nikde nedohledá, proto si do auditu ukládáme,
    // koho se týkala — jinak by v záznamu zůstalo holé id neexistujícího řádku.
    await audit(adminId, "poptavka.smazana", {
      entity: "inquiries",
      entityId: id,
      detail: { druh: detail.kind, jmeno: detail.name, email: detail.email },
      ip,
    });
    return "ok";
  } catch (error) {
    console.error("Smazání poptávky selhalo:", error);
    return "chyba";
  }
}

export async function smazatPoptavku(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = Vstup.safeParse({ id: formData.get("id"), dotaz: formData.get("dotaz") });
  if (!parsed.success) redirect(zpetnaAdresa(undefined, "neexistuje"));

  const { id, dotaz } = parsed.data;
  if (!hasDatabaseUrl()) redirect(zpetnaAdresa(dotaz, "bez-databaze"));

  const vysledek = await smazat(admin.id, id, await clientIp());
  if (vysledek !== "ok") redirect(zpetnaAdresa(dotaz, vysledek));

  revalidatePath("/admin/poptavky");
  revalidatePath("/admin");
  redirect(zpetnaAdresa(dotaz, "smazano"));
}
