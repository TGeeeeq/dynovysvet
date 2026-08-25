/**
 * Registr editovatelných textů webu.
 *
 * DOČASNÝ STUB. Výchozí znění všech bloků patří sem – databáze drží jen
 * odchylky, takže dokud je registr prázdný, administrace nemá co nabídnout
 * k editaci a web jede na textech napsaných napevno v komponentách.
 *
 * Naplnění (rozpad stávajících stránek do bloků) dělá někdo jiný; tenhle soubor
 * existuje proto, aby na něj šlo mezitím typově navázat.
 *
 * Konvence klíčů: `key` je jméno bloku v rámci stránky (bez prefixu). Klíč
 * v databázi vzniká složením `"<stránka>:<blok>"` – viz `src/lib/db/content.ts`.
 */

export type ContentBlockDef = {
  /** Jméno bloku v rámci stránky, např. `hero_nadpis`. Malá písmena, číslice, `_`, `-`, `.`. */
  key: string;
  /** Popisek pole v administraci. */
  label: string;
  /** Volitelné seskupení polí v editoru (sekce stránky). */
  group?: string;
  /** true ⇒ v administraci se vykreslí textarea místo jednořádkového inputu. */
  multiline?: boolean;
  cs: string;
  en: string;
  de: string;
};

export const CONTENT_PAGES: Record<string, ContentBlockDef[]> = {};
