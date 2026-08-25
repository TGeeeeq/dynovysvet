import "server-only";

import { and, asc, eq, gte, lte, sql } from "drizzle-orm";

import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import { planSeason, SEASON_2026, type SeasonPlan } from "@/lib/tickets/schedule";

/**
 * Provozní dny a časovky pro administraci.
 *
 * Tady se rozhoduje o tom nejcennějším, co statek má — o kapacitě. Proto
 * platí dvě železná pravidla, která se prolínají celým souborem:
 *
 *  1. Nikdy nesmažeme ani nepřepíšeme nic, na co už je prodaná vstupenka.
 *     Kontrola se nedělá „napřed se podívám, pak zapíšu" (to by pod souběhem
 *     neplatilo), ale podmínkou přímo v UPDATE/DELETE — databáze si ji
 *     vyhodnotí nad aktuální verzí řádku.
 *  2. Bez databáze se nic nerozbije. Čtecí funkce vracejí prázdno, zapisovací
 *     srozumitelnou hlášku. Administrace se dá otevřít i na notebooku bez
 *     připojení a majitel uvidí, proč je prázdná.
 */

/* ------------------------------------------------------------------ čas */

/**
 * Statek počítá dny podle toho, co je za oknem, ale v databázi leží
 * `timestamptz`. Převod mezi „14:00 na statku" a okamžikem musí umět i poslední
 * říjnový víkend, kdy se mění čas — a ten padne doprostřed dýňové sezóny.
 */
const PRAGUE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Prague",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** O kolik je pražský čas v daný okamžik napřed proti UTC. */
function pragueOffsetMs(at: Date): number {
  const part: Record<string, string> = {};
  for (const p of PRAGUE.formatToParts(at)) {
    if (p.type !== "literal") part[p.type] = p.value;
  }
  const wall = Date.UTC(
    Number(part.year),
    Number(part.month) - 1,
    Number(part.day),
    Number(part.hour),
    Number(part.minute),
    Number(part.second),
  );
  return wall - at.getTime();
}

/**
 * Z „2026-10-25T14:00:00" (čas na statku) udělá skutečný okamžik.
 *
 * Posun zjišťujeme dvakrát: první odhad vychází z posunu platného ve špatném
 * okamžiku, druhý už z posunu platného v tom správném. Bez druhého kola by se
 * víkend se změnou času posunul o hodinu.
 */
export function pragueInstant(local: string): Date {
  const naive = new Date(`${local}Z`).getTime();
  const guess = new Date(naive - pragueOffsetMs(new Date(naive)));
  return new Date(naive - pragueOffsetMs(guess));
}

