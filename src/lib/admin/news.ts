import "server-only";
import { desc, eq, sql } from "drizzle-orm";

import { getDb, hasDatabaseUrl } from "@/lib/db/client";
import { news, type NewsItem } from "@/lib/db/schema";

/**
 * Aktuality — dotazy a převody času pro administraci.
 *
 * Dvě věci, na kterých to celé stojí:
 *
 * 1. **Bez databáze se nepadá.** Administrace se otevírá i na stroji bez
 *    `DATABASE_URL` (build, náhled) a musí ukázat prázdný seznam, ne chybu.
 *
 * 2. **Čas počítá majitel podle toho, co je za oknem.** V databázi leží
 *    `timestamptz`, ve formuláři je ale holé „20. 9. 2026, 10:00" bez zóny.
 *    Převod tam i zpět proto vede přes Europe/Prague — jinak by se aktualita
 *    naplánovaná na desátou zveřejnila v létě v poledne.
 */

export type { NewsItem };

/** Řádek do seznamu. Tělo článku se do výpisu netahá, je zbytečně dlouhé. */
export type NewsRow = {
  id: string;
  slug: string;
  titleCs: string;
  publishedAt: Date | null;
  pinnedUntil: Date | null;
};

/** Hodnoty, které přijdou z formuláře po validaci zodem. */
export type NewsInput = {
  slug: string;
  titleCs: string;
  titleEn: string | null;
  titleDe: string | null;
  bodyCs: string;
  bodyEn: string | null;
  bodyDe: string | null;
  publishedAt: Date | null;
  pinnedUntil: Date | null;
  imagePath: string | null;
};

export type NewsResult = { ok: true; id: string } | { ok: false; problem: string };

/* ------------------------------------------------------------------ čtení */

/**
 * Všechny aktuality, nejnovější nahoře. Koncepty (bez data zveřejnění) patří
 * úplně nahoru — jsou to rozdělané věci, které čekají na dokončení.
 */
export async function listNews(): Promise<NewsRow[]> {
  if (!hasDatabaseUrl()) return [];
  try {
    return await getDb()
      .select({
        id: news.id,
        slug: news.slug,
        titleCs: news.titleCs,
        publishedAt: news.publishedAt,
        pinnedUntil: news.pinnedUntil,
      })
      .from(news)
      .orderBy(sql`${news.publishedAt} desc nulls first`, desc(news.createdAt));
  } catch (err) {
    console.error("[admin/news] výpis aktualit selhal:", err);
    return [];
  }
}

export async function getNews(id: string): Promise<NewsItem | null> {
  if (!hasDatabaseUrl() || !isUuid(id)) return null;
  try {
    const rows = await getDb().select().from(news).where(eq(news.id, id)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error(`[admin/news] načtení aktuality "${id}" selhalo:`, err);
    return null;
  }
}

/** Chráníme se před `invalid input syntax for type uuid` z ručně zadané adresy. */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/* ------------------------------------------------------------------ zápis */

export async function createNews(input: NewsInput): Promise<NewsResult> {
  if (!hasDatabaseUrl()) return { ok: false, problem: NO_DB };
  try {
    const rows = await getDb().insert(news).values(input).returning({ id: news.id });
    const id = rows[0]?.id;
    if (!id) return { ok: false, problem: "Aktualitu se nepodařilo uložit." };
    return { ok: true, id };
  } catch (err) {
    return { ok: false, problem: writeProblem(err, "založení") };
  }
}

export async function updateNews(id: string, input: NewsInput): Promise<NewsResult> {
  if (!hasDatabaseUrl()) return { ok: false, problem: NO_DB };
  if (!isUuid(id)) return { ok: false, problem: "Taková aktualita neexistuje." };
  try {
    const rows = await getDb()
      .update(news)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(news.id, id))
      .returning({ id: news.id });
    const found = rows[0]?.id;
    if (!found) return { ok: false, problem: "Taková aktualita už neexistuje." };
    return { ok: true, id: found };
  } catch (err) {
    return { ok: false, problem: writeProblem(err, "uložení") };
  }
}

