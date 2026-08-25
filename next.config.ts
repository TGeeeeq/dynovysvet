import type { NextConfig } from "next";

/**
 * Mapa starých Webnode adres na nové.
 *
 * Sezónní SEO se buduje roky a Dýňový svět má odkazy z Kudy z nudy,
 * z regionálního tisku i z Facebooku. Kdyby stará URL v září vrátila 404,
 * přijdeme o návštěvnost přesně v ten jediný měsíc, kdy na ní záleží.
 *
 * Anglická mutace se zatím sbíhá na české stránky; až bude hotová,
 * přesměruje se na `/en/...`.
 */
const OLD_TO_NEW: Record<string, string> = {
  "/o-nas": "/",
  "/programy": "/dynovy-svet",
  "/kontakt": "/kontakt",
  "/statek-u-pipku-akce": "/statek",
  "/internetovy-obchod": "/",
  "/obchodni-podminky": "/obchodni-podminky",
  "/pravidla-ochrany-soukromi": "/ochrana-soukromi",
  "/semena-tykvi-osivo": "/",
  "/prodej-dyni-z-vlastni-sklizne": "/dynovy-svet",
  "/spolu": "/",
  "/recepty-varime-z-dyni": "/recepty",
  "/rady-a-tipy-na-pestovani-dyni": "/pestovani",
  "/pro-ms-a-skupiny-deti": "/skoly",
  "/pro-ms-a-skupiny-deti2": "/skoly",
  "/jarni-vylet-lesni-hriste-prirodni-hriste": "/skoly",
  "/hrejive-polstarky-s-obilim-z-vlastni-produkce2": "/",
  "/detsky-blesi-trh": "/blesi-trh",
  "/cart": "/vstupenky",
};

const nextConfig: NextConfig = {
  async redirects() {
    const rules = Object.entries(OLD_TO_NEW).flatMap(([from, to]) => [
      // Webnode servíroval adresy s koncovým lomítkem; obě varianty musí
      // skončit na stejném místě.
      { source: from, destination: to, permanent: true },
      { source: `${from}/`, destination: to, permanent: true },
      // Anglická mutace měla vlastní strom i vnořené cesty.
      { source: `/en${from}`, destination: to, permanent: true },
      { source: `/en${from}/`, destination: to, permanent: true },
    ]);

    return [
      ...rules,
      // Vnořené cesty anglické mutace (/en/o-nas/spolu, /en/internetovy-obchod/…).
      { source: "/en/:path*", destination: "/", permanent: true },
      { source: "/servers/frontend/:path*", destination: "/", permanent: true },
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
