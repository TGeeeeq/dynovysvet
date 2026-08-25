/**
 * Editovatelné texty stránek.
 *
 * Model: výchozí znění žije v kódu (`src/content/blocks`), databáze drží jen
 * skutečné odchylky. Důvod je praktický – při redesignu se texty v kódu mění
 * a kdyby v DB ležela kopie všech, přebila by je stará verze a nikdo by nechápal
 * proč. Blok, který se zpátky srovná s výchozím textem, se proto z DB maže.
 *
 * Čtení nikdy neshodí web: výpadek databáze i chybějící tabulka končí výchozími
 * texty. Návštěvník uvidí web napsaný v kódu, ne chybovou stránku.
 */
import { eq, inArray, like } from 'drizzle-orm';

import { getDb, hasDatabaseUrl } from './client';
import { contentBlocks } from './schema';
import { CONTENT_PAGES, type ContentBlockDef } from '../../content/blocks';

export type ContentLocale = 'cs' | 'en' | 'de';

/** Hodnoty jednoho bloku ve všech jazycích; `null` = beze změny proti výchozímu textu. */
export type BlockOverride = { cs: string | null; en: string | null; de: string | null };

/** Čtečka textů jedné stránky. Vrací vždy string – chybějící překlad padá na češtinu. */
export type ContentReader = (blockKey: string, locale: ContentLocale) => string;

/** Klíč v databázi je `"<stránka>:<blok>"`; v registru i v šablonách se používá holý název bloku. */
export function contentKey(page: string, blockKey: string): string {
  return blockKey.startsWith(`${page}:`) ? blockKey : `${page}:${blockKey}`;
}

function blocksOf(page: string): ContentBlockDef[] {
  return CONTENT_PAGES[page] ?? [];
}

function defaultOf(def: ContentBlockDef, locale: ContentLocale): string {
  // Prázdný překlad bereme jako chybějící – anglická stránka s prázdným nadpisem
  // vypadá jako rozbitá, česká věta ne.
  const value = def[locale];
  return value.length > 0 ? value : def.cs;
}

/**
 * Načte texty stránky a vrátí čtečku.
 *
 * Jeden dotaz na stránku, ne na blok. Volá se ze Server Componenty, výsledek se
 * dá držet v proměnné a použít u všech nadpisů na stránce.
 */
export async function getPageContent(page: string): Promise<ContentReader> {
  const defs = blocksOf(page);
  const byKey = new Map(defs.map((d) => [d.key, d]));
  const overrides = await getPageOverrides(page);

  return (blockKey: string, locale: ContentLocale): string => {
    const local = blockKey.startsWith(`${page}:`) ? blockKey.slice(page.length + 1) : blockKey;
    const def = byKey.get(local);

    const override = overrides.get(local)?.[locale];
    if (override !== null && override !== undefined && override.length > 0) return override;

    if (!def) {
      // Blok, který v registru není: v provozu je lepší prázdné místo než výjimka,
      // ale v logu to musí být vidět, ať se to opraví.
      console.error(`[db/content] blok "${contentKey(page, local)}" není v registru výchozích textů.`);
      return '';
    }
    return defaultOf(def, locale);
  };
}

/**
 * Jen to, co skutečně leží v databázi. Administrace to potřebuje, aby uměla
 * odlišit „upraveno" od „výchozí" a nabídnout návrat k původnímu textu.
 */
export async function getPageOverrides(page: string): Promise<Map<string, BlockOverride>> {
  const out = new Map<string, BlockOverride>();
  if (!hasDatabaseUrl()) return out;

  const defs = blocksOf(page);

  try {
    const db = getDb();
    const rows =
      defs.length > 0
        ? await db
            .select({ key: contentBlocks.key, cs: contentBlocks.cs, en: contentBlocks.en, de: contentBlocks.de })
            .from(contentBlocks)
            .where(inArray(contentBlocks.key, defs.map((d) => contentKey(page, d.key))))
        : // Registr zatím nemusí být naplněný – v tom případě posbíráme, co v DB
          // pro stránku je, ať se ručně vložené bloky neztratí. `%` v názvu
          // stránky nepřipouštíme, aby to nebyl LIKE injection.
          await db
            .select({ key: contentBlocks.key, cs: contentBlocks.cs, en: contentBlocks.en, de: contentBlocks.de })
            .from(contentBlocks)
            .where(like(contentBlocks.key, `${page.replace(/[%_\\]/g, '')}:%`));

    for (const row of rows) {
      const local = row.key.startsWith(`${page}:`) ? row.key.slice(page.length + 1) : row.key;
      out.set(local, { cs: row.cs, en: row.en, de: row.de });
    }
  } catch (err) {
    console.error(`[db/content] čtení textů stránky "${page}" selhalo, beru výchozí:`, err);
  }

  return out;
}

