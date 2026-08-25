import Link from "next/link";

import { longDate, time } from "@/lib/admin/format";
import {
  DATE_RE,
  SLOT_LENGTHS,
  WEEK,
  defaultSeasonForm,
  listDays,
  pocet,
  previewSeason,
  readSeasonForm,
  seasonFormQuery,
} from "@/lib/admin/season";
import { hasDatabaseUrl } from "@/lib/db/client";
import {
  Badge,
  Button,
  Empty,
  Field,
  Hint,
  INPUT_CLASS,
  LABEL_CLASS,
  Notice,
  PageTitle,
  SectionTitle,
  Stat,
  Table,
  Td,
} from "@/components/admin/ui";
import { prepnoutZverejneni, vypsatTerminy, zavritDen, zverejnitVse } from "./actions";

export const metadata = { title: "Sezóna a otevírací doba" };

/**
 * Nejdůležitější stránka administrace: kdy je otevřeno a kolik lidí pustíme dovnitř.
 *
 * Vypsání sezóny je záměrně na dva kroky — nejdřív náhled, teprve pak zápis.
 * Mezikrok drží adresa (`?nahled=1`), ne stav v prohlížeči: náhled se dá poslat
 * kolegovi, obnovit klávesou F5 i vrátit tlačítkem zpět a pořád znamená totéž.
 */
