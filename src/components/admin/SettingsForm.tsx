"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  ulozitNastaveni,
  type SettingsState,
} from "@/app/(admin)/admin/(panel)/nastaveni/actions";
import { Button, Field, Hint, INPUT_CLASS, Notice } from "./ui";

/**
 * Formulář nastavení prodeje.
 *
 * Typ pole (zaškrtávátko / číslo / text) i meze přicházejí ze serveru — jsou
 * odvozené z jediné pravdy, kterou je schéma v `src/lib/db/settings.ts`.
 * Tenhle soubor přidává to, co ze schématu odvodit nejde: jak se ta věc
 * jmenuje česky a co se stane, když ji majitel změní.
 */

export type SettingField =
  | { key: string; kind: "boolean"; value: boolean; fallback: boolean }
  | { key: string; kind: "number"; value: number; fallback: number; min: number | null; max: number | null }
  | { key: string; kind: "text"; value: string; fallback: string };

interface Popis {
  label: string;
  hint: string;
  /** Delší text se píše do víceřádkového pole. */
  long?: boolean;
}

/** Popisky bez databázového žargonu — majitel netuší, co je `prodej.hold_minut`. */
export const POPIS: Record<string, Popis> = {
  "prodej.zapnut": {
    label: "Prodej vstupenek",
    hint: "Hlavní vypínač e-shopu. Web běží dál, jen se nedá nic koupit.",
  },
  "prodej.hold_minut": {
    label: "Jak dlouho držíme místo v košíku",
    hint: "Než zákazník zaplatí, blokujeme mu místo v časovce. Po uplynutí se místo vrátí do prodeje. Doporučeno 15 minut.",
  },
  "prodej.max_kusu_objednavka": {
    label: "Nejvíc vstupenek na jednu objednávku",
    hint: "Brzda proti překupníkům i proti překlepu v počtu. Rodina s babičkou se bez potíží vejde do dvaceti.",
  },
  "sezona.nazev": {
    label: "Název sezóny",
    hint: "Jak se právě běžící sezóna jmenuje. Objeví se v e-mailu se vstupenkami.",
  },
  "kapacita.vychozi": {
    label: "Výchozí kapacita nové časovky",
    hint: "Kolik míst dostane časovka, kterou přidáte ručně v detailu dne. Vypsání celé sezóny má vlastní pole.",
  },
  "email.potvrzeni_podpis": {
    label: "Podpis pod potvrzovacím e-mailem",
    hint: "Poslední řádky e-mailu, který zákazník dostane po zaplacení. Klidně na víc řádků.",
    long: true,
  },
  "brana.tolerance_minut": {
    label: "O kolik minut smí návštěvník dorazit mimo svou časovku",
    hint: "Kdo přijde dřív nebo později o víc než tohle, toho brána nepustí bez domluvy s obsluhou. Nula znamená přesně na čas.",
  },
  "web.oznameni": {
    label: "Hláška v hlavičce webu",
    hint: "Krátká věta nahoře na každé stránce — uzavírka, změna otevírací doby, počasí. Prázdné pole znamená, že se nezobrazí nic.",
    long: true,
  },
  "provoz.alert_email": {
    label: "Adresa pro provozní upozornění",
    hint: "Sem přijde zpráva, když je potřeba ručně vrátit peníze. Prázdné pole upozornění vypne.",
  },
};

function popis(key: string): Popis {
  return POPIS[key] ?? { label: key, hint: "" };
}

/** Hodnota tak, jak se drží ve formuláři — všechno jako text, i zaškrtávátko. */
function asText(field: SettingField, which: "value" | "fallback"): string {
  const v = field[which];
  if (typeof v === "boolean") return v ? "1" : "";
  return String(v);
}

/** Výchozí hodnota, jak se má přečíst nahlas. */
function readable(field: SettingField): string {
  if (field.kind === "boolean") return field.fallback ? "zapnuto" : "vypnuto";
  if (field.kind === "number") return String(field.fallback);
  return field.fallback === "" ? "prázdné" : field.fallback.replace(/\n/g, " ");
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Ukládám…" : "Uložit nastavení"}
    </Button>
  );
}

export function SettingsForm({ fields }: { fields: SettingField[] }) {
  const [state, action] = useActionState<SettingsState, FormData>(ulozitNastaveni, {});
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, asText(f, "value")])),
  );

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  return (
    <form action={action} className="mt-8 space-y-12">
      {fields.map((field) => {
        const { label, hint, long } = popis(field.key);
        const value = values[field.key] ?? "";
        const fallback = asText(field, "fallback");
        const isDefault = value === fallback;

        return (
          <div key={field.key}>
            <Field label={label} htmlFor={field.key} hint={hint}>
              {field.kind === "boolean" ? (
                <label className="mt-3 flex items-center gap-3">
                  <input
                    id={field.key}
                    name={field.key}
                    type="checkbox"
                    value="1"
                    checked={value === "1"}
                    onChange={(e) => set(field.key, e.target.checked ? "1" : "")}
                    className="size-4 accent-pumpkin"
                  />
                  <span className="text-[1rem]">{value === "1" ? "zapnuto" : "vypnuto"}</span>
                </label>
              ) : field.kind === "number" ? (
                <input
                  id={field.key}
                  name={field.key}
                  type="number"
                  step={1}
                  min={field.min ?? undefined}
                  max={field.max ?? undefined}
                  required
                  value={value}
                  onChange={(e) => set(field.key, e.target.value)}
                  className={`${INPUT_CLASS} tabular max-w-[10rem]`}
                />
              ) : long ? (
                <textarea
                  id={field.key}
                  name={field.key}
                  rows={4}
                  value={value}
                  onChange={(e) => set(field.key, e.target.value)}
                  className={INPUT_CLASS}
                />
              ) : (
                <input
                  id={field.key}
                  name={field.key}
                  type="text"
                  value={value}
                  onChange={(e) => set(field.key, e.target.value)}
                  className={INPUT_CLASS}
                />
              )}
            </Field>

            <p className="mt-2 text-[0.82rem] text-ink-faint">
              Výchozí: <span className="tabular">{readable(field)}</span>
              {!isDefault && (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => set(field.key, fallback)}
                    className="underline underline-offset-4"
                  >
                    vrátit na výchozí
                  </button>
                </>
              )}
            </p>

            {state.errorKey === field.key && (
              <div className="mt-3">
                <Notice tone="bad">{state.error}</Notice>
              </div>
            )}
          </div>
        );
      })}

      {state.error && !state.errorKey && <Notice tone="bad">{state.error}</Notice>}

      <div>
        <Submit />
        <Hint>Změny se na webu projeví hned po uložení.</Hint>
      </div>
    </form>
  );
}
