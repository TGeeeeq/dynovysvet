/**
 * Testy rezervačního jádra.
 *
 * Integrační část běží jen proti skutečnému Postgresu (Neon). Bez `DATABASE_URL`
 * se přeskočí – mockovat souběh pod READ COMMITTED nemá smysl, právě databáze
 * je tu ta testovaná komponenta.
 *
 *   DATABASE_URL=postgres://… pnpm test
 *
 * Čisté jednotkové testy (IBAN, SPAYD) běží vždycky.
 */
import assert from 'node:assert/strict';
import { describe, it, after } from 'node:test';
import { randomUUID } from 'node:crypto';

import { czAccountToIban, isValidCzAccount, parseCzAccount, spaydString, SELLER_IBAN } from '../src/lib/payments/spayd';
import { availability, confirmHold, createHold, releaseExpiredHolds, settleWebhook } from '../src/lib/db/booking';
import { closeDb, getDb, hasDatabaseUrl } from '../src/lib/db/client';
import { sql } from 'drizzle-orm';

/* ==================================================== 5. IBAN / SPAYD (bez DB) */

describe('IBAN a SPAYD', () => {
  it('převede 2667118524/0600 na správný IBAN', () => {
    assert.equal(czAccountToIban('2667118524/0600'), 'CZ2106000000002667118524');
    assert.equal(SELLER_IBAN, 'CZ2106000000002667118524');
    assert.equal(SELLER_IBAN.length, 24);
  });

  it('zvládne předčíslí i mezery (kontrolní vzorek ČNB)', () => {
    assert.equal(czAccountToIban('19-2000145399/0800'), 'CZ6508000000192000145399');
    assert.equal(czAccountToIban(' 19-2000145399 / 0800 '), 'CZ6508000000192000145399');
  });

  it('doplní nuly na pevných 20 znaků BBAN', () => {
    const p = parseCzAccount('2667118524/0600');
    assert.deepEqual(p, { prefix: '000000', account: '2667118524', bank: '0600' });
  });

  it('odmítne nesmyslný vstup', () => {
    assert.throws(() => czAccountToIban('12345'));
    assert.throws(() => czAccountToIban('2667118524/06000'));
    assert.equal(isValidCzAccount('2667118524/0600'), true);
    // Prohozené číslice neprojdou modulo-11 kontrolou účtu.
    assert.equal(isValidCzAccount('2667118542/0600'), false);
  });

  it('sestaví SPAYD řetězec v očekávaném tvaru', () => {
    const s = spaydString({ amountCzk: 240, variableSymbol: '2600042', message: 'Dýňový svět – objednávka 42' });
    assert.equal(s, 'SPD*1.0*ACC:CZ2106000000002667118524*AM:240.00*CC:CZK*X-VS:2600042*MSG:Dynovy svet - objednavka 42');
  });

  it('nikdy nepustí do hodnoty hvězdičku ani diakritiku', () => {
    const s = spaydString({ amountCzk: 10.5, message: 'a*b\nč', recipientName: 'Josef Pipek' });
    const fields = s.split('*');
    assert.equal(fields[0], 'SPD');
    assert.equal(fields[1], '1.0');
    assert.ok(fields.some((f) => f === 'AM:10.50'));
    assert.ok(fields.some((f) => f === 'RN:Josef Pipek'));
    assert.ok(fields.some((f) => f === 'MSG:a b c'));
  });

  it('ořízne variabilní symbol na 10 číslic', () => {
    const s = spaydString({ amountCzk: 1, variableSymbol: 'DS26-000000000042' });
    assert.ok(s.includes('*X-VS:0000000042*') || s.endsWith('*X-VS:0000000042'));
  });
});

/* ============================================================ integrační část */

const skip = hasDatabaseUrl() ? false : 'DATABASE_URL není nastavena – integrační testy proti Postgresu přeskočeny.';