export default async function SeasonPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (key: string): string | undefined => {
    const value = sp[key];
    if (typeof value === "string") return value;
    return Array.isArray(value) ? value[0] : undefined;
  };

  const preview = get("nahled") === "1";
  // Bez náhledu formulář jen předvyplníme; vytýkat chyby dřív, než uživatel
  // něco odeslal, by bylo nezdvořilé.
  const read = preview ? readSeasonForm(get) : null;
  const values = read?.values ?? defaultSeasonForm();
  const plan = read?.plan ?? null;
  const outcome = plan ? await previewSeason(plan) : null;

  const days = await listDays();
  const hidden = days.filter((d) => !d.published).length;
  const closing = get("zavrit");
  const closingDay = closing && DATE_RE.test(closing) ? days.find((d) => d.date === closing) : undefined;

  return (
    <div className="space-y-14">
      <PageTitle
        title="Sezóna a otevírací doba"
        hint="Vypište termíny na celou sezónu naráz, pak už jen doladíte jednotlivé dny."
      />

      {!hasDatabaseUrl() && (
        <Notice tone="bad">
          Databáze zatím není připojená. Termíny se nemají odkud načíst ani kam uložit.
        </Notice>
      )}

      <Message get={get} />

      {/* ------------------------------------------------ vypsání sezóny */}
      <section>
        <SectionTitle>Vypsání sezóny</SectionTitle>
        <Hint>
          Podle otevíracích pravidel níž se vyrobí provozní dny a v nich časovky. Dny, které
          v kalendáři už jsou, zůstanou přesně takové, jaké je máte — vypsání jen doplní, co
          chybí. Chcete-li u některého dne jiné hodiny, zavřete ho a vypište znovu.
        </Hint>

        <form method="get" action="/admin/sezona" className="mt-8 space-y-10">
          <input type="hidden" name="nahled" value="1" />

          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Sezóna od" htmlFor="od">
              <input id="od" name="od" type="date" required defaultValue={values.from} className={INPUT_CLASS} />
            </Field>
            <Field label="Sezóna do" htmlFor="do">
              <input id="do" name="do" type="date" required defaultValue={values.to} className={INPUT_CLASS} />
            </Field>
            <Field label="Délka časovky" htmlFor="delka" hint="Po jak dlouhých úsecích pouštíme návštěvníky dovnitř.">
              <select id="delka" name="delka" defaultValue={String(values.slotMinutes)} className={INPUT_CLASS}>
                {SLOT_LENGTHS.map((m) => (
                  <option key={m} value={m}>
                    {m} minut
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Kapacita časovky"
              htmlFor="kapacita"
              hint="Kolik lidí pustíme dovnitř v jednom úseku. Poslední časovka dne dostane 60 % z toho — návštěva trvá zhruba dvě hodiny."
            >
              <input
                id="kapacita"
                name="kapacita"
                type="number"
                min={1}
                max={1000}
                step={1}
                required
                defaultValue={values.capacity}
                className={`${INPUT_CLASS} tabular`}
              />
            </Field>
          </div>

          <div>
            <p className={LABEL_CLASS}>Otevírací doba podle dnů v týdnu</p>
            <div className="mt-4 border-t-2 border-ink/15">
              {values.week.map((w) => {
                const label = WEEK.find((x) => x.weekday === w.weekday)?.label ?? "";
                return (
                  <div
                    key={w.weekday}
                    className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-ink/12 py-3"
                  >
                    <label className="flex min-w-[9rem] items-center gap-3">
                      <input
                        type="checkbox"
                        name={`otevreno_${w.weekday}`}
                        value="1"
                        defaultChecked={w.open}
                        className="size-4 accent-pumpkin"
                      />
                      <span className="text-[1rem]">{label}</span>
                    </label>
                    <label className="flex items-center gap-3 text-[0.86rem] text-ink-faint">
                      od
                      <input
                        type="time"
                        name={`od_${w.weekday}`}
                        step={900}
                        defaultValue={w.from}
                        className="tabular border-0 border-b-2 border-ink/20 bg-transparent px-0 py-1 text-[1rem] text-ink focus:border-pumpkin focus:outline-none"
                      />
                    </label>
                    <label className="flex items-center gap-3 text-[0.86rem] text-ink-faint">
                      do
                      <input
                        type="time"
                        name={`do_${w.weekday}`}
                        step={900}
                        defaultValue={w.to}
                        className="tabular border-0 border-b-2 border-ink/20 bg-transparent px-0 py-1 text-[1rem] text-ink focus:border-pumpkin focus:outline-none"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
            <Hint>
              Nezaškrtnutý den zůstane zavřený. Jednotlivé výjimky (prázdniny, svátky) doladíte
              potom v detailu konkrétního dne.
            </Hint>
          </div>

          <Button type="submit">Ukázat náhled</Button>
        </form>

        {preview && read && read.problems.length > 0 && (
          <div className="mt-8 space-y-2">
            {read.problems.map((p) => (
              <Notice key={p} tone="bad">
                {p}
              </Notice>
            ))}
          </div>
        )}

        {outcome && (
          <div className="mt-10 border-t-2 border-ink/15 pt-6">
            <SectionTitle>Náhled — zatím se nic neuložilo</SectionTitle>
            <div className="mt-5 grid gap-x-10 gap-y-8 sm:grid-cols-3">
              <Stat label="Nových dní" value={outcome.newDays} />
              <Stat label="Nových časovek" value={outcome.newSlots} />
              <Stat label="Míst celkem" value={outcome.seats} note="součet kapacit nových časovek" />
            </div>

            {outcome.existing.length > 0 && (
              <p className="mt-6 text-[0.95rem] text-ink-soft">
                {pocet(outcome.existing.length, "den", "dny", "dní")} z tohoto období už v kalendáři
                {outcome.existing.length === 1 ? " je" : " jsou"} — necháme
                {outcome.existing.length === 1 ? " ho" : " je"} beze změny.
              </p>
            )}
            {outcome.sold.length > 0 && (
              <p className="mt-2 text-[0.95rem] text-ember">
                {pocet(outcome.sold.length, "den", "dny", "dní")} přeskočíme: na tyhle dny už jsou
                prodané vstupenky ({outcome.sold.slice(0, 8).join(", ")}
                {outcome.sold.length > 8 ? " a další" : ""}).
              </p>
            )}

            <form action={vypsatTerminy} className="mt-8 flex flex-wrap items-center gap-5">
              {Object.entries(seasonFormQuery(values)).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
              <Button type="submit" disabled={outcome.newDays === 0}>
                Vypsat termíny
              </Button>
              <Link href="/admin/sezona" className="text-[0.9rem] underline-offset-4 hover:underline">
                Zpět k zadání
              </Link>
            </form>
            {outcome.newDays === 0 && (
              <Hint>Podle tohoto zadání by nepřibyl žádný nový den, není co ukládat.</Hint>
            )}
          </div>
        )}
      </section>

      {/* --------------------------------------------------- seznam dnů */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionTitle>Provozní dny</SectionTitle>
          {hidden > 0 && (
            <form action={zverejnitVse}>
              <button type="submit" className="text-[0.88rem] underline-offset-4 hover:underline">
                Zveřejnit všech {hidden} nezveřejněných
              </button>
            </form>
          )}
        </div>
        <Hint>
          Nezveřejněný den se na webu neprodává — návštěvník ho vůbec nevidí. Vypsané dny proto
          zkontrolujte a teprve pak je zveřejněte.
        </Hint>

        {closingDay && (
          <div className="mt-6 border-l-2 border-ember py-3 pl-4">
            <p className="text-[0.98rem]">
              Opravdu zavřít {longDate(`${closingDay.date}T12:00:00Z`)}? Den i všech{" "}
              {closingDay.slots} časovek z kalendáře zmizí.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-5">
              <form action={zavritDen}>
                <input type="hidden" name="den" value={closingDay.date} />
                <Button type="submit" variant="danger">
                  Zavřít den
                </Button>
              </form>
              <Link href="/admin/sezona" className="text-[0.9rem] underline-offset-4 hover:underline">
                Nechat otevřený
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6">
          {days.length === 0 ? (
            <Empty>Zatím není vypsaný žádný provozní den.</Empty>
          ) : (
            <Table head={["Den", "Otevřeno", "Časovek", "Obsazeno", "Stav", ""]}>
              {days.map((d) => (
                <tr key={d.id}>
                  <Td>
                    <Link
                      href={`/admin/sezona/${d.date}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {longDate(`${d.date}T12:00:00Z`)}
                    </Link>
                    {d.note && (
                      <span className="block text-[0.84rem] text-ink-faint">{d.note}</span>
                    )}
                  </Td>
                  <Td className="tabular whitespace-nowrap">
                    {time(d.opensAt)}–{time(d.closesAt)}
                  </Td>
                  <Td className="tabular">{d.slots}</Td>
                  <Td className="tabular">
                    {d.reserved} / {d.capacity}
                  </Td>
                  <Td>
                    {d.published ? <Badge tone="ok">v prodeji</Badge> : <Badge>nezveřejněno</Badge>}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 whitespace-nowrap text-[0.86rem]">
                      <form action={prepnoutZverejneni}>
                        <input type="hidden" name="den" value={d.date} />
                        <input type="hidden" name="zverejnit" value={d.published ? "0" : "1"} />
                        <button type="submit" className="underline-offset-4 hover:underline">
                          {d.published ? "Skrýt" : "Zveřejnit"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/sezona/${d.date}`}
                        className="underline-offset-4 hover:underline"
                      >
                        Časovky
                      </Link>
                      {d.reserved === 0 ? (
                        <Link
                          href={`/admin/sezona?zavrit=${d.date}`}
                          className="text-ember underline-offset-4 hover:underline"
                        >
                          Zavřít
                        </Link>
                      ) : (
                        <span className="text-ink-faint">prodáno</span>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------- hlášky */

/**
 * Hláška po akci. V adrese je jen kód a čísla — text patří sem, aby se
 * do URL (a tím do historie a logů) nedostalo nic, co tam nemá být.
 */
function Message({ get }: { get: (key: string) => string | undefined }) {
  const code = get("z");
  if (!code) return null;

  const num = (key: string) => Number(get(key) ?? 0) || 0;
  const den = get("den");
  const dayName = den && DATE_RE.test(den) ? longDate(`${den}T12:00:00Z`) : "";

  if (code === "vypsano") {
    const parts = [
      `Vypsáno ${pocet(num("n"), "nový den", "nové dny", "nových dní")} a ${pocet(
        num("c"),
        "časovka",
        "časovky",
        "časovek",
      )}, dohromady ${num("m")} míst.`,
    ];
    if (num("b") > 0) {
      parts.push(`Dní, které v kalendáři už byly a zůstaly beze změny: ${num("b")}.`);
    }
    if (num("p") > 0) {
      parts.push(
        `Přeskočeno ${pocet(num("p"), "den", "dny", "dní")} — na tyhle dny už jsou prodané vstupenky.`,
      );
    }
    parts.push("Nové dny zatím nejsou zveřejněné, na webu se neprodávají.");
    return <Notice>{parts.join(" ")}</Notice>;
  }

  if (code === "nic") {
    const extra =
      num("p") > 0
        ? ` ${pocet(num("p"), "den", "dny", "dní")} jsme přeskočili — na tyhle dny už jsou prodané vstupenky.`
        : "";
    return <Notice>Nepřibylo nic nového, všechny dny z toho období už v kalendáři jsou.{extra}</Notice>;
  }

  if (code === "zverejneno") return <Notice>{dayName} se teď prodává na webu.</Notice>;
  if (code === "skryto") return <Notice>{dayName} se na webu už neprodává.</Notice>;
  if (code === "zavreno") return <Notice>{dayName} je zavřený a z kalendáře zmizel.</Notice>;
  if (code === "vse") {
    return (
      <Notice>
        {num("n") === 0
          ? "Všechny dny už byly zveřejněné."
          : `Zveřejněno ${pocet(num("n"), "den", "dny", "dní")}. Od téhle chvíle se prodávají na webu.`}
      </Notice>
    );
  }
  if (code === "prodano") {
    return (
      <Notice tone="bad">
        {dayName} nejde zavřít — jsou na něj prodané vstupenky. Nejdřív vyřiďte objednávky, pak
        zkuste znovu.
      </Notice>
    );
  }
  if (code === "neplatne") {
    return <Notice tone="bad">Zadání nedávalo smysl, nic se neuložilo.</Notice>;
  }
  return <Notice tone="bad">Nepovedlo se to uložit. Zkuste to prosím znovu.</Notice>;
}
