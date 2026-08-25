/**
 * Trojjazyčný web, čeština je primární.
 *
 * Rozhodnutí, ze kterého plyne všechno ostatní: **jazyk je v cestě, ne v cookie.**
 * Cookie by znamenala, že jedna URL vrací tři různé obsahy — vyhledávače by
 * indexovaly jen jednu verzi a sdílený odkaz by se příteli otevřel jinak než
 * odesílateli. Statek přitom žije z toho, že ho lidé najdou v Google přesně
 * v tom týdnu, kdy se rozhodují, kam v sobotu vyrazit.
 *
 * Čeština běží na kořeni (`/vstupenky`), ne na `/cs/vstupenky` — staré adresy
 * z Webnode i všechny zpětné odkazy míří tam a přesměrovávat je navíc o jeden
 * skok by bylo zbytečné plýtvání.
 */

export const LOCALES = ["cs", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "cs";

/** Jazyky s vlastním prefixem v cestě. Čeština prefix nemá. */
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Hodnota do `<html lang>` a do `hreflang`. */
export const HTML_LANG: Record<Locale, string> = {
  cs: "cs",
  en: "en",
  de: "de",
};

/** Hodnota do OpenGraph `og:locale`. */
export const OG_LOCALE: Record<Locale, string> = {
  cs: "cs_CZ",
  en: "en_GB",
  de: "de_DE",
};

/** Jak se jazyk jmenuje sám o sobě — v přepínači nikdy nepřekládáme názvy jazyků. */
export const LOCALE_NAME: Record<Locale, string> = {
  cs: "Čeština",
  en: "English",
  de: "Deutsch",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  cs: "CZ",
  en: "EN",
  de: "DE",
};

/**
 * Peníze zobrazujeme vždy v korunách — statek jinou měnu nepřijímá a přepočet
 * na eura by u pokladny sliboval něco, co brána neumí. Liší se jen formát.
 */
export const NUMBER_LOCALE: Record<Locale, string> = {
  cs: "cs-CZ",
  en: "en-GB",
  de: "de-DE",
};

/** Vybere hodnotu pro daný jazyk z trojice; chybějící překlad padá na češtinu. */
export function pick<T>(locale: Locale, values: Partial<Record<Locale, T>> & { cs: T }): T {
  return values[locale] ?? values.cs;
}
