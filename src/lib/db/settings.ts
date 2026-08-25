/**
 * Provozní nastavení.
 *
 * Tabulka `settings` je schválně netypovaná (key/jsonb), typovou kontrolu dělá
 * zod tady v aplikaci. Přidat přepínač tak znamená přidat řádek do
 * `SETTINGS_SCHEMA`, ne psát migraci.
 *
 * Železné pravidlo: čtení nastavení NIKDY neshodí web. Chybějící tabulka
 * (nespuštěná migrace), výpadek Neonu i podvržená hodnota v databázi končí
 * výchozí hodnotou z kódu. Nastavení je konfigurace, ne data – bez něj se dá
 * jet dál, jen podle výchozích čísel.
 */
import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';

import { getDb, hasDatabaseUrl } from './client';
import { settings } from './schema';

export const SETTINGS_SCHEMA = {
  /** Hlavní vypínač prodeje. Vypnutím se e-shop schová, web běží dál. */
  'prodej.zapnut': z.boolean(),
  /** Jak dlouho držíme místa v košíku, než je vrátíme do prodeje. */
  'prodej.hold_minut': z.number().int().min(5).max(60),
  /** Kolik vstupenek smí jedna objednávka obsahovat – brzda proti překupníkům. */
  'prodej.max_kusu_objednavka': z.number().int().min(1).max(100),
  'sezona.nazev': z.string(),
  /** Kapacita, kterou dostane nově vygenerovaná časovka. */
  'kapacita.vychozi': z.number().int().min(1).max(1000),
  'email.potvrzeni_podpis': z.string(),
  /** O kolik minut smí návštěvník dorazit mimo svou časovku, aniž ho brána odmítne. */
  'brana.tolerance_minut': z.number().int().min(0).max(240),
  /** Hláška na hlavičce webu (uzavírka, změna otevírací doby). Prázdné = nic se nezobrazí. */
  'web.oznameni': z.string(),
  /** Adresa, na kterou chodí upozornění na ruční refundy. */
  'provoz.alert_email': z.string(),
} as const;

export type SettingsSchema = typeof SETTINGS_SCHEMA;
export type SettingKey = keyof SettingsSchema;
export type SettingValue<K extends SettingKey> = z.infer<SettingsSchema[K]>;
/** Kompletní sada nastavení – co není v DB, přijde z `SETTINGS_DEFAULTS`. */
export type AllSettings = { [K in SettingKey]: SettingValue<K> };

/**
 * Výchozí hodnoty. Jsou zároveň fallbackem při chybě databáze, takže musí dávat
 * smysl i jako jediná pravda: web s prázdnou tabulkou `settings` musí fungovat.
 */
export const SETTINGS_DEFAULTS: AllSettings = {
  'prodej.zapnut': true,
  // 15 min odpovídá výchozímu TTL holdu v rezervačním jádře.
  'prodej.hold_minut': 15,
  'prodej.max_kusu_objednavka': 20,
  'sezona.nazev': 'Dýňový svět',
  'kapacita.vychozi': 60,
  'email.potvrzeni_podpis': 'Těšíme se na vás!\nStatek u Pipků, Nová Ves',
  'brana.tolerance_minut': 30,
  'web.oznameni': '',
  'provoz.alert_email': '',
};

export const SETTING_KEYS = Object.keys(SETTINGS_SCHEMA) as SettingKey[];

export function isSettingKey(key: string): key is SettingKey {
  return Object.prototype.hasOwnProperty.call(SETTINGS_SCHEMA, key);
}

/** Hodnota z DB projde zodem; co neprojde, je poškozený záznam a bere se výchozí. */
function parseOrDefault<K extends SettingKey>(key: K, raw: unknown): SettingValue<K> {
  const parsed = SETTINGS_SCHEMA[key].safeParse(raw);
  if (parsed.success) return parsed.data as SettingValue<K>;
  console.error(`[db/settings] hodnota "${key}" v databázi neodpovídá schématu, beru výchozí.`);
  return SETTINGS_DEFAULTS[key];
}

/** Jedno nastavení. Při jakékoli chybě vrací výchozí hodnotu. */
export async function getSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  if (!hasDatabaseUrl()) return SETTINGS_DEFAULTS[key];

  try {
    const rows = await getDb()
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    const row = rows[0];
    if (!row) return SETTINGS_DEFAULTS[key];
    return parseOrDefault(key, row.value);
  } catch (err) {
    console.error(`[db/settings] čtení "${key}" selhalo, beru výchozí:`, err);
    return SETTINGS_DEFAULTS[key];
  }
}

/**
 * Všechna nastavení jedním dotazem. Administrace i layout webu potřebují víc
 * hodnot naráz a `getSetting()` v cyklu by znamenalo dotaz na každou z nich.
 */
export async function getAllSettings(): Promise<AllSettings> {
  const out: AllSettings = { ...SETTINGS_DEFAULTS };
  if (!hasDatabaseUrl()) return out;

  try {
    const rows = await getDb()
      .select({ key: settings.key, value: settings.value })
      .from(settings)
      .where(inArray(settings.key, SETTING_KEYS));

    for (const row of rows) {
      if (!isSettingKey(row.key)) continue;
      // Přiřazení přes pomocnou funkci – TypeScript by jinak nespojil klíč
      // s typem hodnoty napříč sjednocením klíčů.
      assign(out, row.key, row.value);
    }
  } catch (err) {
    console.error('[db/settings] čtení nastavení selhalo, beru výchozí:', err);
  }

  return out;
}

function assign<K extends SettingKey>(target: AllSettings, key: K, raw: unknown): void {
  // Zápis vedeme přes rozšířený pohled na objekt: TypeScript neumí u generického
  // klíče ověřit, že hodnota patří právě k němu, i když to z `parseOrDefault`
  // plyne. Kontrolu typu tu dělá zod, ne kompilátor.
  const widened = target as Record<SettingKey, SettingValue<SettingKey>>;
  widened[key] = parseOrDefault(key, raw);
}

export type SetSettingResult = { ok: true } | { ok: false; problem: string };

/**
 * Zápis nastavení. Validuje se PŘED uložením – neplatná hodnota se do databáze
 * vůbec nedostane, takže čtení nemusí řešit historické nesmysly.
 */
export async function setSetting<K extends SettingKey>(
  key: K,
  value: unknown,
  adminUserId: string | null,
): Promise<SetSettingResult> {
  const parsed = SETTINGS_SCHEMA[key].safeParse(value);
  if (!parsed.success) {
    return { ok: false, problem: `Hodnota nastavení „${key}" není platná.` };
  }

  try {
    await getDb()
      .insert(settings)
      .values({ key, value: parsed.data, updatedAt: new Date(), updatedBy: adminUserId })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: parsed.data, updatedAt: new Date(), updatedBy: adminUserId },
      });
    return { ok: true };
  } catch (err) {
    console.error(`[db/settings] zápis "${key}" selhal:`, err);
    return { ok: false, problem: 'Nastavení se nepodařilo uložit. Zkuste to prosím znovu.' };
  }
}
