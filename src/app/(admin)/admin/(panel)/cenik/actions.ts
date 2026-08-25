"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";

import { audit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/admin/session";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import { TICKET_TYPE_SEED } from "@/lib/db/schema";

/**
 * Ceník vstupného.
 *
 * Celá tabulka se ukládá jedním tlačítkem — majitel obvykle před sezónou
 * projde všechny ceny naráz a ukládat každý řádek zvlášť by znamenalo osm
 * kliknutí a osm příležitostí, jak na půlku zapomenout.
 *
 * Změna ceny se **nepromítá do už vystavených objednávek**: `order_items`
 * si cenu kopírují při vzniku (viz `src/lib/db/schema.ts`), takže doklad
 * zůstává platný i po zdražení.
 */

export type PriceState = { error?: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Kód je vnitřní klíč druhu vstupenky — bez diakritiky, ať se nemění pod rukama. */
const CODE_RE = /^[a-z][a-z0-9_]{1,31}$/;

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "neznama";
}

/** Ceny jsou vidět na webu i v košíku, ne jen v administraci. */
function refresh(): void {
  revalidatePath("/admin/cenik");
  revalidatePath("/");
  revalidatePath("/vstupenky");
  revalidatePath("/[locale]", "layout");
}

interface ParsedRow {
  id: string | null;
  code: string;
  nameCs: string;
  nameEn: string;
  nameDe: string;
  priceCzk: number;
  sortOrder: number;
  countsToCapacity: boolean;
  active: boolean;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function wholeNumber(formData: FormData, key: string, min: number, max: number): number | null {
  const raw = text(formData, key);
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

/** Jak řádek pojmenovat v chybové hlášce, aby majitel věděl, který to je. */
function rowName(row: { nameCs: string; code: string }): string {
  return row.nameCs || row.code || "nový druh vstupenky";
}

export async function ulozitCenik(_prev: PriceState, formData: FormData): Promise<PriceState> {
  const user = await requireAdmin();
  if (!hasDatabaseUrl()) return { error: "Databáze není připojená, ceník se nemá kam uložit." };

  const rows: ParsedRow[] = [];
  const seenCodes = new Set<string>();

  for (const raw of formData.getAll("radek")) {
    const key = String(raw);
    const isNew = key.startsWith("novy_");
    if (!isNew && !UUID_RE.test(key)) return { error: "Formulář dorazil poškozený, nic se neuložilo." };

    const nameCs = text(formData, `nazev_cs__${key}`);
    const nameEn = text(formData, `nazev_en__${key}`);
    const nameDe = text(formData, `nazev_de__${key}`);
    const code = text(formData, `kod__${key}`).toLowerCase();
    const priceRaw = text(formData, `cena__${key}`);

    // Prázdný nový řádek znamená „nakonec nic nepřidávám" — přeskočíme ho.
    if (isNew && !code && !nameCs && !nameEn && !nameDe && priceRaw === "") continue;

    if (!CODE_RE.test(code)) {
      return {
        error: `Kód u „${rowName({ nameCs, code })}" musí být bez diakritiky a mezer — třeba dospely nebo rodinne.`,
      };
    }
    if (seenCodes.has(code)) {
      return { error: `Kód „${code}" je v tabulce dvakrát. Každý druh vstupenky musí mít vlastní.` };
    }
    seenCodes.add(code);

    if (!nameCs) return { error: `U „${code}" chybí český název.` };
    if (!nameEn) return { error: `U „${rowName({ nameCs, code })}" chybí anglický název.` };

    const priceCzk = wholeNumber(formData, `cena__${key}`, 0, 100_000);
    if (priceCzk === null) {
      return { error: `Cena u „${rowName({ nameCs, code })}" musí být celé číslo od 0 do 100 000 Kč.` };
    }
    const sortOrder = wholeNumber(formData, `poradi__${key}`, 0, 9999);
    if (sortOrder === null) {
      return { error: `Pořadí u „${rowName({ nameCs, code })}" musí být celé číslo od 0 do 9999.` };
    }

    rows.push({
      id: isNew ? null : key,
      code,
      nameCs: nameCs.slice(0, 120),
      nameEn: nameEn.slice(0, 120),
      nameDe: nameDe.slice(0, 120),
      priceCzk,
      sortOrder,
      countsToCapacity: formData.get(`kapacita__${key}`) === "1",
      active: formData.get(`prodej__${key}`) === "1",
    });
  }

  if (rows.length === 0) return { error: "Ceník nemůže zůstat prázdný." };

  try {
    const db = getDb();
    await db.transaction(async (tx) => {
      for (const row of rows) {
        if (row.id) {
          await tx
            .update(schema.ticketTypes)
            .set({
              nameCs: row.nameCs,
              nameEn: row.nameEn,
              nameDe: row.nameDe,
              priceCzk: row.priceCzk,
              sortOrder: row.sortOrder,
              countsToCapacity: row.countsToCapacity,
              active: row.active,
            })
            .where(eq(schema.ticketTypes.id, row.id));
        } else {
          await tx.insert(schema.ticketTypes).values({
            code: row.code,
            nameCs: row.nameCs,
            nameEn: row.nameEn,
            nameDe: row.nameDe,
            priceCzk: row.priceCzk,
            sortOrder: row.sortOrder,
            countsToCapacity: row.countsToCapacity,
            active: row.active,
          });
        }
      }
    });
  } catch (error) {
    console.error("[admin/cenik] uložení ceníku selhalo:", error);
    return {
      error:
        "Ceník se nepodařilo uložit. Nejčastější příčina je kód, který už u jiného druhu vstupenky existuje.",
    };
  }

  await audit(user.id, "cenik.ulozen", {
    entity: "ticket_types",
    detail: {
      radku: rows.length,
      ceny: rows.map((r) => ({ kod: r.code, cena: r.priceCzk, v_prodeji: r.active })),
    },
    ip: await clientIp(),
  });

  refresh();
  redirect("/admin/cenik?z=ulozeno");
}

/** Naplní prázdný ceník sazbami z roku 2025, ať majitel nezačíná od nuly. */
export async function nacistCenik2025(): Promise<void> {
  const user = await requireAdmin();
  if (!hasDatabaseUrl()) redirect("/admin/cenik?z=bez_databaze");

  // `redirect()` funguje tak, že vyhodí vlastní chybu — uvnitř `try` by ji
  // spolkl `catch`. Výsledek si proto odložíme a přesměrujeme až nakonec.
  let outcome: "nacteno" | "neprazdny" | "chyba";
  try {
    const db = getDb();
    const [existing] = await db.select({ n: count() }).from(schema.ticketTypes);
    if ((existing?.n ?? 0) > 0) {
      // Seed je nabídka pro prázdnou tabulku, ne tlačítko na přepsání ceníku.
      outcome = "neprazdny";
    } else {
      await db
        .insert(schema.ticketTypes)
        .values(TICKET_TYPE_SEED.map((t) => ({ ...t })))
        .onConflictDoNothing({ target: schema.ticketTypes.code });
      outcome = "nacteno";
    }
  } catch (error) {
    console.error("[admin/cenik] načtení ceníku 2025 selhalo:", error);
    outcome = "chyba";
  }

  if (outcome === "nacteno") {
    await audit(user.id, "cenik.seed_2025", {
      entity: "ticket_types",
      detail: { kody: TICKET_TYPE_SEED.map((t) => t.code) },
      ip: await clientIp(),
    });
    refresh();
  }

  redirect(`/admin/cenik?z=${outcome}`);
}
