import "server-only";
import { and, count, desc, eq, gte, isNull, lt, lte, sql, sum } from "drizzle-orm";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";

/**
 * Dotazy pro administraci.
 *
 * Všechny počítají v databázi, ne v JavaScriptu — v říjnu jsou v tabulkách
 * tisíce řádků a stahovat je kvůli jednomu součtu by přehled zpomalilo
 * přesně v ten den, kdy se do něj majitel dívá nejčastěji.
 *
 * Když databáze není připojená (lokální vývoj, preview bez proměnných),
 * vracejí prázdno místo výjimky. Administrace pak ukáže nuly a hlášku,
 * ale nespadne.
 */

/** Půlnoc dnešního dne v pražském čase, vyjádřená jako okamžik. */
export function pragueDayRange(offsetDays = 0): { from: Date; to: Date } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const base = new Date(`${parts}T00:00:00+02:00`);
  const from = new Date(base.getTime() + offsetDays * 86_400_000);
  return { from, to: new Date(from.getTime() + 86_400_000) };
}

export interface Overview {
  connected: boolean;
  todayVisitors: number;
  todayCapacity: number;
  tomorrowVisitors: number;
  paidOrders30d: number;
  revenue30dCzk: number;
  awaitingPayment: number;
  needsRefund: number;
  newInquiries: number;
  newsletter: number;
}

const EMPTY: Overview = {
  connected: false,
  todayVisitors: 0,
  todayCapacity: 0,
  tomorrowVisitors: 0,
  paidOrders30d: 0,
  revenue30dCzk: 0,
  awaitingPayment: 0,
  needsRefund: 0,
  newInquiries: 0,
  newsletter: 0,
};

export async function overview(): Promise<Overview> {
  if (!hasDatabaseUrl()) return EMPTY;

  try {
    const db = getDb();
    const today = pragueDayRange(0);
    const tomorrow = pragueDayRange(1);
    const monthAgo = new Date(Date.now() - 30 * 86_400_000);

    const slotsIn = (from: Date, to: Date) =>
      db
        .select({
          reserved: sql<number>`coalesce(sum(${schema.timeSlots.reserved}), 0)::int`,
          capacity: sql<number>`coalesce(sum(${schema.timeSlots.capacity}), 0)::int`,
        })
        .from(schema.timeSlots)
        .where(and(gte(schema.timeSlots.startsAt, from), lt(schema.timeSlots.startsAt, to)));

    const [todayRow, tomorrowRow, paidRow, waitingRow, refundRow, inquiryRow, newsletterRow] =
      await Promise.all([
        slotsIn(today.from, today.to),
        slotsIn(tomorrow.from, tomorrow.to),
        db
          .select({
            orders: count(),
            revenue: sql<number>`coalesce(sum(${schema.orders.totalCzk}), 0)::int`,
          })
          .from(schema.orders)
          .where(
            and(eq(schema.orders.status, "zaplaceno"), gte(schema.orders.createdAt, monthAgo)),
          ),
        db
          .select({ n: count() })
          .from(schema.orders)
          .where(eq(schema.orders.status, "ceka_na_platbu")),
        db.select({ n: count() }).from(schema.orders).where(eq(schema.orders.status, "k_vraceni")),
        db.select({ n: count() }).from(schema.inquiries).where(isNull(schema.inquiries.handledAt)),
        db.select({ n: count() }).from(schema.newsletterSignups),
      ]);

    return {
      connected: true,
      todayVisitors: todayRow[0]?.reserved ?? 0,
      todayCapacity: todayRow[0]?.capacity ?? 0,
      tomorrowVisitors: tomorrowRow[0]?.reserved ?? 0,
      paidOrders30d: paidRow[0]?.orders ?? 0,
      revenue30dCzk: paidRow[0]?.revenue ?? 0,
      awaitingPayment: waitingRow[0]?.n ?? 0,
      needsRefund: refundRow[0]?.n ?? 0,
      newInquiries: inquiryRow[0]?.n ?? 0,
      newsletter: newsletterRow[0]?.n ?? 0,
    };
  } catch (error) {
    console.error("Přehled se nepodařilo načíst:", error);
    return EMPTY;
  }
}

export interface OrderRow {
  id: string;
  orderNumber: string;
  email: string;
  name: string | null;
  status: (typeof schema.orderStatus.enumValues)[number];
  totalCzk: number;
  createdAt: Date;
  paidAt: Date | null;
}

export async function recentOrders(limit = 10): Promise<OrderRow[]> {
  if (!hasDatabaseUrl()) return [];
  try {
    return await getDb()
      .select({
        id: schema.orders.id,
        orderNumber: schema.orders.orderNumber,
        email: schema.orders.email,
        name: schema.orders.name,
        status: schema.orders.status,
        totalCzk: schema.orders.totalCzk,
        createdAt: schema.orders.createdAt,
        paidAt: schema.orders.paidAt,
      })
      .from(schema.orders)
      .orderBy(desc(schema.orders.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Objednávky se nepodařilo načíst:", error);
    return [];
  }
}

/** Nejbližší otevírací dny s obsazeností — podklad pro „co nás čeká". */
export async function upcomingDays(limit = 7) {
  if (!hasDatabaseUrl()) return [];
  try {
    const now = new Date();
    return await getDb()
      .select({
        date: schema.eventDays.date,
        published: schema.eventDays.published,
        reserved: sql<number>`coalesce(sum(${schema.timeSlots.reserved}), 0)::int`,
        capacity: sql<number>`coalesce(sum(${schema.timeSlots.capacity}), 0)::int`,
        slots: sql<number>`count(${schema.timeSlots.id})::int`,
      })
      .from(schema.eventDays)
      .leftJoin(schema.timeSlots, eq(schema.timeSlots.eventDayId, schema.eventDays.id))
      .where(gte(schema.eventDays.date, now.toISOString().slice(0, 10)))
      .groupBy(schema.eventDays.id, schema.eventDays.date, schema.eventDays.published)
      .orderBy(schema.eventDays.date)
      .limit(limit);
  } catch (error) {
    console.error("Provozní dny se nepodařilo načíst:", error);
    return [];
  }
}

export { and, desc, eq, gte, isNull, lte, sum };
