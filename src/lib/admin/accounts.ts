import "server-only";
import { randomInt } from "node:crypto";
import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import { checkPasswordStrength } from "./password";
import type { AdminRole } from "@/lib/db/schema";

/**
 * Dotazy kolem účtů, přihlášených zařízení a záznamu změn.
 *
 * Stejné pravidlo jako u `queries.ts`: bez připojené databáze se vrací prázdno,
 * ne výjimka. Administrace pak ukáže hlášku, ale nespadne — jinak by se
 * majitel po výpadku Neonu nedostal ani na stránku, kde je vidět, co se děje.
 *
 * Hash hesla z tohohle modulu odchází jedinou funkcí (`passwordHashOf`) a jen
 * proto, aby ho `verifyPassword` mohla porovnat. Nikam do UI, do stavu akce
 * ani do auditu nesmí.
 */

/* ------------------------------------------------------------------ účty */

export interface AccountRow {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  lastLoginAt: Date | null;
  failedAttempts: number;
  lockedUntil: Date | null;
  mustChangePassword: boolean;
  createdAt: Date;
  disabledAt: Date | null;
}

/** Sloupce vypisujeme ručně — `select()` nad celou tabulkou by tahal i hash hesla a TOTP. */
const ACCOUNT_COLUMNS = {
  id: schema.adminUsers.id,
  email: schema.adminUsers.email,
  name: schema.adminUsers.name,
  role: schema.adminUsers.role,
  lastLoginAt: schema.adminUsers.lastLoginAt,
  failedAttempts: schema.adminUsers.failedAttempts,
  lockedUntil: schema.adminUsers.lockedUntil,
  mustChangePassword: schema.adminUsers.mustChangePassword,
  createdAt: schema.adminUsers.createdAt,
  disabledAt: schema.adminUsers.disabledAt,
} as const;

/** Všichni, kdo se smí (nebo směli) přihlásit. Aktivní napřed, pak podle jména. */
export async function listAccounts(): Promise<AccountRow[]> {
  if (!hasDatabaseUrl()) return [];
  try {
    return await getDb()
      .select(ACCOUNT_COLUMNS)
      .from(schema.adminUsers)
      .orderBy(
        sql`${schema.adminUsers.disabledAt} is null desc`,
        sql`coalesce(${schema.adminUsers.name}, ${schema.adminUsers.email})`,
      );
  } catch (error) {
    console.error("Seznam účtů se nepodařilo načíst:", error);
    return [];
  }
}

export async function getAccount(id: string): Promise<AccountRow | null> {
  if (!hasDatabaseUrl()) return null;
  const [row] = await getDb()
    .select(ACCOUNT_COLUMNS)
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.id, id))
    .limit(1);
  return row ?? null;
}

/**
 * Hash hesla pro ověření současného hesla při jeho změně.
 *
 * Návratová hodnota nikdy nesmí opustit server — patří výhradně do
 * `verifyPassword`, nikam do stavu server action ani do HTML.
 */
export async function passwordHashOf(id: string): Promise<string | null> {
  if (!hasDatabaseUrl()) return null;
  const [row] = await getDb()
    .select({ passwordHash: schema.adminUsers.passwordHash })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.id, id))
    .limit(1);
  return row?.passwordHash ?? null;
}

/** Je e-mail už obsazený? Kontrolujeme dřív, než unique index vyhodí nesrozumitelnou chybu. */
export async function emailTaken(email: string): Promise<boolean> {
  if (!hasDatabaseUrl()) return false;
  const [row] = await getDb()
    .select({ id: schema.adminUsers.id })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email))
    .limit(1);
  return Boolean(row);
}

/**
 * Kolik zbývá činných majitelů, když nepočítáme jeden konkrétní účet.
 *
 * Tohle je pojistka proti tomu, aby se statek zamkl sám před sebou: kdyby
 * poslední majitel spadl na „zablokovaný" nebo „obsluha", nezůstal by nikdo,
 * kdo umí přístupy vrátit zpátky.
 */
export async function countOtherActiveOwners(exceptId: string): Promise<number> {
  if (!hasDatabaseUrl()) return 0;
  const [row] = await getDb()
    .select({ n: count() })
    .from(schema.adminUsers)
    .where(
      and(
        eq(schema.adminUsers.role, "majitel"),
        isNull(schema.adminUsers.disabledAt),
        sql`${schema.adminUsers.id} <> ${exceptId}`,
      ),
    );
  return row?.n ?? 0;
}

/* --------------------------------------------------------- zařízení */

