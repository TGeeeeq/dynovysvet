import type { NextConfig } from "next";
import { href, type RouteKey } from "./src/lib/i18n/routes";

/**
 * Mapa starých Webnode adres na nové.
 *
 * Sezónní SEO se buduje roky a Dýňový svět má odkazy z Kudy z nudy,
 * z regionálního tisku i z Facebooku. Kdyby stará URL v září vrátila 404,
 * přijdeme o návštěvnost přesně v ten jediný měsíc, kdy na ní záleží.
 *
 * Seznam vychází z `sitemap.xml` starého webu — jsou tam jak ploché adresy,
 * tak vnořené (`/internetovy-obchod/obchodni-podminky/`), a obojí Webnode
 * skutečně servíroval. Anglická mutace používala **stejné české slugy**,
 * jen s prefixem `/en/`; proto se každá dvojice generuje i pro angličtinu,
 * ale míří už na nový anglický slug.
 */
const OLD_TO_ROUTE: Record<string, RouteKey> = {
  "/o-nas": "home",
  "/o-nas/spolu": "home",
  "/spolu": "home",
  "/programy": "pumpkinWorld",
  "/prodej-dyni-z-vlastni-sklizne": "pumpkinWorld",
  "/statek-u-pipku-akce": "venue",
  "/detsky-blesi-trh": "fleaMarket",
  "/recepty-varime-z-dyni": "recipes",
  "/rady-a-tipy-na-pestovani-dyni": "growing",
  "/pro-ms-a-skupiny-deti": "schools",
  "/pro-ms-a-skupiny-deti2": "schools",
  "/pro-ms-a-skupiny-deti/pro-ms-a-skupiny-deti2": "schools",
  "/pro-ms-a-skupiny-deti/jarni-vylet-lesni-hriste-prirodni-hriste": "schools",
  "/jarni-vylet-lesni-hriste-prirodni-hriste": "schools",
  "/pravidla-ochrany-soukromi": "privacy",
  "/internetovy-obchod/pravidla-ochrany-soukromi": "privacy",
  "/internetovy-obchod/obchodni-podminky": "terms",
  // E-shop zatím nemáme; katalog byl na starém webu stejně prázdný a jeho
  // obsah (dýně, osivo, polštářky) je dnes popsaný na titulce a v Dýňovém světě.
  "/internetovy-obchod": "home",
  "/internetovy-obchod/semena-tykvi-osivo": "home",
  "/internetovy-obchod/prodej-dyni-z-vlastni-sklizne": "pumpkinWorld",
  "/internetovy-obchod/hrejive-polstarky-s-obilim-z-vlastni-produkce2": "home",
  "/semena-tykvi-osivo": "home",
  "/hrejive-polstarky-s-obilim-z-vlastni-produkce2": "home",
  "/cart": "tickets",
};

const nextConfig: NextConfig = {
  // Next si jinak sám ustřihne koncové lomítko dřív, než se dostane na naši
  // mapu — každá stará adresa by pak skákala dvakrát. Webnode přitom
  // servíroval úplně všechno S lomítkem, takže by to potkalo každý příchozí
  // odkaz. Přebíráme normalizaci na sebe a řešíme ji v jednom kroku.
  skipTrailingSlashRedirect: true,

  async redirects() {
    const rules = Object.entries(OLD_TO_ROUTE).flatMap(([from, key]) => {
      const cs = href(key, "cs");
      const en = href(key, "en");
      const out = [];
      // Identitní pravidlo by udělalo smyčku — `/kontakt` míří sám na sebe.
      if (from !== cs) {
        out.push({ source: from, destination: cs, permanent: true });
        out.push({ source: `${from}/`, destination: cs, permanent: true });
      }
      out.push({ source: `/en${from}`, destination: en, permanent: true });
      out.push({ source: `/en${from}/`, destination: en, permanent: true });
      return out;
    });

    return [
      ...rules,
      // Stará anglická titulka.
      { source: "/en/", destination: "/en", permanent: true },
      // Čeština žije na kořeni. `/cs/…` je vnitřní tvar, který přepisuje
      // middleware — kdyby na něj někdo trefil zvenčí, byla by to duplicita.
      { source: "/cs", destination: "/", permanent: true },
      { source: "/cs/:path*", destination: "/:path*", permanent: true },
      { source: "/servers/frontend/:path*", destination: "/", permanent: true },
      // Zbytek koncových lomítek, který nepatří žádné staré adrese.
      { source: "/:path+/", destination: "/:path+", permanent: true },
    ];
  },

  images: {
    // AVIF napřed: u fotek ze statku dělá proti WebP ještě zhruba třetinu
    // navíc, a na Vercelu se platí za přenesené bajty.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [200, 320, 480],
  },
};

export default nextConfig;
