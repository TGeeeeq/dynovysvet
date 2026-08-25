/**
 * Rezervační jádro.
 *
 * Celý modul stojí na jednom invariantu: `time_slots.reserved` je jediný zdroj
 * pravdy o obsazenosti a mění se výhradně podmíněným UPDATE, který si sám ověří,
 * že se do kapacity vejde. Nikde nečteme volno a pak zapisujeme – to je klasický
 * TOCTOU a pod READ COMMITTED (výchozí izolace Neonu) by dvě souběžné objednávky
 * viděly stejné volno a obě prošly.
 *
 * Proč ne `SELECT ... FOR UPDATE`: serverless pool má krátké a nepředvídatelné
 * spojení a řádkový zámek by nám držel časovku po celou dobu redirectu na
 * platební bránu. Podmíněný UPDATE drží zámek jednotky milisekund.
 */
import { asc, inArray, sql } from 'drizzle-orm';
import { getDb, type Queryable, type Tx } from './client';
import { orderStatus, timeSlots, type OrderStatus } from './schema';

/* ------------------------------------------------------------------ typy */

export type ReserveResult = { ok: true; remaining: number } | { ok: false; reason: 'vyprodano' };

export type CreateHoldResult =
  | { ok: true; holdId: string; expiresAt: Date; remaining: number }
  | { ok: false; reason: 'vyprodano' };

export type ConfirmHoldResult = { ok: true } | { ok: false; reason: 'hold_neexistuje' | 'hold_vyprsel' };

export type SlotAvailability = {
  slotId: string;
  eventDayId: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  reserved: number;
  remaining: number;
};

export type SettleWebhookInput = {
  orderId: string;
  /** Comgate `transId`. Unikátní index na tomto sloupci dělá webhook idempotentním. */
  gatewayTransactionId: string;
  /** Surový stav z brány (`PAID`, `CANCELLED`, …) – ukládáme kvůli auditu. */
  gatewayStatus: string;
  paid: boolean;
  amountCzk: number;
  rawPayload?: unknown;
};

export type SettleWebhookResult = {
  outcome: 'zaplaceno' | 'k_vraceni' | 'neuhrazeno' | 'duplicita' | 'objednavka_neexistuje';
  orderStatus: OrderStatus | null;
  /** true ⇒ obsluha musí zasáhnout ručně (typicky vrátit peníze). */
  needsHumanAlert: boolean;
  /** Sloty, na které se po expiraci holdu už nepodařilo znovu získat kapacitu. */
  failedSlotIds: string[];
};

const DEFAULT_HOLD_TTL_MINUTES = 15;

function assertPositiveQty(qty: number): void {
  if (!Number.isInteger(qty) || qty < 1) {
    throw new RangeError(`Počet míst musí být kladné celé číslo, dostal jsem ${qty}.`);
  }
}

/* ------------------------------------------------------------ 1. rezervace */

/**
 * Atomicky ukousne `qty` míst z časovky.
 *
 * Podmínka `reserved + qty <= capacity` je vyhodnocena uvnitř UPDATE, takže
 * ji nelze obejít souběhem: Postgres pod READ COMMITTED při konfliktu na řádku
 * počká na commit konkurenta a WHERE pak přehodnotí nad *novou* verzí řádku.
 * Nula vrácených řádků má proto jediný význam – nevešlo se.
 *
 * Lze volat i uvnitř existující transakce (parametr `tx`).
 */
export async function reserveSlot(slotId: string, qty: number, tx?: Queryable): Promise<ReserveResult> {
  assertPositiveQty(qty);
  const exec = tx ?? getDb();

  const res = await exec.execute<{ remaining: number }>(sql`
    UPDATE time_slots
       SET reserved = reserved + ${qty}
     WHERE id = ${slotId}
       AND reserved + ${qty} <= capacity
    RETURNING capacity - reserved AS remaining
  `);

  const row = res.rows[0];
  if (!row) return { ok: false, reason: 'vyprodano' };
  return { ok: true, remaining: Number(row.remaining) };
}

