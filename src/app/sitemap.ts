import type { MetadataRoute } from "next";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { ROUTE_KEYS, alternates, href, type RouteKey } from "@/lib/i18n/routes";
import { isGateEnabled } from "@/lib/security/site-gate";

const BASE = "https://www.dynovysvet.cz";

/**
 * Priority nejsou libovolné: vstupenky a Dýňový svět jsou to, kvůli čemu
 * na web lidé v sezóně chodí, recepty a pěstování zase přivádějí návštěvnost
 * po zbytek roku.
 *
 * Každá adresa nese `alternates.languages` — bez toho by Google tři mutace
 * bral jako tři konkurenční stránky a jednu z nich zahodil.
 */
const WEIGHT: Record<RouteKey, [priority: number, freq: MetadataRoute.Sitemap[number]["changeFrequency"]]> = {
  home: [1, "weekly"],
  pumpkinWorld: [0.9, "weekly"],
  tickets: [0.9, "daily"],
  schools: [0.8, "monthly"],
  venue: [0.6, "monthly"],
  fleaMarket: [0.6, "monthly"],
  recipes: [0.7, "monthly"],
  growing: [0.7, "monthly"],
  contact: [0.6, "yearly"],
  terms: [0.2, "yearly"],
  privacy: [0.2, "yearly"],
};

export default function sitemap(): MetadataRoute.Sitemap {
  // Zamčený web nenabízí mapu adres. Statické soubory jdou mimo `src/proxy.ts`,
  // takže by ji jinak dostal i ten, koho zámek nepustil na jedinou stránku.
  if (isGateEnabled()) return [];

  const now = new Date();

  return ROUTE_KEYS.flatMap((key) => {
    const [priority, changeFrequency] = WEIGHT[key];
    const alts = alternates(key);
    const languages = Object.fromEntries(
      LOCALES.map((l) => [l, `${BASE}${alts[l]}`]),
    ) as Record<string, string>;
    languages["x-default"] = `${BASE}${alts[DEFAULT_LOCALE]}`;

    return LOCALES.map((locale) => ({
      url: `${BASE}${href(key, locale)}`,
      lastModified: now,
      changeFrequency,
      // Cizojazyčné mutace jsou doplňkové — pro statek na Vysočině je čeština
      // to hlavní a takhle to říkáme i vyhledávači.
      priority: locale === DEFAULT_LOCALE ? priority : Math.round(priority * 0.7 * 10) / 10,
      alternates: { languages },
    }));
  });
}
