import "server-only";
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import type { OrderStatus } from "@/lib/db/schema";

/**
 * Objednávky pro administraci — čtení i zásahy.
 *
 * Stejná pravidla jako ve zbytku administrace: počítá se v databázi, ne
 * v JavaScriptu, a bez připojené databáze se vrací prázdno místo výjimky.
 *
 * Zásahy do stavu objednávky jsou psané jako podmíněný UPDATE („změň jen
 * tehdy, když je objednávka pořád v tom stavu, který jsem viděl"). Kdybychom
 * stav nejdřív přečetli a pak zapsali, dvojklik na tlačítko nebo dvě otevřené
 * záložky by akci provedly dvakrát — u peněz a u kapacity je to neúnosné.
 */

/** Kolik objednávek se vejde na stránku. Víc se stejně neprohlédne. */
export const PAGE_SIZE = 50;

/* ------------------------------------------------------------------ výpis */

export interface OrderFilters {
  status?: OrderStatus;
  /** Číslo objednávky nebo e-mail, částečná shoda bez ohledu na velikost písmen. */
  search?: string;
  /** Přijato od / do — kalendářní den v pražském čase, formát YYYY-MM-DD. */
  from?: string;
  to?: string;
  page: number;
}

export interface OrderListRow {
  id: string;
  orderNumber: string;
  email: string;
  name: string | null;
  status: OrderStatus;
  totalCzk: number;
  createdAt: Date;
  /** Začátek nejbližší časovky, na kterou objednávka platí. Zboží bez časovky nemá termín. */
  visitAt: Date | null;
}

export interface OrderList {
  connected: boolean;
  rows: OrderListRow[];
  /** Kolik objednávek filtr našel celkem, ne jen na téhle stránce. */
  found: number;
  foundTotalCzk: number;
  page: number;
  pages: number;
}

const EMPTY_LIST: OrderList = {
  connected: false,
  rows: [],
  found: 0,
  foundTotalCzk: 0,
  page: 1,
  pages: 1,
};

/**
 * Podmínka filtru. Sahá výhradně na sloupce tabulky `orders`, takže ji lze
 * použít i pro souhrnný dotaz, který se na časovky vůbec nepřipojuje.
 */