export interface SessionRow {
  id: string;
  createdAt: Date;
  lastSeenAt: Date;
  ip: string | null;
  userAgent: string | null;
}

/** Živé přihlášení = neodvolané a nevypršelé. Vyprší samo, mazat se nemusí. */
export async function activeSessions(adminUserId: string): Promise<SessionRow[]> {
  if (!hasDatabaseUrl()) return [];
  try {
    return await getDb()
      .select({
        id: schema.adminSessions.id,
        createdAt: schema.adminSessions.createdAt,
        lastSeenAt: schema.adminSessions.lastSeenAt,
        ip: schema.adminSessions.ip,
        userAgent: schema.adminSessions.userAgent,
      })
      .from(schema.adminSessions)
      .where(
        and(
          eq(schema.adminSessions.adminUserId, adminUserId),
          isNull(schema.adminSessions.revokedAt),
          sql`${schema.adminSessions.expiresAt} > now()`,
        ),
      )
      .orderBy(desc(schema.adminSessions.lastSeenAt));
  } catch (error) {
    console.error("Přihlášená zařízení se nepodařilo načíst:", error);
    return [];
  }
}

/**
 * Z user-agentu udělá něco, co si člověk přečte: „Chrome na Androidu".
 *
 * Celý řetězec by v tabulce zabral tři řádky a stejně by z něj nikdo nic
 * nevyčetl. Jde jen o to poznat vlastní zařízení od cizího, ne o statistiku
 * prohlížečů — nepřesnost u exotického prohlížeče nevadí.
 */
export function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Neznámé zařízení";
  const ua = userAgent;

  const system = /Android/i.test(ua)
    ? "na Androidu"
    : /iPhone/i.test(ua)
      ? "na iPhonu"
      : /iPad/i.test(ua)
        ? "na iPadu"
        : /Windows/i.test(ua)
          ? "ve Windows"
          : /Macintosh|Mac OS X/i.test(ua)
            ? "na Macu"
            : /CrOS/i.test(ua)
              ? "na Chromebooku"
              : /Linux/i.test(ua)
                ? "na Linuxu"
                : "";

  // Pořadí je důležité: Edge i Opera se v user-agentu vydávají za Chrome
  // a Chrome se vydává za Safari. Kdo se hlásí dřív, ten platí.
  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\/|Opera/i.test(ua)
      ? "Opera"
      : /SamsungBrowser/i.test(ua)
        ? "Samsung Internet"
        : /Firefox\//i.test(ua)
          ? "Firefox"
          : /Chrome\//i.test(ua)
            ? "Chrome"
            : /Safari\//i.test(ua)
              ? "Safari"
              : "";

  if (!browser && !system) return "Neznámé zařízení";
  if (!browser) return `Prohlížeč ${system}`;
  return system ? `${browser} ${system}` : browser;
}

/* ------------------------------------------------------- počáteční heslo */

/**
 * Abeceda bez zaměnitelných znaků. Heslo se předává nahlas do telefonu nebo
 * se opisuje z papírku — nula proti velkému O a jednička proti malému l jsou
 * tam, kde se to zaručeně splete.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const GROUPS = 4;
const GROUP_LENGTH = 4;

/**
 * Vygeneruje počáteční heslo (16 znaků ve čtyřech skupinách po čtyřech).
 *
 * Generuje ho server, ne člověk: heslo, které někdo vymyslí u telefonu, je
 * vždycky „Statek2025". Pomlčky jsou kvůli diktování; do politiky se počítají
 * jako další druh znaku, takže heslo projde i kdyby náhoda dala samá písmena.
 *
 * `randomInt` z `node:crypto`, ne `Math.random` — ta je předvídatelná a heslo
 * ze slabého generátoru je horší než žádné, protože vypadá bezpečně.
 */
export function generateInitialPassword(): string {
  // Politika hesel se může zpřísnit; radši vygenerujeme jiné heslo, než
  // abychom založili účet s heslem, které vlastní kontrolou neprojde.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const groups: string[] = [];
    for (let g = 0; g < GROUPS; g += 1) {
      let chunk = "";
      for (let i = 0; i < GROUP_LENGTH; i += 1) {
        chunk += ALPHABET[randomInt(ALPHABET.length)];
      }
      groups.push(chunk);
    }
    const password = groups.join("-");
    if (checkPasswordStrength(password).ok) return password;
  }
  throw new Error("Nepodařilo se vygenerovat heslo vyhovující politice.");
}

/* ----------------------------------------------------------- záznam změn */

