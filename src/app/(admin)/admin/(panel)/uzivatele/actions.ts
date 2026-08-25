"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import { normalizeEmail } from "@/lib/db/schema";
import {
  countOtherActiveOwners,
  emailTaken,
  generateInitialPassword,
  getAccount,
} from "@/lib/admin/accounts";
import { audit } from "@/lib/admin/audit";
import { hashPassword } from "@/lib/admin/password";
import { requireRole, revokeAllSessions } from "@/lib/admin/session";

/**
 * Správa přístupů. Všechno tady smí jen majitel — `requireRole('majitel')`
 * stojí na začátku každé akce, ne jen na stránce: server action je obyčejný
 * POST a dá se zavolat i mimo administraci.
 *
 * Účty se zásadně nemažou, jen blokují. V `audit_log` i u odbavených vstupenek
 * na ně vedou cizí klíče a smazání by buď selhalo, nebo z historie udělalo
 * anonymní hromadu záznamů.
 */

const PATH = "/admin/uzivatele";

export type UsersState = {
  error?: string;
  message?: string;
  /**
   * Vygenerované počáteční heslo. Vrací se JEDINOU cestou — do stavu formuláře,
   * odkud se jednou vykreslí a zmizí. Nikam se neloguje, do auditu nejde ani
   * náznakem a v databázi z něj leží jen scrypt hash.
   */
  heslo?: { email: string; hodnota: string };
};

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "neznama";
}

function firstProblem(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Formulář se nepodařilo přečíst.";
}

function jmenoNebo(email: string, name: string | null): string {
  return name?.trim() ? name : email;
}

/* ------------------------------------------------------- nový přístup */

const NewUser = z.object({
  jmeno: z
    .string()
    .trim()
    .min(2, "Napište jméno, ať je v záznamu změn vidět, kdo co udělal.")
    .max(120, "Jméno je příliš dlouhé."),
  email: z.email("E-mail není ve správném tvaru.").max(200, "E-mail je příliš dlouhý."),
  role: z.enum(["majitel", "obsluha"], { message: "Vyberte roli." }),
});

