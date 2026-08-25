"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import { passwordHashOf } from "@/lib/admin/accounts";
import { audit } from "@/lib/admin/audit";
import { checkPasswordStrength, hashPassword, verifyPassword } from "@/lib/admin/password";
import {
  createSession,
  getAdminSession,
  requireAdmin,
  revokeAllSessions,
} from "@/lib/admin/session";

/**
 * Akce vlastního účtu: jméno, heslo, odhlášení ostatních zařízení.
 *
 * Po úspěchu se vždycky přesměrovává, nevrací se hláška do stavu formuláře.
 * Důvod je praktický: změna hesla i odhlášení zařízení vyměňují přihlašovací
 * cookie, a `getAdminSession()` je v rámci jednoho requestu cachovaná — po
 * akci by se stránka překreslila ze zastaralé session a majitel by pořád
 * viděl staré jméno a starou výzvu ke změně hesla. Přesměrování udělá nový
 * request, kde je všechno čerstvé.
 */

const PATH = "/admin/ucet";

export type AccountState = { error?: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "neznama";
}

/** Zodovská hláška, kterou má smysl ukázat člověku — vždycky jen ta první. */
function firstProblem(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Formulář se nepodařilo přečíst.";
}

/* ------------------------------------------------------------------ jméno */

const NameForm = z.object({
  jmeno: z
    .string()
    .trim()
    .min(2, "Jméno musí mít alespoň dvě písmena.")
    .max(120, "Jméno je příliš dlouhé."),
});

export async function changeName(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await requireAdmin();
  if (!hasDatabaseUrl()) return { error: "Databáze není připojená, jméno se nemá kam uložit." };

  const parsed = NameForm.safeParse({ jmeno: formData.get("jmeno") });
  if (!parsed.success) return { error: firstProblem(parsed.error) };

  try {
    await getDb()
      .update(schema.adminUsers)
      .set({ name: parsed.data.jmeno })
      .where(eq(schema.adminUsers.id, user.id));
  } catch (error) {
    console.error("Jméno se nepodařilo uložit:", error);
    return { error: "Jméno se nepodařilo uložit. Zkuste to prosím znovu." };
  }

  await audit(user.id, "admin.profile.update", {
    entity: "admin_user",
    entityId: user.id,
    detail: { pole: "jmeno" },
    ip: await clientIp(),
  });

  revalidatePath(PATH);
  redirect(`${PATH}?ulozeno=jmeno`);
}

/* ------------------------------------------------------------------ heslo */

const PasswordForm = z.object({
  soucasne: z.string().min(1, "Zadejte současné heslo."),
  nove: z.string().min(1, "Zadejte nové heslo."),
  potvrzeni: z.string().min(1, "Napište nové heslo ještě jednou pro kontrolu."),
});

export async function changePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await requireAdmin();
  if (!hasDatabaseUrl()) return { error: "Databáze není připojená, heslo se nemá kam uložit." };

  const parsed = PasswordForm.safeParse({
    soucasne: formData.get("soucasne"),
    nove: formData.get("nove"),
    potvrzeni: formData.get("potvrzeni"),
  });
  if (!parsed.success) return { error: firstProblem(parsed.error) };
  const { soucasne, nove, potvrzeni } = parsed.data;

  // Ověření současného hesla je tu proto, že přihlášený počítač může na chvíli
  // zůstat bez dozoru. Bez něj by kolemjdoucí změnil heslo a majitel by se
  // do vlastní administrace už nedostal.
  const stored = await passwordHashOf(user.id);
  if (!stored || !(await verifyPassword(soucasne, stored))) {
    return { error: "Současné heslo nesouhlasí." };
  }

  if (nove !== potvrzeni) return { error: "Nové heslo a jeho zopakování se neshodují." };
  if (nove === soucasne) return { error: "Nové heslo musí být jiné než to současné." };

  const strength = checkPasswordStrength(nove);
  if (!strength.ok) return { error: strength.problem ?? "Heslo nevyhovuje požadavkům." };

  const ip = await clientIp();
  const h = await headers();
  let others = 0;

  try {
    const passwordHash = await hashPassword(nove);
    await getDb()
      .update(schema.adminUsers)
      .set({ passwordHash, mustChangePassword: false })
      .where(eq(schema.adminUsers.id, user.id));

    // Nové heslo bez odvolání starých přihlášení by nic neřešilo: kdo má
    // ukradenou cookie, zůstane uvnitř. Odvoláme proto všechna přihlášení
    // včetně tohohle a hned si vystavíme nové — prohlížeč tak dostane i nový
    // token, což je po změně hesla správně tak jako tak.
    const revoked = await revokeAllSessions(user.id);
    others = Math.max(0, revoked - 1);
    await createSession(user.id, { ip, userAgent: h.get("user-agent") });
  } catch (error) {
    console.error("Heslo se nepodařilo změnit:", error);
    return { error: "Heslo se nepodařilo změnit. Zkuste to prosím znovu." };
  }

  // Do auditu jde jen fakt, že se heslo změnilo. Žádné heslo, žádný hash.
  await audit(user.id, "admin.password.change", {
    entity: "admin_user",
    entityId: user.id,
    detail: { odhlasenychZarizeni: others },
    ip,
  });

  revalidatePath(PATH);
  redirect(`${PATH}?zmeneno=${others}`);
}

/* -------------------------------------------------------------- zařízení */

export async function revokeOtherDevices(
  _prev: AccountState,
  _formData: FormData,
): Promise<AccountState> {
  await requireAdmin();
  const session = await getAdminSession();
  if (!session) return { error: "Přihlášení vypršelo. Přihlaste se prosím znovu." };
  if (!hasDatabaseUrl()) return { error: "Databáze není připojená, odhlásit zařízení nejde." };

  const ip = await clientIp();
  const h = await headers();
  let others = 0;

  try {
    const revoked = await revokeAllSessions(session.user.id);
    others = Math.max(0, revoked - 1);
    await createSession(session.user.id, { ip, userAgent: h.get("user-agent") });
  } catch (error) {
    console.error("Zařízení se nepodařilo odhlásit:", error);
    return { error: "Zařízení se nepodařilo odhlásit. Zkuste to prosím znovu." };
  }

  await audit(session.user.id, "admin.sessions.revoke", {
    entity: "admin_user",
    entityId: session.user.id,
    detail: { odhlasenychZarizeni: others },
    ip,
  });

  revalidatePath(PATH);
  redirect(`${PATH}?odhlaseno=${others}`);
}
