import { ImageResponse } from "next/og";
import { GOURDS } from "@/lib/illustrations/gourds";
import { SEO } from "@/content/seo";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/lib/i18n/config";

/**
 * Náhledový obrázek pro Facebook a sdílené odkazy.
 *
 * Statek žije z Facebooku — sdílený odkaz bez obrázku tam vypadá jako
 * spam a proklik na něj skoro nikdo neudělá. Obrázek se generuje při
 * buildu z týchž dat jako web (tabule odrůdy, barvy, texty), takže se
 * nemůže rozejít s obsahem a nikdo ho nemusí ručně překreslovat.
 *
 * Vlastní písmo záměrně nenačítáme: Satori by kvůli němu musel při buildu
 * sáhnout na síť a jediné, co by to zlepšilo, je tvar písmen na náhledu.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Dýňový svět — Statek u Pipků";

export function generateImageMetadata() {
  return [{ id: "hlavni", size, contentType, alt }];
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const PAPER = "#f4ebdc";
const INK = "#1c1814";
const PUMPKIN = "#c25a22";
const INK_SOFT = "#4a4038";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const seo = SEO.home[locale];
  const gourd = GOURDS[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
          color: INK,
          padding: 72,
          alignItems: "center",
          gap: 48,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: PUMPKIN,
            }}
          >
            Nová Ves u Leštiny · Vysočina
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 74,
              fontWeight: 700,
              lineHeight: 1.03,
              letterSpacing: -2,
            }}
          >
            {seo.title.split(" — ")[0]}
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 27,
              lineHeight: 1.42,
              color: INK_SOFT,
              maxWidth: 620,
            }}
          >
            {seo.description}
          </div>
          <div
            style={{
              marginTop: "auto",
              paddingTop: 34,
              borderTop: `2px solid ${INK}22`,
              fontSize: 22,
              color: INK_SOFT,
            }}
          >
            dynovysvet.cz
          </div>
        </div>

        {/* Tabule odrůdy — stejná kresba jako na webu, jen bez šrafury. */}
        <svg width="400" height="400" viewBox="-70 -70 140 140">
          <g fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round">
            <path d={gourd.outline} />
            {gourd.ribs.map((d, i) => (
              <path key={i} d={d} strokeWidth="0.9" opacity="0.65" />
            ))}
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
