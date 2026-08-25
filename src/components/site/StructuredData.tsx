import { FARM } from "@/content/farm";
import { SEASON_2026, TICKET_TYPES } from "@/lib/tickets/schedule";

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

export function FarmJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "TouristAttraction"],
        "@id": `${BASE}/#statek`,
        name: FARM.name,
        alternateName: FARM.event,
        url: BASE,
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
        name: `${FARM.event} ${new Date(SEASON_2026.from).getFullYear()}`,
        description:
          "Výstava pěstovaných odrůd dýní, slámohrad a slámobazén ve stodole, hospodářská zvířata a přírodní hřiště v zahradě statku.",
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
          name: t.name,
          price: t.price,
          priceCurrency: "CZK",
          url: `${BASE}/vstupenky`,
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