function filterWhere(f: OrderFilters): SQL | undefined {
  const parts: SQL[] = [];

  if (f.status) parts.push(eq(schema.orders.status, f.status));

  if (f.search) {
    // Procenta a podtržítka zadaná uživatelem musí zůstat obyčejnými znaky,
    // jinak by hledání „100_“ znamenalo něco jiného, než majitel čeká.
    const needle = `%${f.search.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
    const match = or(ilike(schema.orders.orderNumber, needle), ilike(schema.orders.email, needle));
    if (match) parts.push(match);
  }

  // Den se porovnává v pražském čase. Objednávka z 31. srpna 23:30 patří do
  // srpna, i když je v UTC uložená jako 21:30 téhož dne — a v zimě naopak.
  if (f.from) {
    parts.push(sql`(${schema.orders.createdAt} AT TIME ZONE 'Europe/Prague')::date >= ${f.from}::date`);
  }
  if (f.to) {
    parts.push(sql`(${schema.orders.createdAt} AT TIME ZONE 'Europe/Prague')::date <= ${f.to}::date`);
  }

  return parts.length ? and(...parts) : undefined;
}

export async function listOrders(filters: OrderFilters): Promise<OrderList> {
  if (!hasDatabaseUrl()) return { ...EMPTY_LIST, page: filters.page };

  try {
    const db = getDb();
    const where = filterWhere(filters);

    // Termín návštěvy je nejbližší časovka objednávky. Dotahuje se poddotazem
    // s GROUP BY, ne dotazem na každý řádek zvlášť — na 50 objednávkách by
    // to jinak bylo 50 cest do databáze navíc.
    const visit = db
      .select({
        orderId: schema.orderItems.orderId,
        visitAt: sql<Date | string>`min(${schema.timeSlots.startsAt})`.as("visit_at"),
      })
      .from(schema.orderItems)
      .innerJoin(schema.timeSlots, eq(schema.timeSlots.id, schema.orderItems.slotId))
      .groupBy(schema.orderItems.orderId)
      .as("navsteva");

    const page = Math.max(1, filters.page);

    const [rows, agg] = await Promise.all([
      db
        .select({
          id: schema.orders.id,
          orderNumber: schema.orders.orderNumber,
          email: schema.orders.email,
          name: schema.orders.name,
          status: schema.orders.status,
          totalCzk: schema.orders.totalCzk,
          createdAt: schema.orders.createdAt,
          visitAt: visit.visitAt,
        })
        .from(schema.orders)
        .leftJoin(visit, eq(visit.orderId, schema.orders.id))
        .where(where)
        .orderBy(desc(schema.orders.createdAt))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      db
        .select({
          found: count(),
          sumCzk: sql<number>`coalesce(sum(${schema.orders.totalCzk}), 0)::int`,
        })
        .from(schema.orders)
        .where(where),
    ]);

    const found = agg[0]?.found ?? 0;

    return {
      connected: true,
      rows: rows.map((r) => ({ ...r, visitAt: r.visitAt ? new Date(r.visitAt) : null })),
      found,
      foundTotalCzk: agg[0]?.sumCzk ?? 0,
      page,
      pages: Math.max(1, Math.ceil(found / PAGE_SIZE)),
    };
  } catch (error) {
    console.error("Objednávky se nepodařilo načíst:", error);
    return { ...EMPTY_LIST, page: filters.page };
  }
}

/* ------------------------------------------------------------------ detail */

export interface OrderItemRow {
  id: string;
  ticketTypeName: string;
  quantity: number;
  unitPriceCzk: number;
  subtotalCzk: number;
  countsToCapacity: boolean;
  slotStartsAt: Date | null;
  slotEndsAt: Date | null;
}

export interface OrderPaymentRow {
  id: string;
  gateway: string;
  status: string;
  amountCzk: number;
  createdAt: Date;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  email: string;
  name: string | null;
  phone: string | null;
  note: string | null;
  locale: string;
  totalCzk: number;
  currency: string;
  createdAt: Date;
  paidAt: Date | null;
  items: OrderItemRow[];
  payments: OrderPaymentRow[];
  /** Kolik vstupenek objednávka má a kolik jich už prošlo branou. */
  tickets: { total: number; checkedIn: number };
}

/** Hrubá kontrola tvaru id dřív, než s ním půjdeme do databáze. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isOrderId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export async function orderDetail(id: string): Promise<OrderDetail | null> {
  // Neplatné id není chyba databáze, ale neexistující objednávka. Kdybychom
  // ho poslali do Postgresu, spadlo by to na přetypování na uuid.
  if (!hasDatabaseUrl() || !isOrderId(id)) return null;

  try {
    const db = getDb();

    const [head] = await db
      .select({
        id: schema.orders.id,
        orderNumber: schema.orders.orderNumber,
        status: schema.orders.status,
        email: schema.orders.email,
        name: schema.orders.name,
        phone: schema.orders.phone,
        note: schema.orders.note,
        locale: schema.orders.locale,
        totalCzk: schema.orders.totalCzk,
        currency: schema.orders.currency,
        createdAt: schema.orders.createdAt,
        paidAt: schema.orders.paidAt,
      })
      .from(schema.orders)
      .where(eq(schema.orders.id, id))
      .limit(1);

    if (!head) return null;

    const [items, payments, ticketAgg] = await Promise.all([
      db
        .select({
          id: schema.orderItems.id,
          ticketTypeName: schema.ticketTypes.nameCs,
          quantity: schema.orderItems.quantity,
          unitPriceCzk: schema.orderItems.unitPriceCzk,
          countsToCapacity: schema.ticketTypes.countsToCapacity,
          slotStartsAt: schema.timeSlots.startsAt,
          slotEndsAt: schema.timeSlots.endsAt,
        })
        .from(schema.orderItems)
        .innerJoin(schema.ticketTypes, eq(schema.ticketTypes.id, schema.orderItems.ticketTypeId))
        .leftJoin(schema.timeSlots, eq(schema.timeSlots.id, schema.orderItems.slotId))
        .where(eq(schema.orderItems.orderId, id))
        .orderBy(asc(schema.timeSlots.startsAt), asc(schema.ticketTypes.sortOrder)),
      db
        .select({
          id: schema.payments.id,
          gateway: schema.payments.gateway,
          status: schema.payments.status,
          amountCzk: schema.payments.amountCzk,
          createdAt: schema.payments.createdAt,
        })
        .from(schema.payments)
        .where(eq(schema.payments.orderId, id))
        .orderBy(desc(schema.payments.createdAt)),
      db
        .select({
          total: count(),
          checkedIn: sql<number>`count(${schema.tickets.checkedInAt})::int`,
        })
        .from(schema.tickets)
        .where(eq(schema.tickets.orderId, id)),
    ]);

    return {
      ...head,
      items: items.map((i) => ({ ...i, subtotalCzk: i.quantity * i.unitPriceCzk })),
      payments,
      tickets: { total: ticketAgg[0]?.total ?? 0, checkedIn: ticketAgg[0]?.checkedIn ?? 0 },
    };
  } catch (error) {
    console.error("Detail objednávky se nepodařilo načíst:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ zásahy */

export type OperationResult<T> = { ok: true; data: T } | { ok: false; reason: OperationError };

export type OperationError = "bez_databaze" | "neexistuje" | "jiny_stav" | "chyba";

/** Číslo objednávky pro hlášky a audit. `null` = objednávka neexistuje. */
export async function orderSummary(
  id: string,
): Promise<{ orderNumber: string; status: OrderStatus } | null> {
  if (!hasDatabaseUrl() || !isOrderId(id)) return null;
  try {
    const [row] = await getDb()
      .select({ orderNumber: schema.orders.orderNumber, status: schema.orders.status })
      .from(schema.orders)
      .where(eq(schema.orders.id, id))
      .limit(1);
    return row ?? null;
  } catch (error) {
    console.error("Objednávku se nepodařilo najít:", error);
    return null;
  }
}

/**
 * Ruční zaplacení — převodem na účet nebo hotově na místě.
 *
 * Podmínka `o.status = 'ceka_na_platbu'` je uvnitř UPDATE schválně: Postgres ji
 * po případném souběhu přehodnotí nad novou verzí řádku, takže druhý průchod
 * nepřepíše `paid_at` na pozdější čas.
 */
export async function markPaidManually(id: string): Promise<OperationResult<{ orderNumber: string }>> {
  if (!hasDatabaseUrl()) return { ok: false, reason: "bez_databaze" };
  if (!isOrderId(id)) return { ok: false, reason: "neexistuje" };

  try {
    const res = await getDb().execute<{ order_number: string }>(sql`
      WITH puvodni AS (SELECT id, order_number FROM orders WHERE id = ${id})
      UPDATE orders o
         SET status = 'zaplaceno', paid_at = now()
        FROM puvodni
       WHERE o.id = puvodni.id
         AND o.status = 'ceka_na_platbu'
      RETURNING puvodni.order_number
    `);

    const row = res.rows[0];
    if (row) return { ok: true, data: { orderNumber: row.order_number } };

    const current = await orderSummary(id);
    return { ok: false, reason: current ? "jiny_stav" : "neexistuje" };
  } catch (error) {
    console.error("Ruční zaplacení objednávky selhalo:", error);
    return { ok: false, reason: "chyba" };
  }
}

export interface CancelOutcome {
  orderNumber: string;
  previousStatus: OrderStatus;
  /** Kolik míst se vrátilo do prodeje. */
  releasedSeats: number;
  removedHolds: number;
}

/**
 * Zrušení objednávky i s vrácením kapacity — všechno v jedné transakci.
 *
 * Kolik míst uvolnit, se počítá jako `LEAST(položky, navázané holdy)`:
 *  - položky říkají, kolik míst objednávka *chtěla* (bez psů a dětí do dvou let,
 *    ty se do kapacity nepočítají),
 *  - navázané holdy říkají, kolik jich reálně *drží* — a jenom to smíme vrátit.
 *
 * Rozdíl není teoretický: objednávka ve stavu „k vrácení“ už kapacitu nedrží
 * (platba dorazila pozdě, místa mezitím koupil někdo jiný — viz `settleWebhook`).
 * Kdybychom slepě odečetli množství z položek, snížili bychom `reserved` pod
 * skutečnost a časovku bychom přeprodali. `GREATEST(0, …)` je pak už jen
 * poslední pojistka proti zápornému číslu a pádu na CHECK constraintu.
 */
export async function cancelOrderAndRelease(id: string): Promise<OperationResult<CancelOutcome>> {
  if (!hasDatabaseUrl()) return { ok: false, reason: "bez_databaze" };
  if (!isOrderId(id)) return { ok: false, reason: "neexistuje" };

  try {
    return await getDb().transaction(async (tx) => {
      // `FOR UPDATE` drží řádek objednávky po celou transakci, takže dvě
      // souběžná zrušení nemohou uvolnit stejná místa dvakrát.
      const before = await tx.execute<{ order_number: string; status: OrderStatus }>(
        sql`SELECT order_number, status FROM orders WHERE id = ${id} FOR UPDATE`,
      );
      const previous = before.rows[0];
      if (!previous) return { ok: false as const, reason: "neexistuje" as const };
      if (previous.status === "zruseno") return { ok: false as const, reason: "jiny_stav" as const };

      await tx.execute(sql`UPDATE orders SET status = 'zruseno' WHERE id = ${id}`);

      const released = await tx.execute<{ mista: number; holdu: number }>(sql`
        WITH polozky AS (
          SELECT oi.slot_id, SUM(oi.quantity)::int AS qty
            FROM order_items oi
            JOIN ticket_types tt ON tt.id = oi.ticket_type_id
           WHERE oi.order_id = ${id}
             AND oi.slot_id IS NOT NULL
             AND tt.counts_to_capacity
           GROUP BY oi.slot_id
        ), drzene AS (
          SELECT slot_id, SUM(qty)::int AS qty
            FROM holds
           WHERE order_id = ${id}
           GROUP BY slot_id
        ), k_uvolneni AS (
          SELECT p.slot_id, LEAST(p.qty, COALESCE(d.qty, 0)) AS qty
            FROM polozky p
            LEFT JOIN drzene d ON d.slot_id = p.slot_id
           WHERE LEAST(p.qty, COALESCE(d.qty, 0)) > 0
        ), uvolneno AS (
          UPDATE time_slots ts
             SET reserved = GREATEST(0, ts.reserved - k.qty)
            FROM k_uvolneni k
           WHERE ts.id = k.slot_id
          RETURNING k.qty
        ), smazano AS (
          DELETE FROM holds WHERE order_id = ${id} RETURNING id
        )
        SELECT COALESCE((SELECT SUM(qty) FROM uvolneno), 0)::int AS mista,
               (SELECT count(*) FROM smazano)::int AS holdu
      `);

      return {
        ok: true as const,
        data: {
          orderNumber: previous.order_number,
          previousStatus: previous.status,
          releasedSeats: Number(released.rows[0]?.mista ?? 0),
          removedHolds: Number(released.rows[0]?.holdu ?? 0),
        },
      };
    });
  } catch (error) {
    console.error("Zrušení objednávky selhalo:", error);
    return { ok: false, reason: "chyba" };
  }
}

/**
 * Poznamenání vráceného vstupného.
 *
 * Peníze vrací majitel ručně v bance nebo v Comgate — systém do brány nesahá,
 * jen si zapíše, že se to stalo. Kapacitu tahle akce záměrně nevrací:
 * objednávka „k vrácení“ žádnou nedrží a u zaplacené je na to samostatná akce
 * „Zrušit objednávku a uvolnit místa“, aby si majitel vybral vědomě.
 */
export async function markRefunded(id: string): Promise<OperationResult<{ orderNumber: string; previousStatus: OrderStatus }>> {
  if (!hasDatabaseUrl()) return { ok: false, reason: "bez_databaze" };
  if (!isOrderId(id)) return { ok: false, reason: "neexistuje" };

  try {
    const res = await getDb().execute<{ order_number: string; previous_status: OrderStatus }>(sql`
      WITH puvodni AS (SELECT id, order_number, status FROM orders WHERE id = ${id})
      UPDATE orders o
         SET status = 'zruseno'
        FROM puvodni
       WHERE o.id = puvodni.id
         AND o.status IN ('k_vraceni', 'zaplaceno')
      RETURNING puvodni.order_number, puvodni.status AS previous_status
    `);

    const row = res.rows[0];
    if (row) {
      return { ok: true, data: { orderNumber: row.order_number, previousStatus: row.previous_status } };
    }

    const current = await orderSummary(id);
    return { ok: false, reason: current ? "jiny_stav" : "neexistuje" };
  } catch (error) {
    console.error("Označení vrácené platby selhalo:", error);
    return { ok: false, reason: "chyba" };
  }
}
