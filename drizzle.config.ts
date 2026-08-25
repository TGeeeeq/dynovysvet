import { defineConfig } from 'drizzle-kit';

/**
 * `drizzle-kit generate` čte jen schéma a připojení nepotřebuje – proto tu
 * DATABASE_URL nevynucujeme a prázdný řetězec necháme spadnout až na `push`,
 * kde chybějící URL vypíše srozumitelnou chybu sám drizzle-kit.
 */
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  strict: true,
  verbose: true,
});
