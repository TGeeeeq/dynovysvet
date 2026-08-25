import { FARM } from "@/content/farm";
import { SEASON_2026, TICKET_TYPES } from "@/lib/tickets/schedule";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { href } from "@/lib/i18n/routes";

const BASE = "https://www.dynovysvet.cz";

/**
 * Strukturovaná data pro Google.
 *
 * Webnode je negeneroval vůbec. Pro sezónní akci je to přitom nejlevnější
 * možný zisk: Dýňový svět se pak v hledání ukazuje jako událost s termínem
 * a odkazem na vstupenky, a to přesně v týdnu, kdy lidé hledají „kam s dětmi".
 */

const place = {
  "@type": "Place",
  name: FARM.name,
  address: {
    "@type": "PostalAddress",
    streetAddress: FARM.street,
    postalCode: FARM.zip,
    addressLocality: "Nová Ves u Leštiny",
    addressCountry: "CZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: FARM.gps.lat,
    longitude: FARM.gps.lng,
  },
};

/** Popis akce ve třech jazycích — Google čte `inLanguage` a podle něj páruje. */
const EVENT_DESCRIPTION: Record<Locale, string> = {
  cs: "Výstava pěstovaných odrůd dýní, slámohrad a slámobazén ve stodole, hospodářská zvířata a přírodní hřiště v zahradě statku.",
  en: "An exhibition of the pumpkin varieties grown here, a straw castle and straw pool in the barn, farm animals and a natural playground in the garden.",
  de: "Ausstellung der hier angebauten Kürbissorten, Strohburg und Strohbad in der Scheune, Nutztiere und ein Naturspielplatz im Garten.",
};

export function FarmJsonLd({ locale }: { locale: Locale }) {
  const ticketsUrl = `${BASE}${href("tickets", locale)}`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "TouristAttraction"],
        "@id": `${BASE}/#statek`,
        name: FARM.name,
        alternateName: FARM.event,
        url: `${BASE}${href("home", locale)}`,
        telephone: FARM.phone,
        email: FARM.email,
        sameAs: [FARM.facebook],
        address: place.address,
        geo: place.geo,
        currenciesAccepted: "CZK",
        paymentAccepted: "Hotovost, QR platba, platební karta online",
        isAccessibleForFree: false,
        publicAccess: true,
      },
      {
        "@type": "Event",
        "@id": `${BASE}/dynovy-svet#akce`,
        inLanguage: HTML_LANG[locale],
        name: `${FARM.event} ${new Date(SEASON_2026.from).getFullYear()}`,
        description: EVENT_DESCRIPTION[locale],
        startDate: SEASON_2026.from,
        endDate: SEASON_2026.to,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: place,
        organizer: { "@type": "Organization", name: FARM.name, url: BASE },
        image: `${BASE}/og.png`,
        // Ceny bez slev; typy vstupenek jsou jednotlivé nabídky.
        offers: TICKET_TYPES.filter((t) => t.price > 0).map((t) => ({
          "@type": "Offer",
          name: t.name[locale],
          price: t.price,
          priceCurrency: "CZK",
          url: ticketsUrl,
          availability: "https://schema.org/InStock",
          validFrom: SEASON_2026.from,
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Data jsou naše vlastní konstanty, ne uživatelský vstup.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
