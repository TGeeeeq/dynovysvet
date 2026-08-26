import { z } from "zod";

import { hasDatabaseUrl } from "@/lib/db/client";
import {
  SETTINGS_DEFAULTS,
  SETTINGS_SCHEMA,
  getAllSettings,
  type SettingKey,
} from "@/lib/db/settings";
import { Badge, Button, Hint, Notice, PageTitle, SectionTitle } from "@/components/admin/ui";
import { SettingsForm, type SettingField } from "@/components/admin/SettingsForm";
import { prepnoutProdej } from "./actions";

export const metadata = { title: "Nastavení prodeje" };

/**
 * Pořadí polí ve formuláři. Ne abecední ani takové, jak jsou v databázi —
 * odshora podle toho, jak často se to majitel chystá měnit.
 *
 * `prodej.zapnut` tu schválně není: hlavní vypínač stojí nahoře samostatně.
 */
const ORDER: SettingKey[] = [
  "prodej.hold_minut",
  "prodej.max_kusu_objednavka",
  "kapacita.vychozi",
  "brana.tolerance_minut",
  "sezona.nazev",
  "web.oznameni",
  "email.potvrzeni_podpis",
  "provoz.alert_email",
];

/**
 * Z jednoho klíče udělá popis pole. Typ i meze čteme ze zod schématu, aby se
 * přidání dalšího přepínače obešlo bez zásahu do formuláře.
 */
function toField(key: SettingKey, value: unknown, fallback: unknown): SettingField {
  const schema = SETTINGS_SCHEMA[key];

  if (schema instanceof z.ZodBoolean) {
    return { key, kind: "boolean", value: Boolean(value), fallback: Boolean(fallback) };
  }
  if (schema instanceof z.ZodNumber) {
    return {
      key,
      kind: "number",
      value: Number(value),
      fallback: Number(fallback),
      min: Number.isFinite(schema.minValue) ? schema.minValue : null,
      max: Number.isFinite(schema.maxValue) ? schema.maxValue : null,
    };
  }
  return { key, kind: "text", value: String(value ?? ""), fallback: String(fallback ?? "") };
}

export default async function NastaveniPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const code = typeof sp.z === "string" ? sp.z : undefined;
  const changed = Number(typeof sp.n === "string" ? sp.n : 0) || 0;

  const values = await getAllSettings();
  const fields = ORDER.map((key) => toField(key, values[key], SETTINGS_DEFAULTS[key]));
  const selling = values["prodej.zapnut"];

  return (
    <div className="space-y-14">
      <PageTitle
        title="Nastavení prodeje"
        hint="Pravidla, podle kterých e-shop jede. Platí pro celý web, ne pro jeden den."
      />

      {!hasDatabaseUrl() && (
        <Notice tone="bad">
          Databáze zatím není připojená. Níž jsou výchozí hodnoty z kódu a uložit je nejde.
        </Notice>
      )}

      {code === "ulozeno" && (
        <Notice>
          {changed === 0 ? "Nic se nezměnilo, ukládat nebylo co." : "Nastavení je uložené."}
        </Notice>
      )}
      {code === "prodej_zapnut" && <Notice>Prodej je zapnutý. Vstupenky se na webu prodávají.</Notice>}
      {code === "prodej_vypnut" && (
        <Notice>Prodej je vypnutý. Na webu se teď nedá koupit žádná vstupenka.</Notice>
      )}
      {code === "chyba" && <Notice tone="bad">Nepovedlo se to. Zkuste to prosím znovu.</Notice>}
      {code === "bez_databaze" && <Notice tone="bad">Databáze není připojená.</Notice>}

      {/* ------------------------------------------------ hlavní vypínač */}
      <section className="border-y-2 border-ink/15 py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionTitle>Prodej vstupenek</SectionTitle>
          {selling ? <Badge tone="ok">zapnuto</Badge> : <Badge tone="bad">vypnuto</Badge>}
        </div>

        <p className="font-display mt-4 text-[1.7rem] font-semibold leading-tight">
          {selling ? "Prodej je zapnutý" : "Prodej je vypnutý"}
        </p>
        <p className="mt-3 max-w-2xl text-[0.98rem] leading-relaxed text-ink-soft">
          {selling
            ? "Na webu se dají koupit vstupenky na všechny zveřejněné dny. Když prodej vypnete, tlačítka na nákup se schovají a místo nich se objeví vysvětlení — zbytek webu (fotky, otevírací doba, kontakt) běží dál."
            : "Na webu se teď nedá koupit žádná vstupenka. Stránky jsou vidět normálně, jen nákup je schovaný. Zapnutím se prodej okamžitě obnoví."}
        </p>

        <form action={prepnoutProdej} className="mt-6">
          <input type="hidden" name="zapnout" value={selling ? "0" : "1"} />
          <Button type="submit" variant={selling ? "danger" : "primary"} disabled={!hasDatabaseUrl()}>
            {selling ? "Vypnout prodej" : "Zapnout prodej"}
          </Button>
        </form>
        <Hint>
          Už zaplacené vstupenky platí dál — vypnutí se týká jen nových nákupů. Rozestavěné košíky
          dojedou do konce, nebo se po vypršení samy uvolní.
        </Hint>
      </section>

      {/* ---------------------------------------------------- ostatní pole */}
      <section>
        <SectionTitle>Ostatní nastavení</SectionTitle>
        <Hint>
          U každé položky je napsáno, k čemu slouží, a jaká je výchozí hodnota. Když si nejste
          jistí, nechte výchozí — jsou nastavené podle loňského provozu.
        </Hint>
        <SettingsForm fields={fields} />
      </section>
    </div>
  );
}
