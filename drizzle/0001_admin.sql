-- =============================================================================
-- 0001_admin – administrace: uživatelé, session, obsah, novinky, nastavení,
-- audit a perzistentní rate limit.
--
-- Psáno ručně (ne `pnpm db:generate`), aby šla migrace pustit opakovaně bez
-- pádu – na produkci ji spouštíme z konzole a nechceme si hlídat, kolikrát
-- doběhla. Stejný styl jako ruční doplňky v 0000_init.sql: `IF NOT EXISTS`,
-- kde to Postgres umí, a `DROP CONSTRAINT IF EXISTS` + `ADD` tam, kde ne.
-- =============================================================================

-- CREATE TYPE nezná IF NOT EXISTS, odchytáváme duplicitu výjimkou.
DO $$ BEGIN
  CREATE TYPE "public"."admin_role" AS ENUM('majitel', 'obsluha');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'obsluha' NOT NULL,
	"totp_secret" text,
	"last_login_at" timestamp with time zone,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"disabled_at" timestamp with time zone
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"user_agent" text,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "content_blocks" (
	"key" text PRIMARY KEY NOT NULL,
	"cs" text,
	"en" text,
	"de" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"published_at" timestamp with time zone,
	"pinned_until" timestamp with time zone,
	"title_cs" text NOT NULL,
	"title_en" text,
	"title_de" text,
	"body_cs" text NOT NULL,
	"body_en" text,
	"body_de" text,
	"image_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid,
	"action" text NOT NULL,
	"entity" text,
	"entity_id" text,
	"detail" jsonb,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"ip" text NOT NULL,
	"ok" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Cizí klíče. `ADD CONSTRAINT IF NOT EXISTS` neexistuje, drop + add je idempotentní.
ALTER TABLE "admin_sessions" DROP CONSTRAINT IF EXISTS "admin_sessions_admin_user_id_admin_users_id_fk";--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_user_id_admin_users_id_fk"
  FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "content_blocks" DROP CONSTRAINT IF EXISTS "content_blocks_updated_by_admin_users_id_fk";--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_updated_by_admin_users_id_fk"
  FOREIGN KEY ("updated_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "settings" DROP CONSTRAINT IF EXISTS "settings_updated_by_admin_users_id_fk";--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_admin_users_id_fk"
  FOREIGN KEY ("updated_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- Audit musí přežít smazání účtu, proto SET NULL a ne CASCADE.
ALTER TABLE "audit_log" DROP CONSTRAINT IF EXISTS "audit_log_admin_user_id_admin_users_id_fk";--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_user_id_admin_users_id_fk"
  FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- Indexy.
CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_key" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admin_sessions_token_hash_key" ON "admin_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_sessions_admin_user_id_idx" ON "admin_sessions" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_sessions_expires_at_idx" ON "admin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "news_slug_key" ON "news" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "news_published_at_idx" ON "news" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "login_attempts_ip_created_idx" ON "login_attempts" USING btree ("ip","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "login_attempts_email_created_idx" ON "login_attempts" USING btree ("email","created_at");--> statement-breakpoint

-- Stejný invariant jako u `users`: unique index nad e-mailem je case-sensitive,
-- takže by "Josef@…" a "josef@…" prošly jako dva účty do administrace.
ALTER TABLE "admin_users" DROP CONSTRAINT IF EXISTS "admin_users_email_lowercase";--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_email_lowercase" CHECK (email = lower(email));--> statement-breakpoint

ALTER TABLE "admin_users" DROP CONSTRAINT IF EXISTS "admin_users_failed_attempts_nonneg";--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_failed_attempts_nonneg" CHECK (failed_attempts >= 0);--> statement-breakpoint

-- Klíč obsahového bloku má tvar "<stránka>:<blok>"; bez dvojtečky by se
-- administraci rozpadlo řazení bloků po stránkách.
ALTER TABLE "content_blocks" DROP CONSTRAINT IF EXISTS "content_blocks_key_shape";--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_key_shape" CHECK ("key" ~ '^[a-z0-9_-]+:[a-z0-9_.-]+$');--> statement-breakpoint

-- Prošlá session nesmí vzniknout ani ručním INSERTem.
ALTER TABLE "admin_sessions" DROP CONSTRAINT IF EXISTS "admin_sessions_time_order";--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_time_order" CHECK (expires_at > created_at);--> statement-breakpoint

-- Živé session obsluhy – dotaz při každém requestu do administrace.
CREATE INDEX IF NOT EXISTS "admin_sessions_active_idx" ON "admin_sessions" USING btree ("expires_at")
  WHERE revoked_at IS NULL;--> statement-breakpoint

-- Veřejný výpis novinek jede výhradně přes publikované záznamy.
CREATE INDEX IF NOT EXISTS "news_public_idx" ON "news" USING btree ("published_at" DESC)
  WHERE published_at IS NOT NULL;--> statement-breakpoint

-- Rate limit se ptá jen na neúspěchy v posledních minutách.
CREATE INDEX IF NOT EXISTS "login_attempts_failed_idx" ON "login_attempts" USING btree ("created_at")
  WHERE NOT ok;--> statement-breakpoint

-- =============================================================================
-- Změny existujících tabulek
-- =============================================================================

-- Německá mutace ceníku. NOT NULL DEFAULT '' místo nullable – viz schema.ts.
ALTER TABLE "ticket_types" ADD COLUMN IF NOT EXISTS "name_de" text DEFAULT '' NOT NULL;--> statement-breakpoint

UPDATE "ticket_types" SET "name_de" = 'Erwachsener'
 WHERE "code" = 'dospely' AND "name_de" = '';--> statement-breakpoint
UPDATE "ticket_types" SET "name_de" = 'Ermäßigt (Kind / Student / Senior / Behinderte)'
 WHERE "code" = 'snizene' AND "name_de" = '';--> statement-breakpoint
UPDATE "ticket_types" SET "name_de" = 'Kind unter 2 Jahren'
 WHERE "code" = 'dite_do_2' AND "name_de" = '';--> statement-breakpoint
UPDATE "ticket_types" SET "name_de" = 'Hund'
 WHERE "code" = 'pes' AND "name_de" = '';--> statement-breakpoint

-- Odhlášení z rozesílky značkujeme, řádek nemažeme (doložitelnost souhlasu).
ALTER TABLE "newsletter_signups" ADD COLUMN IF NOT EXISTS "unsubscribed_at" timestamp with time zone;--> statement-breakpoint

-- Rozesílka teď musí vynechat i odhlášené; původní `newsletter_confirmed_idx`
-- z 0000_init na to nestačí.
CREATE INDEX IF NOT EXISTS "newsletter_active_idx" ON "newsletter_signups" USING btree ("confirmed_at")
  WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL;
