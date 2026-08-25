/**
 * Databázové schéma – Dýňový svět, Statek u Pipků.
 *
 * Konvence:
 *  - PK jsou uuid generované databází (`gen_random_uuid()`), ne aplikací – objednávku
 *    tak nelze "uhodnout" a nemusíme řešit kolize při paralelních zápisech.
 *  - Všechny časové značky jsou `timestamptz`. Statek jede v Europe/Prague, ale ukládat
 *    lokální čas bez zóny se nevyplácí kvůli přechodu na zimní čas (poslední říjnový
 *    víkend padne doprostřed sezóny).
 *  - Ceny v celých korunách (int). Vstupné haléře nemá a `numeric` by nás nutil
 *    řešit desetinná čísla v JS.
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const tstz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });
const pk = () => uuid('id').primaryKey().default(sql`gen_random_uuid()`);
const now = sql`now()`;

/* ------------------------------------------------------------------ enums */

export const userRole = pgEnum('user_role', ['zakaznik', 'obsluha', 'admin']);

export const orderStatus = pgEnum('order_status', [
  'ceka_na_platbu',
  'zaplaceno',
  'zruseno',
  'expirovano',
  'k_vraceni', // platba dorazila, ale kapacita už nebyla – nutný ruční refund
]);

export const paymentGateway = pgEnum('payment_gateway', ['comgate']);

export const inquiryKind = pgEnum('inquiry_kind', ['skola', 'pronajem', 'blesi_trh', 'obecny']);

/* ------------------------------------------------------------------ users */

export const users = pgTable(
  'users',
  {
    id: pk(),
    // E-mail držíme vždy lowercase (viz `normalizeEmail`); citext v Neonu není
    // ve výchozím stavu k dispozici, takže unikátnost řešíme normalizací na zápisu
    // plus unique indexem nad `lower(email)` v 0000_init.sql.
    email: text('email').notNull(),
    name: text('name'),
    phone: text('phone'),
    // Nullable – nákup bez registrace je hlavní scénář, účet je bonus.
    passwordHash: text('password_hash'),
    role: userRole('role').notNull().default('zakaznik'),
    emailVerifiedAt: tstz('email_verified_at'),
    createdAt: tstz('created_at').notNull().default(now),
  },
  (t) => [uniqueIndex('users_email_key').on(t.email)],
);

