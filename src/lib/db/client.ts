/**
 * Připojení k Neonu.
 *
 * Používáme WebSocket driver (`neon-serverless`), ne HTTP. HTTP driver je sice
 * rychlejší na jednorázový dotaz, ale neumí interaktivní transakce – a celá
 * rezervační logika stojí na tom, že `reserveSlot` + zápis holdu proběhnou
 * v jedné transakci.
 *
 * Pool je modulová singletonka: v serverless runtime se instance recykluje mezi
 * requesty a otevírat nové spojení na každý request by nás stálo latenci i limity.
 */
import { Pool } from '@neondatabase/serverless';
import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

export type Db = NeonDatabase<typeof schema>;
/** Transakční handle, jak ho předává `db.transaction(cb)`. */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
/** Cokoli, na čem lze spustit dotaz – umožňuje volat helpery uvnitř i vně transakce. */
export type Queryable = Db | Tx;

let pool: Pool | undefined;
let database: Db | undefined;

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Vrací drizzle klienta. Inicializace je líná schválně – testy a build kroky
 * modul importují, aniž by měly DATABASE_URL, a nesmí kvůli tomu spadnout.
 */
export function getDb(): Db {
  if (database) return database;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL není nastavena.');
  }

  pool = new Pool({ connectionString: url });
  database = drizzle(pool, { schema });
  return database;
}

/** Uzavře pool – volá se jen v testech a v jednorázových skriptech. */
export async function closeDb(): Promise<void> {
  const p = pool;
  pool = undefined;
  database = undefined;
  if (p) await p.end();
}

export { schema };
