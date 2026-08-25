/**
 * Rate limit přihlašování do administrace.
 *
 * Počítá se v databázi, ne v paměti. Na Vercelu běží každý request potenciálně
 * v jiné instanci a instance se recyklují po minutách – in-memory počítadlo by
 * útočníkovi stačilo přečkat, nebo ho rovnou obejít paralelními požadavky do
 * různých instancí. Tabulka `login_attempts` je jediné místo, kde se pokusy
 * skutečně sčítají.
 *
 * Dvě nezávislá pravidla:
 *   - IP: 10 neúspěchů / 15 min. Chytá hrubou sílu proti seznamu e-mailů.
 *   - účet: 5 neúspěchů / 15 min + zámek na účtu. Chytá útok z botnetu, kde
 *     každý pokus přijde z jiné adresy.
 */
import { and, eq, gte, sql } from 'drizzle-orm';

import { getDb } from '../db/client';
import { adminUsers, loginAttempts, normalizeEmail } from '../db/schema';

export const WINDOW_MINUTES = 15;
export const MAX_FAILURES_PER_IP = 10;
export const MAX_FAILURES_PER_EMAIL = 5;
const LOCK_MINUTES = 15;

export type LoginGate = {
  allowed: boolean;
  /** Kolik sekund má formulář zobrazit jako „zkuste to za…". Nula, když je povoleno. */
  retryAfterSeconds: number;
  /** Interní důvod pro log a audit. NIKDY se nesmí ukázat uživateli – prozradil by, že účet existuje. */
  reason?: 'ip' | 'email' | 'zamceno';
};

const ALLOWED: LoginGate = { allowed: true, retryAfterSeconds: 0 };

/**
 * Zapíše pokus a rovnou dorovná počítadla na účtu.
 *
 * Úspěch nuluje `failed_attempts` i `locked_until` – kdo zná heslo, nemá důvod
 * čekat na doběhnutí okna. Selhání inkrementuje a při dosažení limitu zamkne.
 * Vše jedním UPDATE, aby dva souběžné pokusy nepřepsaly jeden druhého.
 */
export async function recordAttempt(email: string | null, ip: string, ok: boolean): Promise<void> {
  const normalized = email ? normalizeEmail(email) : null;
  const db = getDb();

  try {
    await db.insert(loginAttempts).values({ email: normalized, ip: ip.slice(0, 64), ok });

    if (!normalized) return;

    if (ok) {
      await db
        .update(adminUsers)
        .set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
        .where(eq(adminUsers.email, normalized));
      return;
    }

    // `failed_attempts + 1 >= limit` se vyhodnocuje nad čerstvou hodnotou v DB,
    // ne nad tou, kterou jsme si přečetli dřív – jinak by souběh limit přeskočil.
    await db.execute(sql`
      UPDATE admin_users
         SET failed_attempts = failed_attempts + 1,
             locked_until = CASE
               WHEN failed_attempts + 1 >= ${MAX_FAILURES_PER_EMAIL}
               THEN now() + make_interval(mins => ${LOCK_MINUTES})
               ELSE locked_until
             END
       WHERE email = ${normalized}
    `);
  } catch (err) {
    // Výpadek zápisu nesmí shodit přihlášení. Nepříjemné, ale ztráta jednoho
    // záznamu je menší zlo než nedostupná administrace uprostřed sezóny.
    console.error('[admin/rate-limit] pokus se nepodařilo zaznamenat:', err);
  }
}

/**
 * Smí tenhle pokus vůbec projít?
 *
 * Volá se PŘED ověřením hesla. Při chybě databáze pouštíme dál – limiter je
 * ochrana navíc, ne autentizace, a zamknout si administraci kvůli výpadku
 * Neonu by bylo horší než riziko pár pokusů navíc.
 */
export async function checkLoginAllowed(email: string | null, ip: string): Promise<LoginGate> {
  const normalized = email ? normalizeEmail(email) : null;
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  try {
    const db = getDb();

    // Explicitní zámek na účtu má přednost – drží i po doběhnutí okna pokusů.
    if (normalized) {
      const locked = await db
        .select({ lockedUntil: adminUsers.lockedUntil })
        .from(adminUsers)
        .where(eq(adminUsers.email, normalized))
        .limit(1);

      const until = locked[0]?.lockedUntil;
      if (until && until.getTime() > Date.now()) {
        return { allowed: false, retryAfterSeconds: secondsUntil(until), reason: 'zamceno' };
      }
    }

    const [byIp] = await db
      .select({ n: sql<number>`count(*)::int`, oldest: sql<Date>`min(${loginAttempts.createdAt})` })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.ip, ip), eq(loginAttempts.ok, false), gte(loginAttempts.createdAt, since)));

    if (byIp && Number(byIp.n) >= MAX_FAILURES_PER_IP) {
      return { allowed: false, retryAfterSeconds: retryAfterFrom(byIp.oldest), reason: 'ip' };
    }

    if (normalized) {
      const [byEmail] = await db
        .select({ n: sql<number>`count(*)::int`, oldest: sql<Date>`min(${loginAttempts.createdAt})` })
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.email, normalized),
            eq(loginAttempts.ok, false),
            gte(loginAttempts.createdAt, since),
          ),
        );

      if (byEmail && Number(byEmail.n) >= MAX_FAILURES_PER_EMAIL) {
        return { allowed: false, retryAfterSeconds: retryAfterFrom(byEmail.oldest), reason: 'email' };
      }
    }

    return ALLOWED;
  } catch (err) {
    console.error('[admin/rate-limit] kontrola limitu selhala, pouštím dál:', err);
    return ALLOWED;
  }
}

/** Okno je klouzavé – čeká se, až nejstarší neúspěch vypadne ven. */
function retryAfterFrom(oldest: Date | string | null): number {
  if (!oldest) return WINDOW_MINUTES * 60;
  const from = oldest instanceof Date ? oldest : new Date(oldest);
  if (Number.isNaN(from.getTime())) return WINDOW_MINUTES * 60;
  return secondsUntil(new Date(from.getTime() + WINDOW_MINUTES * 60 * 1000));
}

function secondsUntil(when: Date): number {
  return Math.max(1, Math.ceil((when.getTime() - Date.now()) / 1000));
}

/**
 * Úklid z cronu. Starší pokusy nemají pro limit význam a tabulka by jinak rostla
 * donekonečna; 30 dní stačí na dohledání, kdy někdo zkoušel štěstí.
 */
export async function pruneOldAttempts(): Promise<number> {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    const rows = await getDb()
      .delete(loginAttempts)
      .where(sql`${loginAttempts.createdAt} < ${cutoff}`)
      .returning({ id: loginAttempts.id });
    return rows.length;
  } catch (err) {
    console.error('[admin/rate-limit] úklid pokusů selhal:', err);
    return 0;
  }
}