/** Opak `reserveSlot` – kompenzace, když se rezervace ruší. Nikdy nejde pod nulu. */
async function releaseSlot(slotId: string, qty: number, tx: Queryable): Promise<void> {
  await tx.execute(sql`
    UPDATE time_slots
       SET reserved = GREATEST(0, reserved - ${qty})
     WHERE id = ${slotId}
  `);
}

/* ---------------------------------------------------------------- 2. hold */

/**
 * Dočasně zablokuje místa na dobu, než zákazník doklikne platbu.
 *
 * Rezervace i zápis holdu jsou v jedné transakci – jinak by pád mezi nimi
 * nechal `reserved` navýšené bez holdu, který by to uměl vrátit (nevratný leak
 * kapacity až do konce sezóny).
 *
 * DŮLEŽITÉ: transakce končí commitem *dříve*, než volající odejde na Comgate.
 * Nikdy nedržíme řádkový zámek přes volání platební brány – brána odpovídá
 * v řádu sekund a časovka by byla po tu dobu zamčená pro všechny ostatní
 * (u serverless spojení navíc riskujeme, že zámek přežije timeout funkce).
 */
export async function createHold(
  slotId: string,
  qty: number,
  ttlMinutes: number = DEFAULT_HOLD_TTL_MINUTES,
): Promise<CreateHoldResult> {
  assertPositiveQty(qty);
  const db = getDb();

  return db.transaction(async (tx) => {
    const reserved = await reserveSlot(slotId, qty, tx);
    if (!reserved.ok) return reserved;

    const inserted = await tx.execute<{ id: string; expires_at: Date }>(sql`
      INSERT INTO holds (slot_id, qty, expires_at)
      VALUES (${slotId}, ${qty}, now() + make_interval(mins => ${ttlMinutes}))
      RETURNING id, expires_at
    `);

    const row = inserted.rows[0];
    if (!row) {
      // Nemělo by nastat; rollback vrátí i navýšený `reserved`.
      throw new Error('Hold se nepodařilo zapsat.');
    }

    return { ok: true, holdId: row.id, expiresAt: new Date(row.expires_at), remaining: reserved.remaining };
  });
}

/* ------------------------------------------------------------- 3. uklízeč */

/**
 * Vrátí kapacitu z propadlých košíků. Pouští se z cronu po minutě.
 *
 * Bezpečné proti souběhu se sebou samým: `DELETE ... RETURNING` v CTE zamkne
 * řádky holdů, takže každý hold smaže právě jeden běh. Druhý běh po commitu
 * prvního přehodnotí WHERE, řádek už neuvidí a `reserved` tedy nesníží podruhé.
 * Kdyby přesto došlo k rozjetí, `GREATEST(0, …)` zabrání zápornému `reserved`
 * (a tím i pádu na CHECK constraintu).
 *
 * @returns počet uvolněných holdů
 */
export async function releaseExpiredHolds(): Promise<number> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const res = await tx.execute<{ released_holds: number }>(sql`
      WITH expired AS (
        DELETE FROM holds
         WHERE order_id IS NULL
           AND expires_at <= now()
        RETURNING id, slot_id, qty
      ), per_slot AS (
        SELECT slot_id, SUM(qty)::int AS qty
          FROM expired
         GROUP BY slot_id
      ), released AS (
        UPDATE time_slots ts
           SET reserved = GREATEST(0, ts.reserved - per_slot.qty)
          FROM per_slot
         WHERE ts.id = per_slot.slot_id
        RETURNING ts.id
      )
      SELECT (SELECT count(*) FROM expired)::int AS released_holds
    `);

    return Number(res.rows[0]?.released_holds ?? 0);
  });
}

/* ------------------------------------------------------- 4. navázání holdu */

/**
 * Naváže hold na objednávku. Od té chvíle ho uklízeč nesmí sebrat – kapacitu
 * drží až do zaplacení nebo do ručního zrušení objednávky.
 *
 * Podmínka `expires_at > now()` je záměrná: hold, který mezitím propadl, už mohl
 * být uklizen a jeho kapacita prodána někomu jinému. Tichým navázáním bychom
 * `reserved` rozjeli oproti realitě.
 */
