import type { Locale } from "@/lib/i18n/config";
import type { Gourd } from "@/lib/illustrations/gourds";

/**
 * Názvy a použití odrůd v cizích jazycích.
 *
 * Leží tady, ne v `src/lib/illustrations/gourds.ts` — ten soubor generuje
 * skript `scripts/gen-gourds.py` a ručně psaný text by se při dalším běhu
 * ztratil. Latinský název a hmotnost se nepřekládají.
 */
const LABELS: Record<string, { name: Record<Locale, string>; use: Record<Locale, string> }> = {
  hokkaido: {
    name: { cs: "Hokaido", en: "Hokkaido", de: "Hokkaido" },
    use: {
      cs: "polévka, pečení i se slupkou",
      en: "soup, roasting — skin and all",
      de: "Suppe, Braten samt Schale",
    },
  },
  maslova: {
    name: { cs: "Máslová", en: "Butternut", de: "Butternusskürbis" },
    use: { cs: "krémové polévky, pyré", en: "creamy soups, purée", de: "Cremesuppen, Püree" },
  },
  halloweenska: {
    name: { cs: "Halloweenská", en: "Halloween pumpkin", de: "Halloween-Kürbis" },
    use: { cs: "vyřezávání, dekorace", en: "carving, decoration", de: "Schnitzen, Dekoration" },
  },
  muskatova: {
    name: { cs: "Muškátová", en: "Musquée de Provence", de: "Muskatkürbis" },
    use: {
      cs: "vaření, sladké i slané",
      en: "cooking, sweet and savoury alike",
      de: "Kochen, süß wie herzhaft",
    },
  },
  turban: {
    name: { cs: "Turbán", en: "Turban squash", de: "Türkenturban" },
    use: { cs: "dekorace, plnění", en: "decoration, stuffing", de: "Dekoration, zum Füllen" },
  },
  spagetova: {
    name: { cs: "Špagetová", en: "Spaghetti squash", de: "Spaghettikürbis" },
    use: {
      cs: "dužina se rozpadá na nitě",
      en: "the flesh falls apart into strands",
      de: "das Fruchtfleisch zerfällt in Fäden",
    },
  },
  patison: {
    name: { cs: "Patison", en: "Pattypan squash", de: "Patisson" },
    use: {
      cs: "smažení, grilování, plnění",
      en: "frying, grilling, stuffing",
      de: "Braten, Grillen, Füllen",
    },
  },
  olejna: {
    name: { cs: "Dýně olejná", en: "Styrian oil pumpkin", de: "Steirischer Ölkürbis" },
    use: { cs: "nahá semínka, olej", en: "hull-less seeds, oil", de: "schalenlose Kerne, Öl" },
  },
  obri: {
    name: { cs: "Obří dýně", en: "Giant pumpkin", de: "Riesenkürbis" },
    use: { cs: "výstava, soutěže", en: "exhibition, competitions", de: "Ausstellung, Wettbewerbe" },
  },
};

export function gourdName(g: Pick<Gourd, "slug" | "name">, locale: Locale): string {
  return LABELS[g.slug]?.name[locale] ?? g.name;
}

export function gourdUse(g: Pick<Gourd, "slug" | "use">, locale: Locale): string {
  return LABELS[g.slug]?.use[locale] ?? g.use;
}