/** Desetinná hodina (14.5) na hodiny na ciferníku („14:30"). */
export function clock(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** „14:30" na desetinnou hodinu (14.5). Vstup musí projít `CLOCK_RE`. */
export function hours(value: string): number {
  const [h, m] = value.split(":");
  return Number(h) + Number(m) / 60;
}

export const CLOCK_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** České počítání kusů — „1 den", „2 dny", „7 dní". */
export function pocet(n: number, one: string, few: string, many: string): string {
  return `${n} ${n === 1 ? one : n >= 2 && n <= 4 ? few : many}`;
}

/* ---------------------------------------------------------------- čtení */

export interface SeasonDayRow {
  id: string;
  date: string;
  opensAt: Date;
  closesAt: Date;
  note: string | null;
  published: boolean;
  slots: number;
  reserved: number;
  capacity: number;
}

export interface SeasonSlotRow {
  id: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  reserved: number;
}

const DAY_COLUMNS = {
  id: schema.eventDays.id,
  date: schema.eventDays.date,
  opensAt: schema.eventDays.opensAt,
  closesAt: schema.eventDays.closesAt,
  note: schema.eventDays.note,
  published: schema.eventDays.published,
  slots: sql<number>`count(${schema.timeSlots.id})::int`,
  reserved: sql<number>`coalesce(sum(${schema.timeSlots.reserved}), 0)::int`,
  capacity: sql<number>`coalesce(sum(${schema.timeSlots.capacity}), 0)::int`,
};

/** Všechny provozní dny od nejstaršího. Součty počítá databáze, ne JavaScript. */
export async function listDays(): Promise<SeasonDayRow[]> {
  if (!hasDatabaseUrl()) return [];
  try {
    return await getDb()
      .select(DAY_COLUMNS)
      .from(schema.eventDays)
      .leftJoin(schema.timeSlots, eq(schema.timeSlots.eventDayId, schema.eventDays.id))
      .groupBy(schema.eventDays.id)
      .orderBy(asc(schema.eventDays.date));
  } catch (error) {
    console.error("[admin/season] provozní dny se nepodařilo načíst:", error);
    return [];
  }
}

export interface DayDetail {
  day: SeasonDayRow;
  slots: SeasonSlotRow[];
}

/** Jeden den i s časovkami. `null` = takový den vypsaný není. */
export async function getDay(date: string): Promise<DayDetail | null> {
  if (!hasDatabaseUrl()) return null;
  try {
    const db = getDb();
    const [day] = await db
      .select(DAY_COLUMNS)
      .from(schema.eventDays)
      .leftJoin(schema.timeSlots, eq(schema.timeSlots.eventDayId, schema.eventDays.id))
      .where(eq(schema.eventDays.date, date))
      .groupBy(schema.eventDays.id)
      .limit(1);
    if (!day) return null;

    const slots = await db
      .select({
        id: schema.timeSlots.id,
        startsAt: schema.timeSlots.startsAt,
        endsAt: schema.timeSlots.endsAt,
        capacity: schema.timeSlots.capacity,
        reserved: schema.timeSlots.reserved,
      })
      .from(schema.timeSlots)
      .where(eq(schema.timeSlots.eventDayId, day.id))
      .orderBy(asc(schema.timeSlots.startsAt));

    return { day, slots };
  } catch (error) {
    console.error("[admin/season] den se nepodařilo načíst:", error);
    return null;
  }
}

/* ------------------------------------------------- formulář vypsání sezóny */

export interface WeekdayRule {
  /** 0 = neděle, jak to počítá `Date.getUTCDay()` i `planSeason()`. */
  weekday: number;
  open: boolean;
  from: string;
  to: string;
}

export interface SeasonFormValues {
  from: string;
  to: string;
  slotMinutes: number;
  capacity: number;
  week: WeekdayRule[];
}

/** Týden začíná pondělkem — tak ho má majitel v kalendáři na zdi. */
export const WEEK: { weekday: number; label: string }[] = [
  { weekday: 1, label: "pondělí" },
  { weekday: 2, label: "úterý" },
  { weekday: 3, label: "středa" },
  { weekday: 4, label: "čtvrtek" },
  { weekday: 5, label: "pátek" },
  { weekday: 6, label: "sobota" },
  { weekday: 0, label: "neděle" },
];

export const SLOT_LENGTHS = [30, 60, 90, 120];

/** Výchozí vyplnění formuláře — sezóna 2026, jak je popsaná v kódu. */
export function defaultSeasonForm(): SeasonFormValues {
  return {
    from: SEASON_2026.from,
    to: SEASON_2026.to,
    slotMinutes: SEASON_2026.slotMinutes,
    capacity: SEASON_2026.capacityPerSlot,
    week: WEEK.map(({ weekday }) => {
      const rule = SEASON_2026.rules.find((r) => r.weekdays.includes(weekday));
      return {
        weekday,
        open: Boolean(rule),
        from: clock(rule?.openHour ?? 10),
        to: clock(rule?.closeHour ?? 18),
      };
    }),
  };
}

export interface SeasonFormRead {
  values: SeasonFormValues;
  /** Co je špatně, česky. Prázdné pole = formulář je v pořádku. */
  problems: string[];
  /** Plán k vygenerování; `null`, když formulář neprošel. */
  plan: SeasonPlan | null;
}

/** Nejdelší sezóna, kterou dovolíme vypsat najednou — pojistka proti překlepu v roce. */
const MAX_DAYS = 400;

/**
 * Přečte formulář (z adresy i z FormData — obojí je jen „dej mi klíč").
 *
 * Nikdy nevyhodí výjimku: hodnoty, kterým nerozumí, nahradí výchozími, aby se
 * formulář dal vždycky vykreslit, a důvod přidá do `problems`.
 */
export function readSeasonForm(get: (key: string) => string | undefined): SeasonFormRead {
  const fallback = defaultSeasonForm();
  const problems: string[] = [];

  const from = get("od") ?? "";
  const to = get("do") ?? "";
  const validFrom = DATE_RE.test(from);
  const validTo = DATE_RE.test(to);
  if (!validFrom || !validTo) problems.push("Vyplňte, od kterého do kterého dne je otevřeno.");

  const values: SeasonFormValues = {
    from: validFrom ? from : fallback.from,
    to: validTo ? to : fallback.to,
    slotMinutes: fallback.slotMinutes,
    capacity: fallback.capacity,
    week: [],
  };

  if (validFrom && validTo) {
    if (to < from) {
      problems.push("Konec sezóny nemůže být dřív než její začátek.");
    } else {
      const span =
        (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000 + 1;
      if (span > MAX_DAYS) {
        problems.push(`Najednou jde vypsat nejvýš ${MAX_DAYS} dní. Zkraťte období.`);
      }
    }
  }

  const rawLength = Number(get("delka"));
  if (SLOT_LENGTHS.includes(rawLength)) {
    values.slotMinutes = rawLength;
  } else {
    problems.push("Vyberte délku časovky.");
  }

  const rawCapacity = Number(get("kapacita"));
  if (Number.isInteger(rawCapacity) && rawCapacity >= 1 && rawCapacity <= 1000) {
    values.capacity = rawCapacity;
  } else {
    problems.push("Kapacita jedné časovky musí být celé číslo od 1 do 1000.");
  }

  for (const { weekday, label } of WEEK) {
    const open = get(`otevreno_${weekday}`) === "1";
    const rawFrom = get(`od_${weekday}`) ?? "";
    const rawTo = get(`do_${weekday}`) ?? "";
    const base = fallback.week.find((w) => w.weekday === weekday);
    const okFrom = CLOCK_RE.test(rawFrom);
    const okTo = CLOCK_RE.test(rawTo);

    const rule: WeekdayRule = {
      weekday,
      open,
      from: okFrom ? rawFrom : (base?.from ?? "10:00"),
      to: okTo ? rawTo : (base?.to ?? "18:00"),
    };
    values.week.push(rule);

    if (!open) continue;
    if (!okFrom || !okTo) {
      problems.push(`U ${label} chybí otevírací doba.`);
      continue;
    }
    const span = (hours(rule.to) - hours(rule.from)) * 60;
    if (span <= 0) {
      problems.push(`U ${label} je zavíračka dřív než otvíračka.`);
    } else if (span < values.slotMinutes) {
      problems.push(
        `U ${label} je otevřeno kratší dobu, než trvá jedna časovka — nevešla by se tam ani jedna.`,
      );
    }
  }

  if (!values.week.some((w) => w.open)) {
    problems.push("Zaškrtněte aspoň jeden den v týdnu, kdy je otevřeno.");
  }

  return { values, problems, plan: problems.length ? null : toPlan(values) };
}

function toPlan(values: SeasonFormValues): SeasonPlan {
  return {
    from: values.from,
    to: values.to,
    // Každý den v týdnu má vlastní pravidlo — `planSeason()` si vybere první,
    // které daný den obsahuje, takže se nemusíme trápit slučováním stejných časů.
    rules: values.week
      .filter((w) => w.open)
      .map((w) => ({
        weekdays: [w.weekday],
        openHour: hours(w.from),
        closeHour: hours(w.to),
      })),
    // Výjimky pro jednotlivé dny se neřeší tady, ale v detailu dne — jinak by
    // formulář narostl do nepoužitelné tabulky.
    overrides: [],
    closed: [],
    slotMinutes: values.slotMinutes,
    capacityPerSlot: values.capacity,
  };
}

/** Formulář zpátky do adresy — pro odkaz „upravit zadání" i pro skrytá pole. */
export function seasonFormQuery(values: SeasonFormValues): Record<string, string> {
  const out: Record<string, string> = {
    od: values.from,
    do: values.to,
    delka: String(values.slotMinutes),
    kapacita: String(values.capacity),
  };
  for (const w of values.week) {
    if (w.open) out[`otevreno_${w.weekday}`] = "1";
    out[`od_${w.weekday}`] = w.from;
    out[`do_${w.weekday}`] = w.to;
  }
  return out;
}

/* ------------------------------------------------------- vypsání sezóny */

export interface SeasonOutcome {
  /** Dny, které se vypíšou (nebo vypsaly) nově. */
  newDays: number;
  newSlots: number;
  seats: number;
  /** Dny, které už v kalendáři jsou a nemají prodáno — necháváme je být. */
  existing: string[];
  /** Dny s prodanými vstupenkami — na ty nesaháme vůbec. */
  sold: string[];
}

/** Dny, které v daném období už existují, i s počtem prodaných míst. */
async function daysInRange(from: string, to: string): Promise<Map<string, number>> {
  const rows = await getDb()
    .select({
      date: schema.eventDays.date,
      reserved: sql<number>`coalesce(sum(${schema.timeSlots.reserved}), 0)::int`,
    })
    .from(schema.eventDays)
    .leftJoin(schema.timeSlots, eq(schema.timeSlots.eventDayId, schema.eventDays.id))
    .where(and(gte(schema.eventDays.date, from), lte(schema.eventDays.date, to)))
    .groupBy(schema.eventDays.id, schema.eventDays.date);

  return new Map(rows.map((r) => [r.date, r.reserved]));
}

function split(plan: SeasonPlan, taken: Map<string, number>) {
  const planned = planSeason(plan);
  const fresh = planned.filter((d) => !taken.has(d.date));
  return {
    fresh,
    existing: planned.filter((d) => taken.get(d.date) === 0).map((d) => d.date),
    sold: planned.filter((d) => (taken.get(d.date) ?? 0) > 0).map((d) => d.date),
    seats: fresh.reduce((sum, d) => sum + d.slots.reduce((s, x) => s + x.capacity, 0), 0),
    slots: fresh.reduce((sum, d) => sum + d.slots.length, 0),
  };
}

/** Co by se stalo, kdyby se teď zmáčklo „Vypsat termíny". Nezapisuje nic. */
export async function previewSeason(plan: SeasonPlan): Promise<SeasonOutcome> {
  const taken = hasDatabaseUrl() ? await daysInRange(plan.from, plan.to).catch(() => new Map<string, number>()) : new Map<string, number>();
  const s = split(plan, taken);
  return { newDays: s.fresh.length, newSlots: s.slots, seats: s.seats, existing: s.existing, sold: s.sold };
}

export type SeasonWriteResult = { ok: true; outcome: SeasonOutcome } | { ok: false; problem: string };

/**
 * Zapíše sezónu do kalendáře.
 *
 * Pouze přidává. Den, který v kalendáři už je, zůstane přesně takový, jaký ho
 * majitel má — ať už na něj někdo koupil vstupenku, nebo si jen ručně upravil
 * hodiny. Kdo chce jiné hodiny, den nejdřív zavře. `ON CONFLICT DO NOTHING`
 * je pojistka pro případ, že se tlačítko zmáčkne dvakrát pod sebou.
 */
export async function writeSeason(plan: SeasonPlan): Promise<SeasonWriteResult> {
  if (!hasDatabaseUrl()) {
    return { ok: false, problem: "Databáze není připojená, termíny se nemají kam uložit." };
  }

  try {
    const db = getDb();
    const taken = await daysInRange(plan.from, plan.to);
    const s = split(plan, taken);

    if (s.fresh.length === 0) {
      return { ok: true, outcome: { newDays: 0, newSlots: 0, seats: 0, existing: s.existing, sold: s.sold } };
    }

    const days = await db
      .insert(schema.eventDays)
      .values(
        s.fresh.map((d) => ({
          date: d.date,
          opensAt: pragueInstant(`${d.date}T${clock(d.openHour)}:00`),
          closesAt: pragueInstant(`${d.date}T${clock(d.closeHour)}:00`),
          slotMinutes: plan.slotMinutes,
          // Nový den se rovnou neprodává — majitel ho zveřejní, až si termíny
          // zkontroluje. Omylem vypsaná sezóna se tak nedostane na web.
          published: false,
        })),
      )
      .onConflictDoNothing({ target: schema.eventDays.date })
      .returning({ id: schema.eventDays.id, date: schema.eventDays.date });

    const byDate = new Map(days.map((d) => [d.date, d.id]));
    const slotRows = s.fresh.flatMap((d) => {
      const eventDayId = byDate.get(d.date);
      if (!eventDayId) return [];
      return d.slots.map((slot) => ({
        eventDayId,
        startsAt: pragueInstant(slot.startsAt),
        endsAt: pragueInstant(slot.endsAt),
        capacity: slot.capacity,
      }));
    });

    let written: { id: string }[] = [];
    if (slotRows.length > 0) {
      written = await db
        .insert(schema.timeSlots)
        .values(slotRows)
        .onConflictDoNothing({ target: [schema.timeSlots.eventDayId, schema.timeSlots.startsAt] })
        .returning({ id: schema.timeSlots.id });
    }

    return {
      ok: true,
      outcome: {
        newDays: days.length,
        newSlots: written.length,
        seats: slotRows.reduce((sum, r) => sum + r.capacity, 0),
        existing: s.existing,
        sold: s.sold,
      },
    };
  } catch (error) {
    console.error("[admin/season] vypsání sezóny selhalo:", error);
    return { ok: false, problem: "Termíny se nepodařilo uložit. Zkuste to prosím znovu." };
  }
}

/* ---------------------------------------------------------------- provoz */

export type Simple = { ok: true } | { ok: false; problem: string };

/** Zveřejnit nebo skrýt jeden den. */
export async function setPublished(date: string, published: boolean): Promise<Simple> {
  if (!hasDatabaseUrl()) return { ok: false, problem: "Databáze není připojená." };
  try {
    const rows = await getDb()
      .update(schema.eventDays)
      .set({ published })
      .where(eq(schema.eventDays.date, date))
      .returning({ id: schema.eventDays.id });
    if (rows.length === 0) return { ok: false, problem: "Takový den v kalendáři není." };
    return { ok: true };
  } catch (error) {
    console.error("[admin/season] změna zveřejnění selhala:", error);
    return { ok: false, problem: "Změnu se nepodařilo uložit." };
  }
}

/** Zveřejní všechny dny naráz. Vrací, kolika dnů se to týkalo. */
export async function publishAll(): Promise<{ ok: true; count: number } | { ok: false; problem: string }> {
  if (!hasDatabaseUrl()) return { ok: false, problem: "Databáze není připojená." };
  try {
    const rows = await getDb()
      .update(schema.eventDays)
      .set({ published: true })
      .where(eq(schema.eventDays.published, false))
      .returning({ id: schema.eventDays.id });
    return { ok: true, count: rows.length };
  } catch (error) {
    console.error("[admin/season] hromadné zveřejnění selhalo:", error);
    return { ok: false, problem: "Dny se nepodařilo zveřejnit." };
  }
}

export type CloseResult = { ok: true } | { ok: false; reason: "prodano" | "neni" | "chyba" };

/**
 * Zavře den — smaže ho i s časovkami.
 *
 * Podmínka „nikde nic prodaného" je součástí DELETE, ne samostatný dotaz.
 * Kdyby si někdo koupil vstupenku o vteřinu dřív, DELETE nesmaže nic
 * a my se to dozvíme podle prázdného výsledku.
 */
export async function closeDay(date: string): Promise<CloseResult> {
  if (!hasDatabaseUrl()) return { ok: false, reason: "chyba" };
  try {
    const db = getDb();
    const deleted = await db.execute<{ id: string }>(sql`
      DELETE FROM event_days d
       WHERE d.date = ${date}
         AND NOT EXISTS (
           SELECT 1 FROM time_slots s WHERE s.event_day_id = d.id AND s.reserved > 0
         )
      RETURNING d.id
    `);
    if (deleted.rows.length > 0) return { ok: true };

    const [still] = await db
      .select({ id: schema.eventDays.id })
      .from(schema.eventDays)
      .where(eq(schema.eventDays.date, date))
      .limit(1);
    return { ok: false, reason: still ? "prodano" : "neni" };
  } catch (error) {
    console.error("[admin/season] zavření dne selhalo:", error);
    return { ok: false, reason: "chyba" };
  }
}

/* ------------------------------------------------------ detail jednoho dne */

export type CapacityInput = { slotId: string; capacity: number };

export interface CapacityConflict {
  /** Čas časovky na ciferníku, ať má hláška co říct majiteli. */
  time: string;
  reserved: number;
  wanted: number;
}

export type SaveDayResult =
  | { ok: true; changed: number }
  | { ok: false; problem: string; conflict?: CapacityConflict };

/**
 * Uloží kapacity časovek a poznámku ke dni.
 *
 * Kapacitu nelze snížit pod už prodaný počet. Kontrolujeme to dvakrát: jednou
 * napřed, abychom uměli říct konkrétní větu („v 14:00 je prodáno 62"), a pak
 * ještě jednou podmínkou v UPDATE, aby to platilo i pod souběhem s prodejem.
 */
export async function saveDay(
  date: string,
  note: string | null,
  capacities: CapacityInput[],
): Promise<SaveDayResult> {
  if (!hasDatabaseUrl()) return { ok: false, problem: "Databáze není připojená." };

  const detail = await getDay(date);
  if (!detail) return { ok: false, problem: "Takový den v kalendáři není." };

  const known = new Map(detail.slots.map((s) => [s.id, s]));
  for (const item of capacities) {
    const slot = known.get(item.slotId);
    // Časovka z jiného dne (nebo mezitím smazaná) se prostě přeskočí – nikdy
    // nedovolíme, aby formulář sáhl mimo den, který má právě otevřený.
    if (!slot) continue;
    if (item.capacity < slot.reserved) {
      const time = pragueClock(slot.startsAt);
      return {
        ok: false,
        problem: `V časovce ${time} už je prodáno ${slot.reserved} míst, kapacitu nelze snížit na ${item.capacity}.`,
        conflict: { time, reserved: slot.reserved, wanted: item.capacity },
      };
    }
  }

  try {
    const db = getDb();
    let changed = 0;

    await db.transaction(async (tx) => {
      await tx
        .update(schema.eventDays)
        .set({ note })
        .where(eq(schema.eventDays.date, date));

      for (const item of capacities) {
        const slot = known.get(item.slotId);
        if (!slot || slot.capacity === item.capacity) continue;
        const res = await tx.execute<{ id: string }>(sql`
          UPDATE time_slots
             SET capacity = ${item.capacity}
           WHERE id = ${item.slotId}
             AND reserved <= ${item.capacity}
          RETURNING id
        `);
        if (res.rows.length === 0) {
          // Mezi kontrolou a zápisem se něco prodalo. Radši celou dávku zpět,
          // ať majitel nekouká na půlku uloženého formuláře.
          throw new Error("kapacita_souboj");
        }
        changed += 1;
      }
    });

    return { ok: true, changed };
  } catch (error) {
    if (error instanceof Error && error.message === "kapacita_souboj") {
      return {
        ok: false,
        problem:
          "Mezitím někdo koupil vstupenku a nová kapacita už by na ni nestačila. Načtěte stránku znovu a zkuste to podle aktuálních čísel.",
      };
    }
    console.error("[admin/season] uložení dne selhalo:", error);
    return { ok: false, problem: "Změny se nepodařilo uložit." };
  }
}

/** Čas časovky na ciferníku statku. */
export function pragueClock(at: Date): string {
  const part: Record<string, string> = {};
  for (const p of PRAGUE.formatToParts(at)) {
    if (p.type !== "literal") part[p.type] = p.value;
  }
  return `${part.hour}:${part.minute}`;
}

/** Přidá do dne jednu časovku navíc. */
export async function addSlot(
  date: string,
  from: string,
  to: string,
  capacity: number,
): Promise<Simple> {
  if (!hasDatabaseUrl()) return { ok: false, problem: "Databáze není připojená." };
  if (hours(to) <= hours(from)) {
    return { ok: false, problem: "Konec časovky musí být později než její začátek." };
  }

  try {
    const db = getDb();
    const [day] = await db
      .select({ id: schema.eventDays.id })
      .from(schema.eventDays)
      .where(eq(schema.eventDays.date, date))
      .limit(1);
    if (!day) return { ok: false, problem: "Takový den v kalendáři není." };

    const rows = await db
      .insert(schema.timeSlots)
      .values({
        eventDayId: day.id,
        startsAt: pragueInstant(`${date}T${from}:00`),
        endsAt: pragueInstant(`${date}T${to}:00`),
        capacity,
      })
      .onConflictDoNothing({ target: [schema.timeSlots.eventDayId, schema.timeSlots.startsAt] })
      .returning({ id: schema.timeSlots.id });

    if (rows.length === 0) {
      return { ok: false, problem: `Časovka od ${from} už v tomhle dni je.` };
    }
    return { ok: true };
  } catch (error) {
    console.error("[admin/season] přidání časovky selhalo:", error);
    return { ok: false, problem: "Časovku se nepodařilo přidat." };
  }
}

/** Smaže časovku, ale jen dokud na ni není prodaná jediná vstupenka. */
export async function removeSlot(slotId: string): Promise<Simple> {
  if (!hasDatabaseUrl()) return { ok: false, problem: "Databáze není připojená." };
  try {
    const res = await getDb().execute<{ id: string }>(sql`
      DELETE FROM time_slots WHERE id = ${slotId} AND reserved = 0 RETURNING id
    `);
    if (res.rows.length === 0) {
      return {
        ok: false,
        problem: "Časovku nelze smazat — jsou na ni prodané vstupenky. Snižte místo toho kapacitu.",
      };
    }
    return { ok: true };
  } catch (error) {
    console.error("[admin/season] smazání časovky selhalo:", error);
    return { ok: false, problem: "Časovku se nepodařilo smazat." };
  }
}