export const sessions = pgTable(
  'sessions',
  {
    id: pk(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: tstz('expires_at').notNull(),
    createdAt: tstz('created_at').notNull().default(now),
  },
  (t) => [index('sessions_user_id_idx').on(t.userId), index('sessions_expires_at_idx').on(t.expiresAt)],
);

/* ------------------------------------------------- provozní dny a časovky */

export const eventDays = pgTable(
  'event_days',
  {
    id: pk(),
    // `mode: 'string'` – kalendářní den je YYYY-MM-DD, ne okamžik. Date objekt by
    // se nám tu jen posouval o timezone.
    date: date('date', { mode: 'string' }).notNull(),
    opensAt: tstz('opens_at').notNull(),
    closesAt: tstz('closes_at').notNull(),
    slotMinutes: integer('slot_minutes').notNull().default(60),
    note: text('note'),
    published: boolean('published').notNull().default(false),
  },
  (t) => [uniqueIndex('event_days_date_key').on(t.date), index('event_days_published_idx').on(t.published, t.date)],
);

export const timeSlots = pgTable(
  'time_slots',
  {
    id: pk(),
    eventDayId: uuid('event_day_id')
      .notNull()
      .references(() => eventDays.id, { onDelete: 'cascade' }),
    startsAt: tstz('starts_at').notNull(),
    endsAt: tstz('ends_at').notNull(),
    capacity: integer('capacity').notNull(),
    // Jediný zdroj pravdy o obsazenosti. Nikdy se nedopočítává agregací přes holds
    // ani tickets – to by pod souběhem nešlo udělat atomicky bez zámku celé tabulky.
    reserved: integer('reserved').notNull().default(0),
    createdAt: tstz('created_at').notNull().default(now),
  },
  (t) => [
    unique('time_slots_day_start_key').on(t.eventDayId, t.startsAt),
    index('time_slots_starts_at_idx').on(t.startsAt),
    // Pojistka proti přeprodeji na úrovni DB – aplikační logika ji nesmí potřebovat,
    // ale kdyby se někdo hrabal v datech ručně, spadne to tady.
    check('no_overbook', sql`reserved >= 0 AND reserved <= capacity`),
  ],
);

/* --------------------------------------------------------- typy vstupenek */

export const ticketTypes = pgTable(
  'ticket_types',
  {
    id: pk(),
    code: text('code').notNull(),
    nameCs: text('name_cs').notNull(),
    nameEn: text('name_en').notNull(),
    priceCzk: integer('price_czk').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    active: boolean('active').notNull().default(true),
    // Pes a dítě do 2 let projdou branou, ale kapacitu časovky nežerou.
    countsToCapacity: boolean('counts_to_capacity').notNull().default(true),
  },
  (t) => [uniqueIndex('ticket_types_code_key').on(t.code), index('ticket_types_sort_idx').on(t.sortOrder)],
);

/** Ceník 2025 – seed data, ne konstanty. Ceny se mění každou sezónu z admina. */
export const TICKET_TYPE_SEED = [
  { code: 'dospely', nameCs: 'Dospělý', nameEn: 'Adult', priceCzk: 120, sortOrder: 10, countsToCapacity: true },
  {
    code: 'snizene',
    nameCs: 'Snížené (dítě / student / senior / ZTP)',
    nameEn: 'Reduced (child / student / senior / disabled)',
    priceCzk: 100,
    sortOrder: 20,
    countsToCapacity: true,
  },
  {
    code: 'dite_do_2',
    nameCs: 'Dítě do 2 let',
    nameEn: 'Child under 2',
    priceCzk: 0,
    sortOrder: 30,
    countsToCapacity: false,
  },
  { code: 'pes', nameCs: 'Pes', nameEn: 'Dog', priceCzk: 10, sortOrder: 40, countsToCapacity: false },
] as const satisfies ReadonlyArray<{
  code: string;
  nameCs: string;
  nameEn: string;
  priceCzk: number;
  sortOrder: number;
  countsToCapacity: boolean;
}>;

/* --------------------------------------------------------------- prodejce */

/** Fakturační údaje prodejce – plátce DPH. Používá se na dokladech a v SPAYD QR. */
export const SELLER = {
  name: 'Josef Pipek',
  ico: '45904472',
  vatPayer: true,
  bankAccount: '2667118524/0600',
} as const;

/* ------------------------------------------------------------ objednávky */

export const orders = pgTable(
  'orders',
  {
    id: pk(),
    // Lidsky čitelné číslo pro komunikaci se zákazníkem, formát DS<rok>-<pořadí>.
    orderNumber: text('order_number').notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    name: text('name'),
    phone: text('phone'),
    status: orderStatus('status').notNull().default('ceka_na_platbu'),
    totalCzk: integer('total_czk').notNull(),
    currency: text('currency').notNull().default('CZK'),
    note: text('note'),
    locale: text('locale').notNull().default('cs'),
    createdAt: tstz('created_at').notNull().default(now),
    paidAt: tstz('paid_at'),
  },
  (t) => [
    uniqueIndex('orders_order_number_key').on(t.orderNumber),
    index('orders_email_idx').on(t.email),
    index('orders_status_created_idx').on(t.status, t.createdAt),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: pk(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    ticketTypeId: uuid('ticket_type_id')
      .notNull()
      .references(() => ticketTypes.id, { onDelete: 'restrict' }),
    // Nullable – zboží z e-shopu (dýně, mošt) se neváže na časovku.
    slotId: uuid('slot_id').references(() => timeSlots.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull(),
    // Cena se kopíruje do položky: ceník se v průběhu sezóny mění, doklad ne.
    unitPriceCzk: integer('unit_price_czk').notNull(),
  },
  (t) => [index('order_items_order_id_idx').on(t.orderId), index('order_items_slot_id_idx').on(t.slotId)],
);

/* -------------------------------------------------------------- rezervace */

export const holds = pgTable(
  'holds',
  {
    id: pk(),
    slotId: uuid('slot_id')
      .notNull()
      .references(() => timeSlots.id, { onDelete: 'cascade' }),
    qty: integer('qty').notNull(),
    expiresAt: tstz('expires_at').notNull(),
    // Dokud je NULL, jde o dočasnou blokaci v košíku a uklízeč ji smí zrušit.
    // Po navázání na objednávku už kapacitu drží natrvalo.
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    createdAt: tstz('created_at').notNull().default(now),
  },
  (t) => [
    index('holds_slot_id_idx').on(t.slotId),
    index('holds_order_id_idx').on(t.orderId),
    // Partial index – uklízeč se ptá výhradně na nenavázané holdy, plný index
    // by zbytečně rostl o všechny zaplacené objednávky sezóny.
    index('holds_expiring_idx').on(t.expiresAt).where(sql`order_id IS NULL`),
  ],
);

/* ------------------------------------------------------------- vstupenky */

export const tickets = pgTable(
  'tickets',
  {
    id: pk(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    slotId: uuid('slot_id')
      .notNull()
      .references(() => timeSlots.id, { onDelete: 'restrict' }),
    ticketTypeId: uuid('ticket_type_id')
      .notNull()
      .references(() => ticketTypes.id, { onDelete: 'restrict' }),
    // Podepsaný neprůchodný token (viz src/lib/tickets/token.ts). Ukládáme ho celý,
    // aby šla vstupenka kdykoli znovu vygenerovat do e-mailu bez re-podpisu.
    token: text('token').notNull(),
    checkedInAt: tstz('checked_in_at'),
    checkedInBy: uuid('checked_in_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (t) => [
    uniqueIndex('tickets_token_key').on(t.token),
    index('tickets_order_id_idx').on(t.orderId),
    index('tickets_slot_id_idx').on(t.slotId),
  ],
);

/* ---------------------------------------------------------------- platby */

export const payments = pgTable(
  'payments',
  {
    id: pk(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    gateway: paymentGateway('gateway').notNull().default('comgate'),
    // UNIQUE = idempotence webhooku. Comgate doručuje opakovaně, dokud
    // nedostane 200; druhý průchod musí spadnout na konfliktu, ne na aplikační logice.
    gatewayTransactionId: text('gateway_transaction_id').notNull(),
    status: text('status').notNull(),
    amountCzk: integer('amount_czk').notNull(),
    rawPayload: jsonb('raw_payload'),
    createdAt: tstz('created_at').notNull().default(now),
  },
  (t) => [
    uniqueIndex('payments_gateway_tx_key').on(t.gatewayTransactionId),
    index('payments_order_id_idx').on(t.orderId),
  ],
);

/* ------------------------------------------------------- poptávky, mailing */

export const inquiries = pgTable(
  'inquiries',
  {
    id: pk(),
    kind: inquiryKind('kind').notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    preferredDate: date('preferred_date', { mode: 'string' }),
    message: text('message'),
    // Volné pole pro specifika typu poptávky (počet dětí, ročník, metry stánku…).
    extra: jsonb('extra'),
    handledAt: tstz('handled_at'),
    createdAt: tstz('created_at').notNull().default(now),
  },
  (t) => [index('inquiries_kind_handled_idx').on(t.kind, t.handledAt), index('inquiries_created_idx').on(t.createdAt)],
);

export const newsletterSignups = pgTable(
  'newsletter_signups',
  {
    id: pk(),
    email: text('email').notNull(),
    locale: text('locale').notNull().default('cs'),
    source: text('source'),
    // Double opt-in: bez confirmedAt se nerozesílá.
    confirmedAt: tstz('confirmed_at'),
    createdAt: tstz('created_at').notNull().default(now),
  },
  (t) => [uniqueIndex('newsletter_signups_email_key').on(t.email)],
);

/* ------------------------------------------------------------------ typy */

export type User = typeof users.$inferSelect;
export type EventDay = typeof eventDays.$inferSelect;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type TicketType = typeof ticketTypes.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Hold = typeof holds.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewsletterSignup = typeof newsletterSignups.$inferSelect;

export type OrderStatus = (typeof orderStatus.enumValues)[number];
export type UserRole = (typeof userRole.enumValues)[number];
export type InquiryKind = (typeof inquiryKind.enumValues)[number];

/** E-maily ukládáme jen v lowercase – jinak by unique index pustil dva "stejné" účty. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
