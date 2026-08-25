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

/**
 * Bezpečnostní hlavičky pro veřejný web.
 *
 * Proč tady a ne ve `vercel.json`: Vercel je zatím jen zkušební provoz.
 * Hlavičky, na kterých závisí bezpečnost webu, nesmí zmizet jen proto, že
 * se přesuneme jinam — v konfiguraci Nextu jedou všude stejně.
 *
 * CSP je pro veřejné stránky **bez nonce**, a je to vědomé rozhodnutí:
 * nonce se musí lišit request od requestu, což by celý statický web donutilo
 * generovat se na každý požadavek. V den otevření registrací je to přesně to,
 * co si nemůžeme dovolit. Veřejné stránky přitom nikde nevykreslují cizí
 * HTML (žádné `dangerouslySetInnerHTML` nad uživatelským vstupem, React
 * escapuje sám), takže hlavní přínos nonce — zastavit vložený skript — tu
 * nemá co chránit. Administrace, kde je v sázce přihlašovací cookie a kde se
 * edituje obsah, dostává v `src/proxy.ts` ostré CSP s nonce; dynamická je tak
 * jako tak.
 */
const CSP = [
  "default-src 'self'",
  // 'unsafe-inline' kvůli inline bootstrapu Nextu; viz komentář výše.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  // Písma si Next stahuje při buildu k sobě, cizí doména není potřeba.
  "font-src 'self' data:",
  "connect-src 'self'",
  // Mapa na stránce Kontakt. OpenStreetMap místo Google Maps i proto,
  // že nesleduje návštěvníky a nekomplikuje souhlas s cookies.
  "frame-src https://www.openstreetmap.org",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // Dva roky a subdomény. Doména jede na Vercelu přes HTTPS vždy;
  // bez HSTS by první požadavek po zadání adresy šel pořád po HTTP.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Pro prohlížeče, které neumí frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    // Kamera zůstává povolená pro vlastní původ — brána u vstupu s ní
    // bude skenovat QR vstupenky.
    value: "geolocation=(), microphone=(), payment=(), usb=(), camera=(self)",
  },
];

const nextConfig: NextConfig = {
  // Verze frameworku není nic, co by měl znát kdokoli zvenčí.
  poweredByHeader: false,

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
      // Výjimka pro náhledový obrázek: Next ho generuje na adrese
      // `/cs/opengraph-image-<hash>` a crawler Facebooku si zaslouží
      // rovnou 200, ne skok.
      {
        source: "/cs/:path((?!opengraph-image).*)",
        destination: "/:path*",
        permanent: true,
      },
      { source: "/servers/frontend/:path*", destination: "/", permanent: true },
      // Zbytek koncových lomítek, který nepatří žádné staré adrese.
      { source: "/:path+/", destination: "/:path+", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // Administrace má vlastní, přísnější CSP s nonce v `src/proxy.ts`.
        // Dvě CSP hlavičky by se sčítaly jako průnik a shodily by ji.
        source: "/((?!admin).*)",
        headers: SECURITY_HEADERS,
      },
      {
        // Odpovědi API nesmí uvíznout v žádné cache — kapacita se mění po
        // vteřinách a `/api/dostupnost` si svoji cache řídí sám v route handleru.
        source: "/api/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
      {
        source: "/foto/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
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
