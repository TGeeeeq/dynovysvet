import 'server-only';

/**
 * Session administrace.
 *
 * Záměrně opaque token, ne JWT. Session obsluhy musí jít odvolat okamžitě
 * (brigádník skončí, notebook zůstane v hospodě) a podepsaný token se odvolat
 * nedá bez stejné databázové kontroly, kterou tu stejně děláme. Do cookie tedy
 * jde 32 náhodných bajtů a v databázi leží jen jejich SHA-256 – dump databáze
 * nikoho nepřihlásí.
 *
 * Sůl u hashe tokenu nepotřebujeme: vstup je 256 bitů entropie, předpočítaná
 * tabulka na něj neexistuje. Sůl řešíme jen u hesel, kde entropie chybí.
 */
import { cache } from 'react';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { and, eq, isNull, lt, or, sql } from 'drizzle-orm';

import { getDb, hasDatabaseUrl } from '../db/client';
import { adminSessions, adminUsers, type AdminRole, type SafeAdminUser } from '../db/schema';

export const ADMIN_COOKIE = 'ds_admin';
export const LOGIN_PATH = '/admin/prihlaseni';

/** 12 h ≈ jedna směna na statku. Delší platnost jen zvyšuje cenu ukradeného notebooku. */
const SESSION_TTL_SECONDS = 12 * 60 * 60;

/**
 * `last_seen_at` neaktualizujeme každý request – administrace při proklikávání
 * generuje desítky požadavků za minutu a zápis na každý z nich je jen zbytečné
 * kolo do databáze. Pětiminutová granularita na „kdo je zrovna přihlášený" stačí.
 */
const TOUCH_AFTER_SECONDS = 5 * 60;

export type AdminSessionContext = { user: SafeAdminUser; sessionId: string };

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

/* ------------------------------------------------------------- vytvoření */

/**
 * Založí session a nastaví cookie.
 *
 * Volat lze jen ze Server Action nebo Route Handleru – Next neumí nastavit
 * cookie během renderu Server Componenty (odpověď už streamuje).
 */
export async function createSession(
  adminUserId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await getDb()
    .insert(adminSessions)
    .values({
      adminUserId,
      tokenHash: hashToken(token),
      // Hlavičky ořezáváme – uživatel je plně ovládá a nechceme si do DB pustit
      // stokilobajtový User-Agent.
      userAgent: meta.userAgent?.slice(0, 512) ?? null,
      ip: meta.ip?.slice(0, 64) ?? null,
      expiresAt,
    });

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    // Na localhostu běží http, secure cookie by se vůbec neuložila.
    secure: process.env.NODE_ENV === 'production',
    // `lax` a ne `strict`: po redirectu z platební brány nebo z e-mailu se
    // obsluha nemá znovu přihlašovat. CSRF řešíme Server Actions, ne cookie.
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

/* ---------------------------------------------------------------- čtení */

/**
 * Aktuální přihlášený uživatel, nebo `null`.
 *
 * Obalené v React `cache()`: layout, page i každá Server Componenta se ptají
 * nezávisle a bez cache by jeden render administrace znamenal pět stejných
 * dotazů. Cache platí jen v rámci jednoho requestu, odhlášení se tedy projeví
 * hned na dalším.
 */
export const getAdminSession = cache(async (): Promise<AdminSessionContext | null> => {
  // Bez databáze (build, lokální náhled bez .env) prostě nikdo přihlášený není.
  if (!hasDatabaseUrl()) return null;

  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const rows = await db
    .select({
      sessionId: adminSessions.id,
      lastSeenAt: adminSessions.lastSeenAt,
      // Vybíráme sloupce ručně, ne `select()` nad celou tabulkou – hash hesla
      // ani TOTP secret nesmí opustit datovou vrstvu ani omylem.
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      lastLoginAt: adminUsers.lastLoginAt,
      failedAttempts: adminUsers.failedAttempts,
      lockedUntil: adminUsers.lockedUntil,
      mustChangePassword: adminUsers.mustChangePassword,
      createdAt: adminUsers.createdAt,
      disabledAt: adminUsers.disabledAt,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.adminUserId))
    .where(
      and(
        eq(adminSessions.tokenHash, hashToken(token)),
        isNull(adminSessions.revokedAt),
        sql`${adminSessions.expiresAt} > now()`,
        // Deaktivovaný účet ztrácí přístup okamžitě, i s platnou cookie.
        isNull(adminUsers.disabledAt),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const staleFor = Date.now() - row.lastSeenAt.getTime();
  if (staleFor > TOUCH_AFTER_SECONDS * 1000) {
    // Selhání dotyku nesmí shodit request – je to jen statistika, ne autorizace.
    await db
      .update(adminSessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(adminSessions.id, row.sessionId))
      .catch((err: unknown) => {
        console.error('[admin/session] last_seen_at se nepodařilo zapsat:', err);
      });
  }

  const { sessionId, lastSeenAt: _lastSeenAt, ...user } = row;
  return { user, sessionId };
});

/* ------------------------------------------------------------ stráže */

/** Použij v layoutu administrace. Nepřihlášeného pošle na login, nic nevrací navíc. */
export async function requireAdmin(): Promise<SafeAdminUser> {
  const session = await getAdminSession();
  if (!session) redirect(LOGIN_PATH);
  return session.user;
}

/**
 * Stráž na akce vyhrazené majiteli (ceník, účty obsluhy, refundy).
 *
 * Nedostatečná role končí `notFound()`, ne 403: obsluha se o existenci té části
 * administrace nemá dozvědět. Nepřihlášený jde přes `requireAdmin` na login.
 */
export async function requireRole(role: AdminRole): Promise<SafeAdminUser> {
  const user = await requireAdmin();
  if (role === 'majitel' && user.role !== 'majitel') notFound();
  return user;
}

/* --------------------------------------------------------- ukončení */

/** Odhlášení. Revokuje aktuální session a zahodí cookie. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;

  if (token && hasDatabaseUrl()) {
    await getDb()
      .update(adminSessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(adminSessions.tokenHash, hashToken(token)), isNull(adminSessions.revokedAt)))
      .catch((err: unknown) => {
        // Cookie smažeme tak jako tak – uživatel musí být odhlášen i při výpadku DB.
        console.error('[admin/session] revokace session selhala:', err);
      });
  }

  jar.delete(ADMIN_COOKIE);
}

/**
 * Odhlásí uživatele ze všech zařízení. Volá se po změně hesla a při deaktivaci
 * účtu – jinak by ukradená cookie přežila i výměnu kompromitovaného hesla.
 */
export async function revokeAllSessions(adminUserId: string): Promise<number> {
  const rows = await getDb()
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(adminSessions.adminUserId, adminUserId), isNull(adminSessions.revokedAt)))
    .returning({ id: adminSessions.id });
  return rows.length;
}

/**
 * Úklid: session, které jsou dávno po expiraci nebo revokované, už nikdo
 * nepotřebuje. Pouští se z cronu, není kritický. Týdenní odklad necháváme kvůli
 * vyšetřování incidentů – „z jaké IP se to přihlásilo" se hodí i zpětně.
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await getDb()
    .delete(adminSessions)
    .where(or(lt(adminSessions.expiresAt, cutoff), lt(adminSessions.revokedAt, cutoff)))
    .returning({ id: adminSessions.id });
  return rows.length;
}
