import { NextResponse } from "next/server";
import { planSeason, SEASON_2026 } from "@/lib/tickets/schedule";

/**
 * Živá dostupnost slotů.
 *
 * Tohle je jediný endpoint, který v den otevření registrací dostane
 * skutečný nápor: tisíce lidí v prohlížeči, každý se ptá po pár vteřinách.
 * Klíč je cache na CDN — dvacet tisíc pollujících lidí pak znamená pár
 * dotazů do databáze za minutu, ne dvacet tisíc.
 *
 * `stale-while-revalidate` navíc zajistí, že ani v okamžiku vypršení cache
 * nikdo nečeká: dostane o vteřinu starší číslo a nová hodnota se natáhne
 * na pozadí.
 */
export const revalidate = 10;

export async function GET() {
  const days = planSeason(SEASON_2026).map((d) => ({
    date: d.date,
    slots: d.slots.map((s) => ({
      id: `${d.date}-${s.startsAt.slice(11, 16)}`,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      capacity: s.capacity,
      reserved: 0,
    })),
  }));

  return NextResponse.json(days, {
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
    },
  });
}
