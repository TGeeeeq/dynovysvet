"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import { audit } from "@/lib/admin/audit";
import { ensureBootstrapAdmin } from "@/lib/admin/bootstrap";
import { dummyVerify, verifyPassword } from "@/lib/admin/password";
import { checkLoginAllowed, recordAttempt } from "@/lib/admin/rate-limit";
import { createSession, destroySession, getAdminSession, LOGIN_PATH } from "@/lib/admin/session";

/**
 * Přihlášení a odhlášení.
 *
 * Zásada: chybová hláška je vždy stejná, ať už účet neexistuje, má špatné
 * heslo, nebo je zamčený. Rozlišovat by znamenalo prozradit útočníkovi,
 * které e-maily v systému jsou.
 */

export type LoginState = { error?: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "neznama";
}

const GENERIC = "Nesprávný e-mail nebo heslo.";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasDatabaseUrl()) {
    return { error: "Databáze zatím není připojená. Přihlášení nelze ověřit." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const ip = await clientIp();

  if (!email || !password) return { error: GENERIC };

  const gate = await checkLoginAllowed(email, ip);
  if (!gate.allowed) {
    const minutes = Math.max(1, Math.ceil(gate.retryAfterSeconds / 60));
    return {
      error: `Příliš mnoho neúspěšných pokusů. Zkuste to znovu za ${minutes} min.`,
    };
  }

  // První spuštění: pokud v databázi ještě nikdo není, založí se majitel
  // z proměnných prostředí. Opakované volání je bez efektu.
  await ensureBootstrapAdmin();

  const db = getDb();
  const [user] = await db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email))
    .limit(1);

  // I když uživatel neexistuje, spálíme srovnatelný čas — jinak by délka
  // odpovědi prozradila, které e-maily jsou v systému.
  if (!user || user.disabledAt) {
    await dummyVerify();
    await recordAttempt(email, ip, false);
    return { error: GENERIC };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  await recordAttempt(email, ip, ok);
  if (!ok) return { error: GENERIC };

  const h = await headers();
  await createSession(user.id, { ip, userAgent: h.get("user-agent") ?? undefined });
  await audit(user.id, "admin.login", { ip });

  redirect(user.mustChangePassword ? "/admin/ucet?zmenit=1" : "/admin");
}

export async function logout(): Promise<void> {
  const session = await getAdminSession();
  if (session) await audit(session.user.id, "admin.logout", { ip: await clientIp() });
  await destroySession();
  redirect(LOGIN_PATH);
}