export type SavePageResult = { ok: true; saved: number; deleted: number } | { ok: false; problem: string };

/** Vstup z editoru: blok → jazyk → text. Chybějící jazyk se nemění. */
export type PageContentInput = Record<string, Partial<Record<ContentLocale, string>>>;

/**
 * Uloží texty stránky.
 *
 * Blok, jehož všechny jazyky se shodují s výchozím textem, se z databáze MAŽE.
 * Bez toho by se v DB usadila kopie kódu a příští změna textu v repozitáři by
 * se na webu neprojevila – klasická past redakčních systémů.
 */
export async function savePageContent(
  page: string,
  values: PageContentInput,
  adminUserId: string | null,
): Promise<SavePageResult> {
  const defs = blocksOf(page);
  if (defs.length === 0) {
    return { ok: false, problem: 'Pro tuhle stránku zatím nejsou definované žádné editovatelné texty.' };
  }
  const byKey = new Map(defs.map((d) => [d.key, d]));

  const toUpsert: Array<{ key: string; cs: string | null; en: string | null; de: string | null }> = [];
  const toDelete: string[] = [];

  for (const [rawKey, input] of Object.entries(values)) {
    const local = rawKey.startsWith(`${page}:`) ? rawKey.slice(page.length + 1) : rawKey;
    const def = byKey.get(local);
    // Neznámý blok tiše ignorujeme – formulář může nést i pole, která mezitím
    // z registru vypadla, a odmítnout kvůli tomu celý zápis by bylo horší.
    if (!def) continue;

    const row = {
      key: contentKey(page, local),
      cs: pick(input.cs, def.cs),
      en: pick(input.en, def.en),
      de: pick(input.de, def.de),
    };

    if (row.cs === null && row.en === null && row.de === null) toDelete.push(row.key);
    else toUpsert.push(row);
  }

  if (toUpsert.length === 0 && toDelete.length === 0) return { ok: true, saved: 0, deleted: 0 };

  try {
    const db = getDb();
    const updatedAt = new Date();

    await db.transaction(async (tx) => {
      for (const row of toUpsert) {
        await tx
          .insert(contentBlocks)
          .values({ ...row, updatedAt, updatedBy: adminUserId })
          .onConflictDoUpdate({
            target: contentBlocks.key,
            set: { cs: row.cs, en: row.en, de: row.de, updatedAt, updatedBy: adminUserId },
          });
      }
      if (toDelete.length > 0) {
        await tx.delete(contentBlocks).where(inArray(contentBlocks.key, toDelete));
      }
    });

    return { ok: true, saved: toUpsert.length, deleted: toDelete.length };
  } catch (err) {
    console.error(`[db/content] uložení textů stránky "${page}" selhalo:`, err);
    return { ok: false, problem: 'Texty se nepodařilo uložit. Zkuste to prosím znovu.' };
  }
}

/** `null` znamená „stejné jako výchozí, do DB to nepatří". */
function pick(value: string | undefined, fallback: string): string | null {
  if (value === undefined) return null;
  const trimmed = value.replace(/\r\n/g, '\n');
  if (trimmed === fallback) return null;
  if (trimmed.trim().length === 0) return null;
  return trimmed;
}

/** Smaže všechny odchylky stránky – tlačítko „vrátit výchozí texty". */
export async function resetPageContent(page: string): Promise<number> {
  try {
    const rows = await getDb()
      .delete(contentBlocks)
      .where(like(contentBlocks.key, `${page.replace(/[%_\\]/g, '')}:%`))
      .returning({ key: contentBlocks.key });
    return rows.length;
  } catch (err) {
    console.error(`[db/content] reset stránky "${page}" selhal:`, err);
    return 0;
  }
}

/** Odchylky jednoho konkrétního bloku – administrace i náhled. */
export async function getBlockOverride(page: string, blockKey: string): Promise<BlockOverride | null> {
  if (!hasDatabaseUrl()) return null;
  try {
    const rows = await getDb()
      .select({ cs: contentBlocks.cs, en: contentBlocks.en, de: contentBlocks.de })
      .from(contentBlocks)
      .where(eq(contentBlocks.key, contentKey(page, blockKey)))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
