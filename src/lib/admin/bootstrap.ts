/**
 * Založení prvního účtu do administrace.
 *
 * Řeší slepici a vejce: bez účtu se nedá přihlásit a bez přihlášení se nedá
 * účet založit. Alternativou by byl seed skript, ale ten se na produkci nikdy
 * nespustí ve správnou chvíli – tohle se zavolá při prvním přístupu na
 * přihlašovací stránku a je bezpečné volat opakovaně.
 *
 * Účet vzniká VÝHRADNĚ do prázdné tabulky. Jakmile existuje jediný uživatel,
 * funkce nic nedělá – jinak by přenastavení proměnné v prostředí umělo
 * přepsat heslo majiteli.
 */
import { sql } from 'drizzle-orm';

import { getDb, hasDatabaseUrl } from '../db/client';
import { adminUsers, normalizeEmail } from '../db/schema';
import { checkPasswordStrength, hashPassword } from './password';

let done = false;

export async function ensureBootstrapAdmin(): Promise<void> {
  // Instance si pamatuje, že už to řešila – při dalších requestech nemá smysl
  // sahat do databáze. Studený start si to zopakuje, což nevadí.
  if (done) return;
  if (!hasDatabaseUrl()) return;

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) return;

  try {
    const db = getDb();

    const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
    if (existing.length > 0) {
      done = true;
      return;
    }

    const strength = checkPasswordStrength(password);
    if (!strength.ok) {
      // Hláška záměrně bez hesla i bez náznaku jeho podoby.
      console.error(`[admin/bootstrap] ADMIN_BOOTSTRAP_PASSWORD nevyhovuje politice: ${strength.problem}`);
      return;
    }

    const passwordHash = await hashPassword(password);

    // `ON CONFLICT DO NOTHING` nad unique indexem e-mailu: dva souběžné
    // requesty na studený start by jinak zkusily založit majitele dvakrát.
    await db
      .insert(adminUsers)
      .values({
        email: normalizeEmail(email),
        name: 'Majitel',
        passwordHash,
        role: 'majitel',
        // Heslo je v proměnné prostředí, tedy i v logu nasazení a v historii
        // shellu. První, co po přihlášení musí udělat, je změnit ho.
        mustChangePassword: true,
      })
      .onConflictDoNothing({ target: adminUsers.email });

    done = true;
    console.info('[admin/bootstrap] Založen první účet majitele, po přihlášení je nutná změna hesla.');
  } catch (err) {
    // Chybějící tabulka (nespuštěná migrace) nebo výpadek DB nesmí shodit
    // přihlašovací stránku – bez ní se nikdo nedostane ani k opravě.
    console.error('[admin/bootstrap] první účet se nepodařilo založit:', err);
  }
}

/** Jen pro testy a jednorázové skripty – zapomene, že se bootstrap už řešil. */
export function resetBootstrapCache(): void {
  done = false;
}

/** Kolik účtů administrace existuje. Přihlašovací stránka podle toho pozná prázdnou instalaci. */
export async function countAdminUsers(): Promise<number> {
  if (!hasDatabaseUrl()) return 0;
  try {
    const res = await getDb().execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM admin_users`);
    return Number(res.rows[0]?.n ?? 0);
  } catch {
    return 0;
  }
}
