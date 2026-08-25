/**
 * Generátor sezónního rozvrhu. Z otevírací doby vyrobí konkrétní dny
 * a hodinové sloty, které se pak zapíšou do databáze.
 *
 * Držíme to jako čistou funkci bez databáze, aby se dal rozvrh před
 * naplněním sezóny v klidu vypsat a zkontrolovat.
 */

export interface OpeningRule {
  /** Dny v týdnu, 0 = neděle. */
  weekdays: number[];
  openHour: number;
  closeHour: number;
}

export interface SeasonPlan {
  from: string; // YYYY-MM-DD
  to: string;
  rules: OpeningRule[];
  /** Dny, kdy platí jiná otevírací doba (prázdniny, svátky). */
  overrides: { date: string; openHour: number; closeHour: number }[];
  /** Dny, kdy je zavřeno navzdory pravidlům. */
  closed: string[];
  slotMinutes: number;
  /** Kolik lidí pustíme dovnitř na jeden slot. */
  capacityPerSlot: number;
}

/** Sezóna 2026 podle provozu 2025. Ceny a kapacity jde přepsat v administraci. */
export const SEASON_2026: SeasonPlan = {
  from: "2026-09-20",
  to: "2026-11-02",
  rules: [
    { weekdays: [3, 4, 5], openHour: 14, closeHour: 18 }, // st–pá
    { weekdays: [6, 0], openHour: 10, closeHour: 18 }, // so–ne
  ],
  overrides: [
    // Podzimní prázdniny a státní svátek — otevřeno už od rána.
    { date: "2026-10-27", openHour: 10, closeHour: 18 },
    { date: "2026-10-28", openHour: 10, closeHour: 18 },
    { date: "2026-10-29", openHour: 10, closeHour: 18 },
  ],
  closed: [],
  slotMinutes: 60,
  capacityPerSlot: 90,
};

export interface PlannedSlot {
  /** ISO začátek slotu v místním čase statku. */
  startsAt: string;
  endsAt: string;
  capacity: number;
}

export interface PlannedDay {
  date: string;
  openHour: number;
  closeHour: number;
  slots: PlannedSlot[];
}

function iso(date: string, hour: number, minute = 0): string {
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function* eachDate(from: string, to: string): Generator<string> {
  const cur = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (cur <= end) {
    yield cur.toISOString().slice(0, 10);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
}

export function planSeason(plan: SeasonPlan): PlannedDay[] {
  const days: PlannedDay[] = [];
  const closed = new Set(plan.closed);
  const overrides = new Map(plan.overrides.map((o) => [o.date, o]));

  for (const date of eachDate(plan.from, plan.to)) {
    if (closed.has(date)) continue;

    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const override = overrides.get(date);
    const rule = plan.rules.find((r) => r.weekdays.includes(weekday));
    if (!override && !rule) continue;

    const openHour = override?.openHour ?? rule!.openHour;
    const closeHour = override?.closeHour ?? rule!.closeHour;

    const slots: PlannedSlot[] = [];
    const step = plan.slotMinutes / 60;
    for (let h = openHour; h + step <= closeHour + 1e-9; h += step) {
      slots.push({
        startsAt: iso(date, Math.floor(h), Math.round((h % 1) * 60)),
        endsAt: iso(date, Math.floor(h + step), Math.round(((h + step) % 1) * 60)),
        capacity: plan.capacityPerSlot,
      });
    }
    // Poslední slot před zavíračkou nemá smysl prodávat naplno — návštěva
    // trvá zhruba dvě hodiny.
    if (slots.length > 1) {
      slots[slots.length - 1].capacity = Math.round(plan.capacityPerSlot * 0.6);
    }

    days.push({ date, openHour, closeHour, slots });
  }
  return days;
}

/** Druhy vstupenek. Ceny 2025; v administraci se přepisují. */
export const TICKET_TYPES = [
  { code: "dospely", name: "Dospělý", price: 120, countsToCapacity: true, note: "" },
  { code: "snizene", name: "Snížené", price: 100, countsToCapacity: true, note: "dítě, student, senior, ZTP" },
  { code: "dite_do_2", name: "Dítě do 2 let", price: 0, countsToCapacity: false, note: "zdarma" },
  { code: "pes", name: "Pes", price: 10, countsToCapacity: false, note: "" },
] as const;

export type TicketTypeCode = (typeof TICKET_TYPES)[number]["code"];