export async function createUser(
  _prev: UsersState,
  formData: FormData,
): Promise<UsersState> {
  const actor = await requireRole("majitel");
  if (!hasDatabaseUrl()) return { error: "Databáze není připojená, přístup nejde založit." };

  const parsed = NewUser.safeParse({
    jmeno: formData.get("jmeno"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: firstProblem(parsed.error) };

  const email = normalizeEmail(parsed.data.email);
  if (await emailTaken(email)) {
    return { error: "Tenhle e-mail už přístup má. Zkontrolujte seznam níž." };
  }

  const heslo = generateInitialPassword();
  let id: string | undefined;

  try {
    const passwordHash = await hashPassword(heslo);
    const [row] = await getDb()
      .insert(schema.adminUsers)
      .values({
        email,
        name: parsed.data.jmeno,
        passwordHash,
        role: parsed.data.role,
        // Heslo zná ten, kdo účet zakládá. Dokud si ho člověk nezmění, není
        // to jeho heslo, ale společné — proto vynucená změna při prvním vstupu.
        mustChangePassword: true,
      })
      // Pojistka proti dvěma souběžným založením stejného e-mailu; unique index
      // by jinak vyhodil nesrozumitelnou databázovou chybu.
      .onConflictDoNothing({ target: schema.adminUsers.email })
      .returning({ id: schema.adminUsers.id });
    id = row?.id;
  } catch (error) {
    console.error("Přístup se nepodařilo založit:", error);
    return { error: "Přístup se nepodařilo založit. Zkuste to prosím znovu." };
  }

  if (!id) return { error: "Tenhle e-mail už přístup má. Zkontrolujte seznam níž." };

  await audit(actor.id, "admin.user.create", {
    entity: "admin_user",
    entityId: id,
    detail: { email, role: parsed.data.role },
    ip: await clientIp(),
  });

  revalidatePath(PATH);
  return {
    message: `Přístup pro ${parsed.data.jmeno} je založený.`,
    heslo: { email, hodnota: heslo },
  };
}

/* ------------------------------------------------- zásahy do cizího účtu */

const Manage = z.object({
  // `id` z formuláře je vstup jako každý jiný: ověříme tvar a účet si stejně
  // načteme z databáze, nikdy nespoléháme na to, co přišlo z prohlížeče.
  id: z.uuid("Účet se nepodařilo určit."),
  zamer: z.enum(["heslo", "zablokovat", "odblokovat", "odemknout", "role"], {
    message: "Neznámý úkon.",
  }),
  role: z.enum(["majitel", "obsluha"]).optional(),
});

export async function manageUser(
  _prev: UsersState,
  formData: FormData,
): Promise<UsersState> {
  const actor = await requireRole("majitel");
  if (!hasDatabaseUrl()) return { error: "Databáze není připojená, nic se nedá změnit." };

  const parsed = Manage.safeParse({
    id: formData.get("id"),
    zamer: formData.get("zamer"),
    role: formData.get("role") ?? undefined,
  });
  if (!parsed.success) return { error: firstProblem(parsed.error) };

  const { id, zamer } = parsed.data;
  const target = await getAccount(id);
  if (!target) return { error: "Takový přístup už neexistuje. Načtěte stránku znovu." };

  const kdo = jmenoNebo(target.email, target.name);
  const jaSam = target.id === actor.id;
  const db = getDb();
  const ip = await clientIp();

  try {
    switch (zamer) {
      /* ------------------------------------------------ nové heslo */
      case "heslo": {
        const heslo = generateInitialPassword();
        const passwordHash = await hashPassword(heslo);
        await db
          .update(schema.adminUsers)
          .set({
            passwordHash,
            mustChangePassword: true,
            // Nové heslo ruší i zámek z neúspěšných pokusů — jinak by člověk
            // dostal heslo, se kterým se stejně nepřihlásí.
            failedAttempts: 0,
            lockedUntil: null,
          })
          .where(eq(schema.adminUsers.id, target.id));
        // Staré přihlášení nesmí heslo přežít, jinak je výměna k ničemu.
        await revokeAllSessions(target.id);

        await audit(actor.id, "admin.user.password.reset", {
          entity: "admin_user",
          entityId: target.id,
          detail: { email: target.email },
          ip,
        });
        revalidatePath(PATH);
        return {
          message: `${kdo} má nové heslo a je odhlášený ze všech zařízení.`,
          heslo: { email: target.email, hodnota: heslo },
        };
      }

      /* ------------------------------------------------ zablokování */
      case "zablokovat": {
        if (jaSam) {
          return { error: "Sami sobě přístup vzít nemůžete — nikdo by vás nepustil zpátky." };
        }
        if (target.disabledAt) return { message: `${kdo} je zablokovaný už teď.` };
        if (target.role === "majitel" && (await countOtherActiveOwners(target.id)) === 0) {
          return {
            error: "Tohle je poslední majitel. Nejdřív udělejte majitelem někoho dalšího.",
          };
        }

        await db
          .update(schema.adminUsers)
          .set({ disabledAt: new Date() })
          .where(eq(schema.adminUsers.id, target.id));
        await revokeAllSessions(target.id);

        await audit(actor.id, "admin.user.disable", {
          entity: "admin_user",
          entityId: target.id,
          detail: { email: target.email },
          ip,
        });
        revalidatePath(PATH);
        return { message: `${kdo} se už nepřihlásí a je odhlášený ze všech zařízení.` };
      }

      /* ------------------------------------------------ odblokování */
      case "odblokovat": {
        if (!target.disabledAt) return { message: `${kdo} zablokovaný není.` };

        await db
          .update(schema.adminUsers)
          .set({ disabledAt: null })
          .where(eq(schema.adminUsers.id, target.id));

        await audit(actor.id, "admin.user.enable", {
          entity: "admin_user",
          entityId: target.id,
          detail: { email: target.email },
          ip,
        });
        revalidatePath(PATH);
        return { message: `${kdo} se zase může přihlásit.` };
      }

      /* ------------------------------------ odemčení po pokusech */
      case "odemknout": {
        await db
          .update(schema.adminUsers)
          .set({ failedAttempts: 0, lockedUntil: null })
          .where(eq(schema.adminUsers.id, target.id));

        await audit(actor.id, "admin.user.unlock", {
          entity: "admin_user",
          entityId: target.id,
          detail: { email: target.email },
          ip,
        });
        revalidatePath(PATH);
        return { message: `${kdo} to může zkusit hned, čekat na odemčení nemusí.` };
      }

      /* ------------------------------------------------------ role */
      case "role": {
        const role = parsed.data.role;
        if (!role) return { error: "Vyberte roli." };
        if (role === target.role) return { message: `${kdo} tuhle roli už má.` };
        if (jaSam) {
          return { error: "Vlastní roli si změnit nemůžete. Požádejte druhého majitele." };
        }
        if (
          target.role === "majitel" &&
          !target.disabledAt &&
          (await countOtherActiveOwners(target.id)) === 0
        ) {
          return {
            error: "Tohle je poslední majitel. Nejdřív udělejte majitelem někoho dalšího.",
          };
        }

        await db
          .update(schema.adminUsers)
          .set({ role })
          .where(eq(schema.adminUsers.id, target.id));

        await audit(actor.id, "admin.user.role", {
          entity: "admin_user",
          entityId: target.id,
          detail: { email: target.email, z: target.role, na: role },
          ip,
        });
        revalidatePath(PATH);
        return { message: `${kdo} je nově ${role}.` };
      }
    }
  } catch (error) {
    console.error("Zásah do přístupu selhal:", error);
    return { error: "Změnu se nepodařilo uložit. Zkuste to prosím znovu." };
  }
}