export async function removeNews(id: string): Promise<boolean> {
  if (!hasDatabaseUrl() || !isUuid(id)) return false;
  try {
    const rows = await getDb().delete(news).where(eq(news.id, id)).returning({ id: news.id });
    return rows.length > 0;
  } catch (err) {
    console.error(`[admin/news] smazání aktuality "${id}" selhalo:`, err);
    return false;
  }
}

const NO_DB = "Databáze není připojená, takže se nedá nic uložit.";

/**
 * Unikátnost adresy hlídá index v databázi, ne dotaz předem — mezi kontrolou
 * a zápisem se dá vklínit druhý požadavek a duplicita by prošla. Konflikt
 * proto překládáme až tady, z chyby.
 */
function writeProblem(err: unknown, what: string): string {
  const text = err instanceof Error ? err.message : String(err);
  if (text.includes("news_slug_key") || text.includes("duplicate key")) {
    return "Tuhle adresu už má jiná aktualita. Zvolte prosím jinou.";
  }
  console.error(`[admin/news] ${what} aktuality selhalo:`, err);
  return "Aktualitu se nepodařilo uložit. Zkuste to prosím znovu.";
}

/* ------------------------------------------------------------------ adresa */

/**
 * Adresa aktuality z českého nadpisu: bez diakritiky, malá písmena, pomlčky.
 * Diakritiku odstraňujeme rozkladem na písmeno + znaménko (NFD) a smazáním
 * znamének — tabulka náhrad by se u každého dalšího jazyka musela dopisovat.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/* -------------------------------------------------------------------- čas */

const PRAGUE = "Europe/Prague";

/** „2026-09-20 10:00:00" pro daný okamžik v pražském čase. */
function pragueParts(at: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: PRAGUE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(at);
}

/** Hodnota do `<input type="datetime-local">`, tedy pražský čas bez zóny. */
export function toDateTimeInput(at: Date | null): string {
  if (!at) return "";
  return pragueParts(at).replace(" ", "T").slice(0, 16);
}

/** Hodnota do `<input type="date">`. */
export function toDateInput(at: Date | null): string {
  if (!at) return "";
  return pragueParts(at).slice(0, 10);
}

/**
 * Opak `toDateTimeInput`. Posun zóny se hledá ve dvou krocích: první odhad
 * může padnout těsně vedle přechodu na letní čas a vzít o hodinu vedlejší
 * posun, druhý průchod už počítá s posunem platným ve správný okamžik.
 */
function fromPrague(naive: string): Date | null {
  const base = Date.parse(`${naive}Z`);
  if (Number.isNaN(base)) return null;
  const offset = (instant: number) => Date.parse(`${pragueParts(new Date(instant)).replace(" ", "T")}Z`) - instant;
  const first = base - offset(base);
  const at = new Date(base - offset(first));
  return Number.isNaN(at.getTime()) ? null : at;
}

/** „2026-09-20T10:00" v pražském čase → okamžik. */
export function fromDateTimeInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  return fromPrague(`${value}:00`);
}

/**
 * „2026-09-20" → konec toho dne v Praze. Připnutí „do 20. 9." má majiteli
 * držet aktualitu nahoře celý dvacátý, ne ji sundat o půlnoci na jeho začátku.
 */
export function endOfPragueDay(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return fromPrague(`${value}T23:59:59`);
}

/* ------------------------------------------------------------------ stavy */

export type NewsState = { label: string; tone: "neutral" | "ok" | "warn" };

/** Stav aktuality česky — v tabulce nemají být data, ale odpověď. */
export function newsState(item: { publishedAt: Date | null; pinnedUntil: Date | null }): NewsState {
  const now = Date.now();
  if (!item.publishedAt) return { label: "koncept", tone: "neutral" };
  if (item.publishedAt.getTime() > now) return { label: "naplánováno", tone: "warn" };
  if (item.pinnedUntil && item.pinnedUntil.getTime() > now) return { label: "nahoře", tone: "ok" };
  return { label: "zveřejněno", tone: "ok" };
}
