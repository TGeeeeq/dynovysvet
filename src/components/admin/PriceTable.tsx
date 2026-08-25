"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { ulozitCenik, type PriceState } from "@/app/(admin)/admin/(panel)/cenik/actions";
import { Button, Notice, Table, Td } from "./ui";

/**
 * Ceník k přepsání. Celá tabulka je jeden formulář a ukládá se najednou —
 * ceny se před sezónou mění všechny naráz, ne po jedné.
 *
 * Nový druh vstupenky se přidá jako prázdný řádek na konec. Dokud v něm nic
 * není, uložení ho tiše přeskočí; majitel tedy nemusí nic „rušit", stačí
 * nechat řádek prázdný.
 */

export interface PriceRow {
  id: string;
  code: string;
  nameCs: string;
  nameEn: string;
  nameDe: string;
  priceCzk: number;
  sortOrder: number;
  countsToCapacity: boolean;
  active: boolean;
}

const CELL =
  "border-0 border-b-2 border-ink/20 bg-transparent px-0 py-1.5 text-[0.95rem] text-ink placeholder:text-ink-faint/60 focus:border-pumpkin focus:outline-none";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Ukládám…" : "Uložit ceník"}
    </Button>
  );
}

function NameInputs({ row, rowKey }: { row: PriceRow | null; rowKey: string }) {
  const languages: { suffix: string; label: string; value: string; required: boolean }[] = [
    { suffix: "cs", label: "česky", value: row?.nameCs ?? "", required: true },
    { suffix: "en", label: "anglicky", value: row?.nameEn ?? "", required: true },
    { suffix: "de", label: "německy", value: row?.nameDe ?? "", required: false },
  ];
  return (
    <div className="space-y-2">
      {languages.map((l) => (
        <div key={l.suffix} className="flex items-baseline gap-2">
          <span className="w-16 shrink-0 text-[0.68rem] uppercase tracking-[0.16em] text-ink-faint">
            {l.label}
          </span>
          <input
            name={`nazev_${l.suffix}__${rowKey}`}
            type="text"
            maxLength={120}
            required={l.required}
            defaultValue={l.value}
            aria-label={`Název ${l.label}`}
            className={`${CELL} w-56`}
          />
        </div>
      ))}
    </div>
  );
}

function Row({ row, rowKey }: { row: PriceRow | null; rowKey: string }) {
  return (
    <tr>
      <Td>
        <input type="hidden" name="radek" value={rowKey} />
        {row ? (
          <>
            {/* Kód je vnitřní klíč — visí na něm už vystavené objednávky,
                takže se u existujícího druhu měnit nedá. */}
            <input type="hidden" name={`kod__${rowKey}`} value={row.code} />
            <span className="tabular text-[0.9rem] text-ink-soft">{row.code}</span>
          </>
        ) : (
          <input
            name={`kod__${rowKey}`}
            type="text"
            maxLength={32}
            placeholder="napr_rodinne"
            aria-label="Kód nového druhu vstupenky"
            className={`${CELL} w-40`}
          />
        )}
      </Td>
      <Td>
        <NameInputs row={row} rowKey={rowKey} />
      </Td>
      <Td>
        <input
          name={`cena__${rowKey}`}
          type="number"
          min={0}
          max={100000}
          step={1}
          required={row !== null}
          defaultValue={row ? row.priceCzk : ""}
          aria-label="Cena v korunách"
          className={`${CELL} tabular w-24`}
        />
      </Td>
      <Td>
        <input
          name={`poradi__${rowKey}`}
          type="number"
          min={0}
          max={9999}
          step={10}
          required={row !== null}
          defaultValue={row ? row.sortOrder : 100}
          aria-label="Pořadí v nabídce"
          className={`${CELL} tabular w-20`}
        />
      </Td>
      <Td>
        <input
          type="checkbox"
          name={`kapacita__${rowKey}`}
          value="1"
          defaultChecked={row ? row.countsToCapacity : true}
          aria-label="Počítá se do kapacity"
          className="size-4 accent-pumpkin"
        />
      </Td>
      <Td>
        <input
          type="checkbox"
          name={`prodej__${rowKey}`}
          value="1"
          defaultChecked={row ? row.active : true}
          aria-label="V prodeji"
          className="size-4 accent-pumpkin"
        />
      </Td>
    </tr>
  );
}

export function PriceTable({ rows }: { rows: PriceRow[] }) {
  const [state, action] = useActionState<PriceState, FormData>(ulozitCenik, {});
  const [added, setAdded] = useState<number>(0);

  return (
    <form action={action} className="mt-6 space-y-8">
      <Table head={["Kód", "Název", "Cena Kč", "Pořadí", "Do kapacity", "V prodeji"]}>
        {rows.map((row) => (
          <Row key={row.id} row={row} rowKey={row.id} />
        ))}
        {Array.from({ length: added }, (_, i) => (
          <Row key={`novy_${i}`} row={null} rowKey={`novy_${i}`} />
        ))}
      </Table>

      <button
        type="button"
        onClick={() => setAdded((n) => n + 1)}
        className="text-[0.9rem] underline-offset-4 hover:underline"
      >
        Přidat druh vstupenky
      </button>

      {state.error && <Notice tone="bad">{state.error}</Notice>}

      <div>
        <Submit />
      </div>
    </form>
  );
}
