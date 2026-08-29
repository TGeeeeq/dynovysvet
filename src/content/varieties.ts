import type { Locale } from "@/lib/i18n/config";

/**
 * Odrůdy, které statek pěstuje.
 *
 * Latinský název a hmotnost se nepřekládají — jsou to údaje, ne text.
 *
 * `photo` je zatím prázdné u všech. Až dorazí fotky jednotlivých odrůd,
 * doplní se sem základ názvu souboru z `/public/foto` a mřížka se sama
 * přepne z rejstříku na fotografickou. Do té doby tu vědomě nestojí fotka
 * hromady dýní pod jménem konkrétní odrůdy — to by byla nepravda, ne
 * ilustrace.
 */
export interface Variety {
  slug: string;
  name: Record<Locale, string>;
  latin: string;
  weight: string;
  use: Record<Locale, string>;
  /** Základ názvu souboru v `/public/foto`, bez šířky a přípony. */
  photo?: string;
}

export const VARIETIES: readonly Variety[] = [
  {
    slug: "hokkaido",
    name: { cs: "Hokaido", en: "Hokkaido", de: "Hokkaido" },
    latin: "Cucurbita maxima",
    weight: "1–2 kg",
    use: {
      cs: "polévka, pečení i se slupkou",
      en: "soup, roasting — skin and all",
      de: "Suppe, Braten samt Schale",
    },
  },
  {
    slug: "maslova",
    name: { cs: "Máslová", en: "Butternut", de: "Butternusskürbis" },
    latin: "Cucurbita moschata",
    weight: "1–3 kg",
    use: { cs: "krémové polévky, pyré", en: "creamy soups, purée", de: "Cremesuppen, Püree" },
  },
  {
    slug: "halloweenska",
    name: { cs: "Halloweenská", en: "Halloween pumpkin", de: "Halloween-Kürbis" },
    latin: "Cucurbita pepo",
    weight: "4–8 kg",
    use: { cs: "vyřezávání, dekorace", en: "carving, decoration", de: "Schnitzen, Dekoration" },
  },
  {
    slug: "muskatova",
    name: { cs: "Muškátová", en: "Musquée de Provence", de: "Muskatkürbis" },
    latin: "Cucurbita moschata",
    weight: "3–10 kg",
    use: {
      cs: "vaření, sladké i slané",
      en: "cooking, sweet and savoury alike",
      de: "Kochen, süß wie herzhaft",
    },
  },
  {
    slug: "turban",
    name: { cs: "Turbán", en: "Turban squash", de: "Türkenturban" },
    latin: "Cucurbita maxima",
    weight: "1–2 kg",
    use: { cs: "dekorace, plnění", en: "decoration, stuffing", de: "Dekoration, zum Füllen" },
  },
  {
    slug: "spagetova",
    name: { cs: "Špagetová", en: "Spaghetti squash", de: "Spaghettikürbis" },
    latin: "Cucurbita pepo",
    weight: "1–2 kg",
    use: {
      cs: "dužina se rozpadá na nitě",
      en: "the flesh falls apart into strands",
      de: "das Fruchtfleisch zerfällt in Fäden",
    },
  },
  {
    slug: "patison",
    name: { cs: "Patison", en: "Pattypan squash", de: "Patisson" },
    latin: "Cucurbita pepo",
    weight: "0,3–1 kg",
    use: {
      cs: "smažení, grilování, plnění",
      en: "frying, grilling, stuffing",
      de: "Braten, Grillen, Füllen",
    },
  },
  {
    slug: "olejna",
    name: { cs: "Dýně olejná", en: "Styrian oil pumpkin", de: "Steirischer Ölkürbis" },
    latin: "Cucurbita pepo var. styriaca",
    weight: "4–6 kg",
    use: { cs: "nahá semínka, olej", en: "hull-less seeds, oil", de: "schalenlose Kerne, Öl" },
  },
  {
    slug: "obri",
    name: { cs: "Obří dýně", en: "Giant pumpkin", de: "Riesenkürbis" },
    latin: "Cucurbita maxima",
    weight: "30–200 kg",
    use: { cs: "výstava, soutěže", en: "exhibition, competitions", de: "Ausstellung, Wettbewerbe" },
  },
];

export interface LocalisedVariety {
  slug: string;
  name: string;
  latin: string;
  weight: string;
  use: string;
  photo?: string;
}

export function varietiesFor(locale: Locale): LocalisedVariety[] {
  return VARIETIES.map((v) => ({
    slug: v.slug,
    name: v.name[locale],
    latin: v.latin,
    weight: v.weight,
    use: v.use[locale],
    photo: v.photo,
  }));
}
