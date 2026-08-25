-- =============================================================================
-- 0000_init – Dýňový svět, výchozí schéma.
--
-- Tabulková část dole vznikla z `pnpm db:generate`; sekce "ruční doplňky" na
-- konci je psaná rukou. Jsou v ní CHECK constrainty, částečné indexy a seed
-- ceníku, které z drizzle schématu nevypadnou.
--
-- POZOR na `pnpm db:push`: push porovnává živou databázi proti schema.ts a ruční
-- doplňky by chtěl zahodit. Na produkci proto migrujeme přes tenhle soubor
-- (`drizzle-kit migrate`), push je jen na jednorázové lokální experimenty –
-- a po něm je potřeba spustit sekci ručních doplňků znovu.
-- =============================================================================

-- gen_random_uuid() je od PG13 v jádře; extension držíme kvůli starším instancím
-- a lokálním dockerům.
CREATE EXTENSION IF NOT EXISTS pgcrypto;--> statement-breakpoint
CREATE TYPE "public"."inquiry_kind" AS ENUM('skola', 'pronajem', 'blesi_trh', 'obecny');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('ceka_na_platbu', 'zaplaceno', 'zruseno', 'expirovano', 'k_vraceni');--> statement-breakpoint
CREATE TYPE "public"."payment_gateway" AS ENUM('comgate');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('zakaznik', 'obsluha', 'admin');--> statement-breakpoint
CREATE TABLE "event_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"opens_at" timestamp with time zone NOT NULL,
	"closes_at" timestamp with time zone NOT NULL,
	"slot_minutes" integer DEFAULT 60 NOT NULL,
	"note" text,
	"published" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "holds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_id" uuid NOT NULL,
	"qty" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"order_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "inquiry_kind" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"preferred_date" date,
	"message" text,
	"extra" jsonb,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_signups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"locale" text DEFAULT 'cs' NOT NULL,
	"source" text,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"ticket_type_id" uuid NOT NULL,
	"slot_id" uuid,
	"quantity" integer NOT NULL,
	"unit_price_czk" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"name" text,
	"phone" text,
	"status" "order_status" DEFAULT 'ceka_na_platbu' NOT NULL,
	"total_czk" integer NOT NULL,
	"currency" text DEFAULT 'CZK' NOT NULL,
	"note" text,
	"locale" text DEFAULT 'cs' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"gateway" "payment_gateway" DEFAULT 'comgate' NOT NULL,
	"gateway_transaction_id" text NOT NULL,
	"status" text NOT NULL,
	"amount_czk" integer NOT NULL,
	"raw_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name_cs" text NOT NULL,
	"name_en" text NOT NULL,
	"price_czk" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"counts_to_capacity" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"slot_id" uuid NOT NULL,
	"ticket_type_id" uuid NOT NULL,
	"token" text NOT NULL,
	"checked_in_at" timestamp with time zone,
	"checked_in_by" uuid
);
--> statement-breakpoint
CREATE TABLE "time_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_day_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"capacity" integer NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "time_slots_day_start_key" UNIQUE("event_day_id","starts_at"),
	CONSTRAINT "no_overbook" CHECK (reserved >= 0 AND reserved <= capacity)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"phone" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'zakaznik' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "holds" ADD CONSTRAINT "holds_slot_id_time_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."time_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holds" ADD CONSTRAINT "holds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_slot_id_time_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."time_slots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_slot_id_time_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."time_slots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_event_day_id_event_days_id_fk" FOREIGN KEY ("event_day_id") REFERENCES "public"."event_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_days_date_key" ON "event_days" USING btree ("date");--> statement-breakpoint
CREATE INDEX "event_days_published_idx" ON "event_days" USING btree ("published","date");--> statement-breakpoint
CREATE INDEX "holds_slot_id_idx" ON "holds" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "holds_order_id_idx" ON "holds" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "holds_expiring_idx" ON "holds" USING btree ("expires_at") WHERE order_id IS NULL;--> statement-breakpoint
CREATE INDEX "inquiries_kind_handled_idx" ON "inquiries" USING btree ("kind","handled_at");--> statement-breakpoint
CREATE INDEX "inquiries_created_idx" ON "inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_signups_email_key" ON "newsletter_signups" USING btree ("email");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_slot_id_idx" ON "order_items" USING btree ("slot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_gateway_tx_key" ON "payments" USING btree ("gateway_transaction_id");--> statement-breakpoint
CREATE INDEX "payments_order_id_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_types_code_key" ON "ticket_types" USING btree ("code");--> statement-breakpoint
CREATE INDEX "ticket_types_sort_idx" ON "ticket_types" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_token_key" ON "tickets" USING btree ("token");--> statement-breakpoint
CREATE INDEX "tickets_order_id_idx" ON "tickets" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "tickets_slot_id_idx" ON "tickets" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "time_slots_starts_at_idx" ON "time_slots" USING btree ("starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");--> statement-breakpoint

-- =============================================================================
-- RUČNÍ DOPLŇKY
-- Vzor `DROP CONSTRAINT IF EXISTS` + `ADD CONSTRAINT` je tu proto, že Postgres
-- nezná `ADD CONSTRAINT IF NOT EXISTS`; takhle je celý blok idempotentní.
-- =============================================================================

-- Klíčová pojistka celé aplikace: přeprodej nesmí projít ani ručním UPDATE.
-- `reserveSlot()` si podmínku hlídá sám, tohle je poslední záchranná síť.
ALTER TABLE "time_slots" DROP CONSTRAINT IF EXISTS "no_overbook";--> statement-breakpoint
ALTER TABLE "time_slots" ADD CONSTRAINT "no_overbook" CHECK (reserved >= 0 AND reserved <= capacity);--> statement-breakpoint

