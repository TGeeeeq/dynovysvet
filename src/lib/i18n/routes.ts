import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config";

/**
 * Registr stránek webu. Jedno místo, kde je napsáno, jak se která stránka
 * jmenuje v adrese v každém jazyce.
 *
 * Slugy se překládají. Návštěvník z Německa nemá dostat `/de/blesi-trh` —
 * adresa je součást toho, jestli se stránka jeví jako přeložená, nebo jen
 * mechanicky protažená překladačem. Zároveň je to jediné, co Google u cizí
 * mutace vidí dřív než obsah.
 *
 * České slugy se **nesmí měnit**: míří na ně přesměrování ze starého Webnode
 * webu, odkaz z Kudy z nudy a všechno, co kdo za pět let nasdílel.
 */
export const ROUTES = {
  home: { cs: "", en: "", de: "" },
  pumpkinWorld: { cs: "dynovy-svet", en: "pumpkin-world", de: "kuerbiswelt" },
  tickets: { cs: "vstupenky", en: "tickets", de: "eintrittskarten" },
  schools: { cs: "skoly", en: "schools-and-groups", de: "schulen-und-gruppen" },
  venue: { cs: "statek", en: "farm-hire", de: "hofvermietung" },
  fleaMarket: { cs: "blesi-trh", en: "flea-market", de: "flohmarkt" },
  recipes: { cs: "recepty", en: "pumpkin-recipes", de: "kuerbisrezepte" },
  growing: { cs: "pestovani", en: "growing-pumpkins", de: "kuerbisanbau" },
  contact: { cs: "kontakt", en: "contact", de: "kontakt" },
  terms: { cs: "obchodni-podminky", en: "terms-and-conditions", de: "agb" },
  privacy: { cs: "ochrana-soukromi", en: "privacy-policy", de: "datenschutz" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof ROUTES;

export const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

/**
 * Adresa stránky v daném jazyce. Čeština nemá prefix, ostatní ano.
 * Vrací vždy cestu bez koncového lomítka (kromě kořene).
 */
export function href(key: RouteKey, locale: Locale = DEFAULT_LOCALE): string {
  const slug = ROUTES[key][locale];
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  if (!slug) return prefix || "/";
  return `${prefix}/${slug}`;
}

/** Obrácený převod: ze slugu zjisti, o kterou stránku jde. */
const SLUG_TO_KEY: Record<Locale, Map<string, RouteKey>> = {
  cs: new Map(),
  en: new Map(),
  de: new Map(),
};
for (const key of ROUTE_KEYS) {
  for (const locale of LOCALES) {
    SLUG_TO_KEY[locale].set(ROUTES[key][locale], key);
  }
}

export function routeKeyFromSlug(locale: Locale, slug: string): RouteKey | null {
  return SLUG_TO_KEY[locale].get(slug) ?? null;
}

/**
 * Tatáž stránka ve všech jazycích — podklad pro `hreflang` i pro přepínač
 * jazyka. Klíčové je, že přepínač **zůstane na stejné stránce**; přehazovat
 * návštěvníka na titulku jen proto, že přepnul jazyk, je nejrychlejší způsob,
 * jak ho ztratit.
 */
export function alternates(key: RouteKey): Record<Locale, string> {
  return {
    cs: href(key, "cs"),
    en: href(key, "en"),
    de: href(key, "de"),
  };
}

/** Cesty, které nikdy nepatří jazykovému routeru. */
const RESERVED_PREFIXES = ["/api", "/admin", "/brana", "/_next", "/foto", "/monitoring"];

export function isReservedPath(pathname: string): boolean {
  return RESERVED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