/**
 * Překlad kódů akcí do češtiny.
 *
 * V tabulce nemá být `order.refund`, ale „Vrácení peněz" — záznam čte majitel,
 * ne programátor. Kód, který tu není (nová sekce, cizí automat), se ukáže tak,
 * jak je: lepší nesrozumitelný kód než tichý zámlk o tom, že se něco stalo.
 */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  "admin.login": "Přihlášení",
  "admin.logout": "Odhlášení",
  "admin.password.change": "Změna vlastního hesla",
  "admin.profile.update": "Změna vlastního jména",
  "admin.sessions.revoke": "Odhlášení ostatních zařízení",
  "admin.user.create": "Založení přístupu",
  "admin.user.password.reset": "Nové heslo pro člověka",
  "admin.user.disable": "Zablokování přístupu",
  "admin.user.enable": "Odblokování přístupu",
  "admin.user.unlock": "Odemčení po neúspěšných pokusech",
  "admin.user.role": "Změna role",
  "order.refund": "Vrácení peněz",
  "order.cancel": "Zrušení objednávky",
  "order.update": "Úprava objednávky",
  "order.resend": "Znovuodeslání vstupenek",
  "ticket.checkin": "Odbavení vstupenky u brány",
  "inquiry.handled": "Vyřízení poptávky",
  "settings.update": "Změna nastavení",
  "pricing.update": "Změna ceníku",
  "season.update": "Změna sezóny a otevírací doby",
  "content.update": "Úprava textů webu",
  "news.create": "Nová aktualita",
  "news.update": "Úprava aktuality",
  "news.delete": "Smazání aktuality",
};

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

export interface AuditRow {
  id: string;
  createdAt: Date;
  action: string;
  entity: string | null;
  entityId: string | null;
  detail: unknown;
  ip: string | null;
  userName: string | null;
  userEmail: string | null;
}

export interface AuditFilter {
  action?: string;
  adminUserId?: string;
  page: number;
}

export const AUDIT_PAGE_SIZE = 100;

export interface AuditPage {
  rows: AuditRow[];
  total: number;
  page: number;
  pageCount: number;
}

const EMPTY_PAGE: AuditPage = { rows: [], total: 0, page: 1, pageCount: 1 };

export async function listAudit(filter: AuditFilter): Promise<AuditPage> {
  if (!hasDatabaseUrl()) return EMPTY_PAGE;

  const page = Math.max(1, Math.floor(filter.page) || 1);

  try {
    const db = getDb();
    const where = and(
      filter.action ? eq(schema.auditLog.action, filter.action) : undefined,
      filter.adminUserId ? eq(schema.auditLog.adminUserId, filter.adminUserId) : undefined,
    );

    const [totalRow] = await db.select({ n: count() }).from(schema.auditLog).where(where);
    const total = totalRow?.n ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));
    // Stránka za koncem seznamu (ručně přepsaná adresa) se srovná na poslední.
    const safePage = Math.min(page, pageCount);

    const rows = await db
      .select({
        id: schema.auditLog.id,
        createdAt: schema.auditLog.createdAt,
        action: schema.auditLog.action,
        entity: schema.auditLog.entity,
        entityId: schema.auditLog.entityId,
        detail: schema.auditLog.detail,
        ip: schema.auditLog.ip,
        // LEFT JOIN: záznam přežije i účet, na který ukazuje (`ON DELETE SET NULL`).
        userName: schema.adminUsers.name,
        userEmail: schema.adminUsers.email,
      })
      .from(schema.auditLog)
      .leftJoin(schema.adminUsers, eq(schema.adminUsers.id, schema.auditLog.adminUserId))
      .where(where)
      .orderBy(desc(schema.auditLog.createdAt))
      .limit(AUDIT_PAGE_SIZE)
      .offset((safePage - 1) * AUDIT_PAGE_SIZE);

    return { rows, total, page: safePage, pageCount };
  } catch (error) {
    console.error("Záznam změn se nepodařilo načíst:", error);
    return EMPTY_PAGE;
  }
}

/**
 * Které akce se v záznamu vůbec vyskytují.
 *
 * Nabídka filtru se staví z dat, ne z mapy překladů — jinak by ve výběru
 * chyběla akce, kterou přidala jiná část administrace a nikdo ji sem
 * nedopsal.
 */
export async function auditActionsInUse(): Promise<string[]> {
  if (!hasDatabaseUrl()) return [];
  try {
    const rows = await getDb()
      .selectDistinct({ action: schema.auditLog.action })
      .from(schema.auditLog)
      .orderBy(schema.auditLog.action);
    return rows.map((r) => r.action);
  } catch (error) {
    console.error("Seznam akcí se nepodařilo načíst:", error);
    return [];
  }
}