export async function confirmHold(holdId: string, orderId: string, tx?: Queryable): Promise<ConfirmHoldResult> {
  const exec = tx ?? getDb();

  const res = await exec.execute<{ id: string }>(sql`
    UPDATE holds
       SET order_id = ${orderId}
     WHERE id = ${holdId}
       AND order_id IS NULL
       AND expires_at > now()
    RETURNING id
  `);

  if (res.rows[0]) return { ok: true };

  const still = await exec.execute<{ id: string }>(sql`SELECT id FROM holds WHERE id = ${holdId}`);
  return { ok: false, reason: still.rows[0] ? 'hold_vyprsel' : 'hold_neexistuje' };
}

/* ----------------------------------------------------------- 5. webhook */

/**
 * Zpracuje callback z platební brány.
 *
 * Těžký případ, kvůli kterému tahle funkce existuje: platba dorazí až *po* tom,
 * co hold propadl a uklízeč kapacitu vrátil do prodeje. Nesmíme ani přeprodat,
 * ani si tiše nechat peníze. Postup:
 *
 *   1. Zápis platby s `ON CONFLICT (gateway_transaction_id) DO NOTHING`. Nula
 *      řádků ⇒ webhook už jednou proběhl → `duplicita`, nic dalšího neděláme.
 *      Idempotenci tedy garantuje databázový index, ne aplikační kontrola.
 *   2. Zjistíme, kolik míst objednávka potřebuje a kolik jich ještě fyzicky drží
 *      (holdy navázané na objednávku). Rozdíl se pokusíme dorezervovat.
 *   3. Když se byť jedna časovka nevejde, vrátíme, co jsme v tomhle běhu ukousli,
 *      objednávku označíme `k_vraceni` a zvedneme `needsHumanAlert`.
 *      Transakci *nerollbackujeme* – řádek platby musí zůstat, jinak by nám
 *      retry z brány pustil celou úvahu znovu.
 *
 * Volá se v jedné transakci; commit proběhne dřív, než odpovíme bráně 200.
 */