describe('rezervace (vyžaduje Postgres)', { skip }, () => {
  const db = () => getDb();
  const created: { dayIds: string[] } = { dayIds: [] };

  after(async () => {
    if (created.dayIds.length > 0) {
      // event_days maže kaskádou time_slots i holds; objednávky mažeme zvlášť.
      await db().execute(sql`DELETE FROM orders WHERE order_number LIKE 'TEST-%'`);
      for (const id of created.dayIds) {
        await db().execute(sql`DELETE FROM event_days WHERE id = ${id}`);
      }
    }
    await closeDb();
  });

  /** Vyrobí izolovaný testovací den s jednou časovkou dané kapacity. */
  async function makeSlot(capacity: number): Promise<{ dayId: string; slotId: string }> {
    // Datum posouváme daleko za sezónu, ať nekolidujeme s reálnými daty
    // (event_days.date má unique index).
    const dayOffset = 4000 + Math.floor(Math.random() * 4000);
    const res = await db().execute<{ day_id: string; slot_id: string }>(sql`
      WITH d AS (
        INSERT INTO event_days (date, opens_at, closes_at, published)
        VALUES (
          (CURRENT_DATE + make_interval(days => ${dayOffset}))::date,
          now() + make_interval(days => ${dayOffset}),
          now() + make_interval(days => ${dayOffset}, hours => 4),
          false
        )
        RETURNING id
      ), s AS (
        INSERT INTO time_slots (event_day_id, starts_at, ends_at, capacity)
        SELECT d.id, now() + make_interval(days => ${dayOffset}),
               now() + make_interval(days => ${dayOffset}, hours => 1), ${capacity}
          FROM d
        RETURNING id, event_day_id
      )
      SELECT s.event_day_id AS day_id, s.id AS slot_id FROM s
    `);
    const row = res.rows[0];
    assert.ok(row, 'testovací slot se nevytvořil');
    created.dayIds.push(row.day_id);
    return { dayId: row.day_id, slotId: row.slot_id };
  }

  async function reservedOf(slotId: string): Promise<number> {
    const r = await db().execute<{ reserved: number }>(
      sql`SELECT reserved FROM time_slots WHERE id = ${slotId}`,
    );
    return Number(r.rows[0]?.reserved ?? -1);
  }

  /** Minimální objednávka na jednu časovku – jeden dospělý na místo. */
  async function makeOrder(slotId: string, qty: number): Promise<string> {
    const number = `TEST-${randomUUID().slice(0, 8)}`;
    const res = await db().execute<{ id: string }>(sql`
      WITH tt AS (
        INSERT INTO ticket_types (code, name_cs, name_en, price_czk, counts_to_capacity)
        VALUES (${'test_' + randomUUID().slice(0, 8)}, 'Test', 'Test', 120, true)
        RETURNING id
      ), o AS (
        INSERT INTO orders (order_number, email, total_czk)
        VALUES (${number}, 'test@example.org', ${120 * qty})
        RETURNING id
      ), oi AS (
        INSERT INTO order_items (order_id, ticket_type_id, slot_id, quantity, unit_price_czk)
        SELECT o.id, tt.id, ${slotId}, ${qty}, 120 FROM o, tt
        RETURNING order_id
      )
      SELECT id FROM o
    `);
    const id = res.rows[0]?.id;
    assert.ok(id, 'testovací objednávka se nevytvořila');
    return id;
  }

  it('1. nepřeprodá: 50 souběžných holdů proti kapacitě 10', async () => {
    const { slotId } = await makeSlot(10);

    const results = await Promise.all(Array.from({ length: 50 }, () => createHold(slotId, 1)));

    const ok = results.filter((r) => r.ok);
    const sold = results.filter((r) => !r.ok && r.reason === 'vyprodano');

    assert.equal(ok.length, 10, 'projít smí přesně tolik holdů, kolik je kapacita');
    assert.equal(sold.length, 40);
    assert.equal(await reservedOf(slotId), 10);
  });

  it('2. propadlý hold vrátí kapacitu do prodeje', async () => {
    const { slotId } = await makeSlot(2);

    const h1 = await createHold(slotId, 2, 15);
    assert.ok(h1.ok);
    assert.equal(await reservedOf(slotId), 2);

    // Vyprodáno, dokud hold platí.
    const blocked = await createHold(slotId, 1);
    assert.equal(blocked.ok, false);

    // Posuneme expiraci do minulosti místo čekání 15 minut.
    await db().execute(sql`UPDATE holds SET expires_at = now() - interval '1 minute' WHERE slot_id = ${slotId}`);

    const releasedCount = await releaseExpiredHolds();
    assert.ok(releasedCount >= 1);
    assert.equal(await reservedOf(slotId), 0);

    const again = await createHold(slotId, 2);
    assert.ok(again.ok);

    // Uklízeč je idempotentní – druhý běh už nic nesmí strhnout.
    await releaseExpiredHolds();
    assert.equal(await reservedOf(slotId), 2);
  });

  it('3. webhook po expiraci holdu nepřeprodá a označí objednávku k vrácení', async () => {
    const { slotId } = await makeSlot(1);

    // Zákazník A si drží jediné místo a založí objednávku.
    const holdA = await createHold(slotId, 1, 15);
    assert.ok(holdA.ok);
    const orderA = await makeOrder(slotId, 1);
    assert.deepEqual(await confirmHold(holdA.holdId, orderA), { ok: true });

    // Hold "propadne" a je uklizen ještě před platbou – simulujeme tím
    // pomalého zákazníka v bance. (Uklízeč bere i navázané holdy jen tehdy,
    // když je někdo ručně odváže; tady to uděláme explicitně.)
    await db().execute(sql`UPDATE holds SET order_id = NULL, expires_at = now() - interval '1 minute'
                            WHERE slot_id = ${slotId}`);
    await releaseExpiredHolds();
    assert.equal(await reservedOf(slotId), 0);

    // Mezitím místo koupí zákazník B.
    const holdB = await createHold(slotId, 1, 15);
    assert.ok(holdB.ok);
    assert.equal(await reservedOf(slotId), 1);

    // A teprve teď dorazí platba zákazníka A.
    const res = await settleWebhook({
      orderId: orderA,
      gatewayTransactionId: `test-${randomUUID()}`,
      gatewayStatus: 'PAID',
      paid: true,
      amountCzk: 120,
      rawPayload: { test: true },
    });

    assert.equal(res.outcome, 'k_vraceni');
    assert.equal(res.orderStatus, 'k_vraceni');
    assert.equal(res.needsHumanAlert, true);
    assert.deepEqual(res.failedSlotIds, [slotId]);
    // Nejdůležitější řádek celého souboru: kapacita se nepřekročila.
    assert.equal(await reservedOf(slotId), 1);
  });

  it('4. webhook je idempotentní podle gateway_transaction_id', async () => {
    const { slotId } = await makeSlot(5);

    const hold = await createHold(slotId, 2, 15);
    assert.ok(hold.ok);
    const orderId = await makeOrder(slotId, 2);
    assert.deepEqual(await confirmHold(hold.holdId, orderId), { ok: true });

    const txId = `test-${randomUUID()}`;
    const payload = {
      orderId,
      gatewayTransactionId: txId,
      gatewayStatus: 'PAID',
      paid: true,
      amountCzk: 240,
    } as const;

    const first = await settleWebhook(payload);
    const second = await settleWebhook(payload);

    assert.equal(first.outcome, 'zaplaceno');
    assert.equal(second.outcome, 'duplicita');
    assert.equal(second.orderStatus, 'zaplaceno');

    const payments = await db().execute<{ n: number }>(
      sql`SELECT count(*)::int AS n FROM payments WHERE order_id = ${orderId}`,
    );
    assert.equal(Number(payments.rows[0]?.n), 1);

    // Hold už kapacitu držel, druhý průchod nesmí ukousnout nic navíc.
    assert.equal(await reservedOf(slotId), 2);
  });

  it('availability vrátí obsazenost jedním dotazem', async () => {
    const { dayId, slotId } = await makeSlot(8);
    const hold = await createHold(slotId, 3);
    assert.ok(hold.ok);

    const rows = await availability([dayId]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.slotId, slotId);
    assert.equal(rows[0]!.capacity, 8);
    assert.equal(rows[0]!.reserved, 3);
    assert.equal(rows[0]!.remaining, 5);

    assert.deepEqual(await availability([]), []);
  });
});
