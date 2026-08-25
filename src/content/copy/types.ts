import type { Locale } from "@/lib/i18n/config";

/** Jedna věta ve třech jazycích. */
export type Line = Record<Locale, string>;
/** Seznam vět ve třech jazycích — musí mít ve všech jazycích stejnou délku. */
export type Lines = Record<Locale, readonly string[]>;

/**
 * Texty stránek leží po jednom souboru na stránku (`src/content/copy/*.ts`).
 * Rozhodnutí: v JSX zůstane jen struktura a `c("klic")`, nikdy holá věta.
 * Jinak se při dalším překladu musí prolézat layout — a to je přesně ta
 * práce, po které vzniknou půl přeložené stránky.
 */
export function copyFor<T extends Record<string, Line>>(table: T, locale: Locale) {
  return (key: keyof T): string => table[key][locale];
}

export function listFor<T extends Record<string, Lines>>(table: T, locale: Locale) {
  return (key: keyof T): readonly string[] => table[key][locale];
}