export async function settleWebhook(input: SettleWebhookInput): Promise<SettleWebhookResult> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const payload = input.rawPayload === undefined ? null : JSON.stringify(input.rawPayload);

    const payment = await tx.execute<{ id: string }>(sql`
      INSERT INTO payments (order_id, gateway, gateway_transaction_id, status, amount_czk, raw_payload)
      VALUES (${input.orderId}, 'comgate', ${input.gatewayTransactionId}, ${input.gatewayStatus},
              ${input.amountCzk}, ${payload}::jsonb)
      ON CONFLICT (gateway_transaction_id) DO NOTHING
      RETURNING id
    `);

    if (!payment.rows[0]) {
      const current = await currentStatus(tx, input.orderId);
      return { outcome: 'duplicita', orderStatus: current, needsHumanAlert: false, failedSlotIds: [] };
    }

    const order = await currentStatus(tx, input.orderId);
    if (order === null) {
      // Platba k neexistující objednávce – vždycky člověk.
      return { outcome: 'objednavka_neexistuje', orderStatus: null, needsHumanAlert: true, failedSlotIds: [] };
    }

    if (!input.paid) {
      // Neúspěšná platba jen posune stav; kapacitu drží hold, dokud nepropadne.
      const next: OrderStatus = order === 'zaplaceno' ? 'zaplaceno' : 'zruseno';
      if (next !== order) await setOrderStatus(tx, input.orderId, next);
      return { outcome: 'neuhrazeno', orderStatus: next, needsHumanAlert: false, failedSlotIds: [] };
    }

    // Kolik míst objednávka spotřebovává (pes a dítě do 2 let se nepočítají)…
    const required = await tx.execute<{ slot_id: string; qty: number }>(sql`
      SELECT oi.slot_id, SUM(oi.quantity)::int AS qty
        FROM order_items oi
        JOIN ticket_types tt ON tt.id = oi.ticket_type_id
       WHERE oi.order_id = ${input.orderId}
         AND oi.slot_id IS NOT NULL
         AND tt.counts_to_capacity
       GROUP BY oi.slot_id
    `);

    // …a kolik jich ještě drží navázané holdy.
    const held = await tx.execute<{ slot_id: string; qty: number }>(sql`
      SELECT slot_id, SUM(qty)::int AS qty
        FROM holds
       WHERE order_id = ${input.orderId}
       GROUP BY slot_id
    `);
    const heldBySlot = new Map(held.rows.map((r) => [r.slot_id, Number(r.qty)]));

    const takenNow: Array<{ slotId: string; qty: number }> = [];
    const failedSlotIds: string[] = [];

    for (const row of required.rows) {
      const deficit = Number(row.qty) - (heldBySlot.get(row.slot_id) ?? 0);
      if (deficit <= 0) continue;

      const reserved = await reserveSlot(row.slot_id, deficit, tx);
      if (!reserved.ok) {
        failedSlotIds.push(row.slot_id);
        continue;
      }
      takenNow.push({ slotId: row.slot_id, qty: deficit });
    }

    if (failedSlotIds.length > 0) {
      // Kompenzace: co jsme v tomhle běhu ukousli, hned vracíme – objednávka
      // stejně nepůjde odbavit jako celek a částečně obsazená kapacita by
      // blokovala prodej někomu, kdo by ji využil.
      for (const t of takenNow) await releaseSlot(t.slotId, t.qty, tx);

      await tx.execute(sql`
        UPDATE orders SET status = 'k_vraceni', paid_at = COALESCE(paid_at, now())
         WHERE id = ${input.orderId}
      `);
      return { outcome: 'k_vraceni', orderStatus: 'k_vraceni', needsHumanAlert: true, failedSlotIds };
    }

    // Dorezervovanou kapacitu zaknihujeme jako hold navázaný na objednávku,
    // aby případný ruční re-run webhooku neukousl místa podruhé. `expires_at`
    // míří na konec časovky – uklízeč se navázaných holdů stejně nedotýká.
    for (const t of takenNow) {
      await tx.execute(sql`
        INSERT INTO holds (slot_id, qty, expires_at, order_id)
        SELECT ${t.slotId}, ${t.qty}, ts.ends_at, ${input.orderId}
          FROM time_slots ts WHERE ts.id = ${t.slotId}
      `);
    }

    await tx.execute(sql`
      UPDATE orders SET status = 'zaplaceno', paid_at = COALESCE(paid_at, now())
       WHERE id = ${input.orderId}
    `);

    return { outcome: 'zaplaceno', orderStatus: 'zaplaceno', needsHumanAlert: false, failedSlotIds: [] };
  });
}

async function currentStatus(tx: Tx, orderId: string): Promise<OrderStatus | null> {
  const res = await tx.execute<{ status: OrderStatus }>(sql`SELECT status FROM orders WHERE id = ${orderId}`);
  return res.rows[0]?.status ?? null;
}

async function setOrderStatus(tx: Tx, orderId: string, status: OrderStatus): Promise<void> {
  if (!orderStatus.enumValues.includes(status)) {
    throw new RangeError(`Neznámý stav objednávky: ${status}`);
  }
  await tx.execute(sql`UPDATE orders SET status = ${status}::order_status WHERE id = ${orderId}`);
}

/* ------------------------------------------------------------ 6. dostupnost */

/**
 * Obsazenost všech časovek zadaných dnů – jeden dotaz, žádné N+1.
 * Výstup jde rovnou do cachovaného veřejného endpointu, proto vracíme i
 * `capacity`/`reserved` (frontend z nich kreslí "poslední místa").
 */
export async function availability(dayIds: readonly string[], tx?: Queryable): Promise<SlotAvailability[]> {
  if (dayIds.length === 0) return [];
  const exec = tx ?? getDb();

  const rows = await exec
    .select({
      slotId: timeSlots.id,
      eventDayId: timeSlots.eventDayId,
      startsAt: timeSlots.startsAt,
      endsAt: timeSlots.endsAt,
      capacity: timeSlots.capacity,
      reserved: timeSlots.reserved,
      remaining: sql<number>`GREATEST(0, ${timeSlots.capacity} - ${timeSlots.reserved})`,
    })
    .from(timeSlots)
    .where(inArray(timeSlots.eventDayId, [...dayIds]))
    .orderBy(asc(timeSlots.startsAt));

  return rows.map((r) => ({ ...r, remaining: Number(r.remaining) }));
}