ALTER TABLE "time_slots" DROP CONSTRAINT IF EXISTS "time_slots_capacity_positive";--> statement-breakpoint
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_capacity_positive" CHECK (capacity > 0);--> statement-breakpoint

ALTER TABLE "time_slots" DROP CONSTRAINT IF EXISTS "time_slots_time_order";--> statement-breakpoint
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_time_order" CHECK (ends_at > starts_at);--> statement-breakpoint

ALTER TABLE "event_days" DROP CONSTRAINT IF EXISTS "event_days_time_order";--> statement-breakpoint
ALTER TABLE "event_days" ADD CONSTRAINT "event_days_time_order" CHECK (closes_at > opens_at);--> statement-breakpoint

ALTER TABLE "event_days" DROP CONSTRAINT IF EXISTS "event_days_slot_minutes_positive";--> statement-breakpoint
ALTER TABLE "event_days" ADD CONSTRAINT "event_days_slot_minutes_positive" CHECK (slot_minutes > 0);--> statement-breakpoint

-- Hold s nulovým nebo záporným qty by uklízeči rozhodil `reserved`.
ALTER TABLE "holds" DROP CONSTRAINT IF EXISTS "holds_qty_positive";--> statement-breakpoint
ALTER TABLE "holds" ADD CONSTRAINT "holds_qty_positive" CHECK (qty > 0);--> statement-breakpoint

ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_quantity_positive";--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_positive" CHECK (quantity > 0);--> statement-breakpoint

ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_price_nonneg";--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_price_nonneg" CHECK (unit_price_czk >= 0);--> statement-breakpoint

ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_total_nonneg";--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_total_nonneg" CHECK (total_czk >= 0);--> statement-breakpoint

-- Zaplacená objednávka musí mít čas platby; bez toho nedáme dohromady uzávěrku.
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_paid_at_present";--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_paid_at_present"
  CHECK (status <> 'zaplaceno' OR paid_at IS NOT NULL);--> statement-breakpoint

ALTER TABLE "ticket_types" DROP CONSTRAINT IF EXISTS "ticket_types_price_nonneg";--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_price_nonneg" CHECK (price_czk >= 0);--> statement-breakpoint

ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_amount_nonneg";--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_nonneg" CHECK (amount_czk >= 0);--> statement-breakpoint

-- E-maily normalizuje `normalizeEmail()` v aplikaci; unikátní index nad `email`
-- je case-sensitive, takže by "Jan@…" i "jan@…" prošly jako dva účty. Citext
-- v Neonu zapnutý nemáme, invariant proto vynutíme přímo.
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_lowercase";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_lowercase" CHECK (email = lower(email));--> statement-breakpoint

ALTER TABLE "newsletter_signups" DROP CONSTRAINT IF EXISTS "newsletter_email_lowercase";--> statement-breakpoint
ALTER TABLE "newsletter_signups" ADD CONSTRAINT "newsletter_email_lowercase" CHECK (email = lower(email));--> statement-breakpoint

-- Částečné indexy pro horké dotazy. Všechny míří na malý podíl řádků, takže
-- plný index by byl jen dražší.

-- Uklízeč propadlých košíků (releaseExpiredHolds) – běží každou minutu.
CREATE INDEX IF NOT EXISTS "holds_expiring_idx" ON "holds" USING btree ("expires_at") WHERE order_id IS NULL;--> statement-breakpoint

-- Sweeper nezaplacených objednávek.
CREATE INDEX IF NOT EXISTS "orders_pending_idx" ON "orders" USING btree ("created_at") WHERE status = 'ceka_na_platbu';--> statement-breakpoint

-- Fronta pro obsluhu: co je potřeba ručně vrátit.
CREATE INDEX IF NOT EXISTS "orders_refund_idx" ON "orders" USING btree ("created_at") WHERE status = 'k_vraceni';--> statement-breakpoint

-- Brána se ptá "kdo z téhle časovky ještě nedorazil".
CREATE INDEX IF NOT EXISTS "tickets_pending_checkin_idx" ON "tickets" USING btree ("slot_id") WHERE checked_in_at IS NULL;--> statement-breakpoint

-- Rozesílka jede jen na potvrzené adresy (double opt-in).
CREATE INDEX IF NOT EXISTS "newsletter_confirmed_idx" ON "newsletter_signups" USING btree ("confirmed_at") WHERE confirmed_at IS NOT NULL;--> statement-breakpoint

-- Nevyřízené poptávky.
CREATE INDEX IF NOT EXISTS "inquiries_open_idx" ON "inquiries" USING btree ("created_at") WHERE handled_at IS NULL;--> statement-breakpoint

-- Ceník 2025 jako seed, ne jako konstanty v kódu – ceny se každou sezónu mění
-- z administrace. `ON CONFLICT DO NOTHING` znamená, že opakované spuštění
-- migrace nepřepíše ruční úpravy cen.
INSERT INTO "ticket_types" ("code", "name_cs", "name_en", "price_czk", "sort_order", "active", "counts_to_capacity") VALUES
  ('dospely',   'Dospělý',                                   'Adult',                                    120, 10, true, true),
  ('snizene',   'Snížené (dítě / student / senior / ZTP)',   'Reduced (child / student / senior / disabled)', 100, 20, true, true),
  ('dite_do_2', 'Dítě do 2 let',                             'Child under 2',                              0, 30, true, false),
  ('pes',       'Pes',                                       'Dog',                                       10, 40, true, false)
ON CONFLICT ("code") DO NOTHING;
