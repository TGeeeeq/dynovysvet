import { ImageResponse } from "next/og";
import { SEO } from "@/content/seo";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/lib/i18n/config";

/**
 * Náhledový obrázek pro Facebook a sdílené odkazy.
 *
 * Statek žije z Facebooku — sdílený odkaz bez obrázku tam vypadá jako spam
 * a proklik na něj skoro nikdo neudělá. Obrázek se generuje při buildu
 * z týchž dat jako web, takže se s obsahem nemůže rozejít.
 *
 * Je to noc se světlem, ne papír: v proudu příspěvků na Facebooku svítí
 * tmavá karta s teplým světlem víc než béžová. Fotku sem nedáváme —
 * snímky ze statku jsou ve WebP a Satori si s ním neporadí.
 *
 * Vlastní písmo záměrně nenačítáme: Satori by kvůli němu musel při buildu
 * sáhnout na síť a jediné, co by to zlepšilo, je tvar písmen na náhledu.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Dýňový svět — Statek u Pipků";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const NIGHT = "#120d0a";
const LANTERN = "#ffb347";
const PAPER = "#f4ebdc";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const seo = SEO.home[locale];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: NIGHT,
          color: PAPER,
          padding: 72,
          // Světlo svíčky zprava dole — stejný motiv jako úvodní animace webu.
          backgroundImage:
            "radial-gradient(700px 520px at 88% 108%, rgba(255,150,46,0.42) 0%, rgba(255,150,46,0) 70%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: LANTERN,
            }}
          >
            Nová Ves u Leštiny · Vysočina
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -3,
              maxWidth: 900,
            }}
          >
            {seo.title.split(" — ")[0]}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 27,
              lineHeight: 1.42,
              color: "rgba(244,235,220,0.72)",
              maxWidth: 760,
            }}
          >
            {seo.description}
          </div>
          <div
            style={{
              marginTop: 34,
              paddingTop: 26,
              borderTop: "2px solid rgba(244,235,220,0.16)",
              fontSize: 22,
              color: "rgba(244,235,220,0.55)",
            }}
          >
            dynovysvet.cz
          </div>
        </div>
      </div>
    ),
    size,
  );
}
