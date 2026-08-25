import type { Locale } from "@/lib/i18n/config";
import { RECIPES, type Recipe } from "./recipes";
import { RECIPES_EN } from "./recipes.en";
import { RECIPES_DE } from "./recipes.de";
import { GROWING, GROWING_INTRO, type GrowingSection } from "./growing";
import { GROWING_EN, GROWING_INTRO_EN } from "./growing.en";
import { GROWING_DE, GROWING_INTRO_DE } from "./growing.de";
import { LEGAL, type LegalDoc } from "./legal";
import { LEGAL_EN } from "./legal.en";
import { LEGAL_DE } from "./legal.de";

/**
 * Jedno místo, kde se z jazyka stane obsah. Překlady leží v samostatných
 * souborech (`*.en.ts`, `*.de.ts`) záměrně: stránka se pak nemusí prokousávat
 * trojicemi `{cs, en, de}` u každé věty a překladatel dostane soubor, který
 * se dá porovnat řádek po řádku s originálem.
 *
 * Struktura polí je ve všech jazycích shodná (stejné `slug`, stejné pořadí,
 * stejný počet položek) — hlídá to test `tests/content-parity.test.ts`.
 */

export function recipesFor(locale: Locale): Recipe[] {
  if (locale === "en") return RECIPES_EN;
  if (locale === "de") return RECIPES_DE;
  return RECIPES;
}

export function growingFor(locale: Locale): { intro: string; sections: GrowingSection[] } {
  if (locale === "en") return { intro: GROWING_INTRO_EN, sections: GROWING_EN };
  if (locale === "de") return { intro: GROWING_INTRO_DE, sections: GROWING_DE };
  return { intro: GROWING_INTRO, sections: GROWING };
}

export function legalFor(locale: Locale): { terms: LegalDoc; privacy: LegalDoc } {
  if (locale === "en") return LEGAL_EN;
  if (locale === "de") return LEGAL_DE;
  return LEGAL;
}
