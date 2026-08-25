import { asc } from "drizzle-orm";

import { czk } from "@/lib/admin/format";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import {
  Button,
  Empty,
  Hint,
  Notice,
  PageTitle,
  SectionTitle,
} from "@/components/admin/ui";
import { PriceTable, type PriceRow } from "@/components/admin/PriceTable";
import { nacistCenik2025 } from "./actions";

export const metadata = { title: "Ceník vstupného" };

/** Druhy vstupenek v pořadí, v jakém je uvidí zákazník v košíku. */
async function loadTypes(): Promise<PriceRow[]> {
  if (!hasDatabaseUrl()) return [];
  try {
    return await getDb()
      .select({
        id: schema.ticketTypes.id,
        code: schema.ticketTypes.code,
        nameCs: schema.ticketTypes.nameCs,
        nameEn: schema.ticketTypes.nameEn,
        nameDe: schema.ticketTypes.nameDe,
        priceCzk: schema.ticketTypes.priceCzk,
        sortOrder: schema.ticketTypes.sortOrder,
        countsToCapacity: schema.ticketTypes.countsToCapacity,
        active: schema.ticketTypes.active,
      })
      .from(schema.ticketTypes)
      .orderBy(asc(schema.ticketTypes.sortOrder), asc(schema.ticketTypes.code));
  } catch (error) {
    console.error("[admin/cenik] ceník se nepodařilo načíst:", error);
    return [];
  }
}

export default async function CenikPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const code = typeof sp.z === "string" ? sp.z : undefined;
  const rows = await loadTypes();
  const total = rows.filter((r) => r.active).reduce((sum, r) => sum + r.priceCzk, 0);

  return (
    <div className="space-y-14">
      <PageTitle
        title="Ceník vstupného"
        hint="Druhy vstupenek, jejich ceny a to, jestli zabírají místo v časovce."
      />

      {!hasDatabaseUrl() && (
        <Notice tone="bad">
          Databáze zatím není připojená. Ceník se nemá odkud načíst ani kam uložit.
        </Notice>
      )}

      {code === "ulozeno" && <Notice>Ceník je uložený.</Notice>}
      {code === "nacteno" && <Notice>Ceník 2025 je načtený. Teď si ceny upravte podle letoška.</Notice>}
      {code === "neprazdny" && (
        <Notice tone="bad">Ceník už nějaké druhy vstupenek obsahuje, načítat znovu nejde.</Notice>
      )}
      {code === "chyba" && <Notice tone="bad">Nepovedlo se to. Zkuste to prosím znovu.</Notice>}
      {code === "bez_databaze" && <Notice tone="bad">Databáze není připojená.</Notice>}

      <section>
        <SectionTitle>Co je dobré vědět</SectionTitle>
        <ul className="mt-4 space-y-2 text-[0.9rem] leading-relaxed text-ink-soft">
          <li>
            <strong className="font-medium">Cena 0</strong> znamená zdarma. Vstupenka se přesto
            vystaví — u brány je vidět, kdo přišel.
          </li>
          <li>
            <strong className="font-medium">Do kapacity</strong> znamená, že vstupenka zabere místo
            v časovce. Pes ani dítě do dvou let místo nezabírají, takže tam zaškrtnuté být nemají.
          </li>
          <li>
            <strong className="font-medium">V prodeji</strong> říká, jestli si druh vstupenky může
            zákazník koupit. Odškrtnutím ho z webu schováte, ale staré objednávky zůstanou platné.
          </li>
          <li>
            Změna ceny se <strong className="font-medium">nepromítne do už vystavených
            objednávek</strong>. Cena se do objednávky opíše ve chvíli nákupu, takže dřívější doklady
            zůstávají takové, jaké byly.
          </li>
          <li>
            <strong className="font-medium">Pořadí</strong> určuje, v jakém sledu se druhy nabízejí
            v košíku. Nižší číslo je výš.
          </li>
        </ul>
      </section>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionTitle>Druhy vstupenek</SectionTitle>
          {rows.length > 0 && (
            <p className="text-[0.86rem] text-ink-faint">
              v prodeji {rows.filter((r) => r.active).length} z {rows.length}, součet cen{" "}
              <span className="tabular">{czk(total)}</span>
            </p>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="mt-6 space-y-6">
            <Empty>Ceník je zatím prázdný.</Empty>
            <form action={nacistCenik2025}>
              <Button type="submit" disabled={!hasDatabaseUrl()}>
                Načíst ceník 2025
              </Button>
              <Hint>
                Vloží čtyři druhy vstupenek podle loňské sezóny — dospělý, snížené, dítě do dvou let
                a pes. Ceny pak přepíšete podle letoška.
              </Hint>
            </form>
          </div>
        ) : (
          <PriceTable rows={rows} />
        )}
      </section>
    </div>
  );
}
