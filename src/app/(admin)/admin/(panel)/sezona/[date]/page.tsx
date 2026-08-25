import Link from "next/link";
import { notFound } from "next/navigation";

import { longDate, time } from "@/lib/admin/format";
import { DATE_RE, getDay } from "@/lib/admin/season";
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
import { pridatCasovku, smazatCasovku, ulozitDen } from "../actions";

type Props = {
  params: Promise<{ date: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { date } = await params;
  return { title: DATE_RE.test(date) ? longDate(`${date}T12:00:00Z`) : "Den" };
}

/**
 * Jeden provozní den. Tady se ladí to, co vypsání sezóny odhadlo hrubě:
 * kolik lidí se v které časovce vejde, jestli chybí ranní úsek a co si
 * o tom dni máme pamatovat.
 */
export default async function DayPage({ params, searchParams }: Props) {
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  const sp = await searchParams;
  const get = (key: string): string | undefined => {
    const value = sp[key];
    if (typeof value === "string") return value;
    return Array.isArray(value) ? value[0] : undefined;
  };

  const title = longDate(`${date}T12:00:00Z`);

  if (!hasDatabaseUrl()) {
    return (
      <div className="space-y-10">
        <PageTitle title={title} hint="Časovky a kapacita jednoho dne." />
        <Notice tone="bad">Databáze zatím není připojená, časovky se nemají odkud načíst.</Notice>
        <Back />
      </div>
    );
  }

  const detail = await getDay(date);
  if (!detail) notFound();

  const { day, slots } = detail;
  const deleting = get("smazat");
  const doomed = deleting ? slots.find((s) => s.id === deleting) : undefined;

  return (
    <div className="space-y-14">
      <PageTitle
        title={title}
        hint={`Otevřeno ${time(day.opensAt)}–${time(day.closesAt)}. Časovky a kapacita jednoho dne.`}
        action={day.published ? <Badge tone="ok">v prodeji</Badge> : <Badge>nezveřejněno</Badge>}
      />

      <Message get={get} />

      <section>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
          <Stat label="Časovek" value={slots.length} />
          <Stat
            label="Obsazeno"
            value={`${day.reserved} / ${day.capacity}`}
            note="prodáno z kapacity"
          />
          <Stat label="Zbývá míst" value={Math.max(0, day.capacity - day.reserved)} />
        </div>
        {!day.published && (
          <Hint>
            Den zatím není zveřejněný, na webu se neprodává. Zveřejníte ho v přehledu sezóny.
          </Hint>
        )}
      </section>

      {doomed && (
        <div className="border-l-2 border-ember py-3 pl-4">
          <p className="text-[0.98rem]">
            Opravdu smazat časovku {time(doomed.startsAt)}–{time(doomed.endsAt)}?
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <form action={smazatCasovku}>
              <input type="hidden" name="den" value={date} />
              <input type="hidden" name="casovka" value={doomed.id} />
              <Button type="submit" variant="danger">
                Smazat časovku
              </Button>
            </form>
            <Link
              href={`/admin/sezona/${date}`}
              className="text-[0.9rem] underline-offset-4 hover:underline"
            >
              Nechat být
            </Link>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ kapacity a poznámka */}
      <section>
        <SectionTitle>Časovky</SectionTitle>
        <Hint>
          Kapacitu nelze snížit pod počet už prodaných míst. Kapacita 0 znamená, že se časovka dál
          neprodává, ale prodané vstupenky platí.
        </Hint>

        {slots.length === 0 ? (
          <div className="mt-6">
            <Empty>Tenhle den zatím nemá žádnou časovku. Přidejte ji níž.</Empty>
          </div>
        ) : (
          <form action={ulozitDen} className="mt-6 space-y-10">
            <input type="hidden" name="den" value={date} />

            <Table head={["Čas", "Kapacita", "Obsazeno", "Zbývá", ""]}>
              {slots.map((s) => (
                <tr key={s.id}>
                  <Td className="tabular whitespace-nowrap">
                    {time(s.startsAt)}–{time(s.endsAt)}
                  </Td>
                  <Td>
                    <input type="hidden" name="casovka" value={s.id} />
                    <label className="sr-only" htmlFor={`kapacita_${s.id}`}>
                      Kapacita časovky {time(s.startsAt)}
                    </label>
                    <input
                      id={`kapacita_${s.id}`}
                      name={`kapacita_${s.id}`}
                      type="number"
                      min={s.reserved}
                      max={5000}
                      step={1}
                      required
                      defaultValue={s.capacity}
                      className="tabular w-24 border-0 border-b-2 border-ink/20 bg-transparent px-0 py-1.5 text-[1rem] text-ink focus:border-pumpkin focus:outline-none"
                    />
                  </Td>
                  <Td className="tabular">{s.reserved}</Td>
                  <Td className="tabular">{Math.max(0, s.capacity - s.reserved)}</Td>
                  <Td>
                    {s.reserved === 0 ? (
                      <Link
                        href={`/admin/sezona/${date}?smazat=${s.id}`}
                        className="whitespace-nowrap text-[0.86rem] text-ember underline-offset-4 hover:underline"
                      >
                        Smazat
                      </Link>
                    ) : (
                      <span className="whitespace-nowrap text-[0.86rem] text-ink-faint">
                        prodáno
                      </span>
                    )}
                  </Td>
                </tr>
              ))}
            </Table>

            <Field
              label="Poznámka ke dni"
              htmlFor="poznamka"
              hint="Jen pro vás, na webu se nezobrazuje. Třeba podzimní prázdniny nebo dopolední návštěva školy."
            >
              <textarea
                id="poznamka"
                name="poznamka"
                rows={2}
                maxLength={300}
                defaultValue={day.note ?? ""}
                className={INPUT_CLASS}
              />
            </Field>

            <Button type="submit">Uložit kapacity a poznámku</Button>
          </form>
        )}
      </section>

      {/* ------------------------------------------------------ přidat časovku */}
      <section>
        <SectionTitle>Přidat časovku</SectionTitle>
        <form action={pridatCasovku} className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-6">
          <input type="hidden" name="den" value={date} />
          <div>
            <label htmlFor="od" className={LABEL_CLASS}>
              Od
            </label>
            <input
              id="od"
              name="od"
              type="time"
              step={900}
              required
              className={`${INPUT_CLASS} tabular w-32`}
            />
          </div>
          <div>
            <label htmlFor="do" className={LABEL_CLASS}>
              Do
            </label>
            <input
              id="do"
              name="do"
              type="time"
              step={900}
              required
              className={`${INPUT_CLASS} tabular w-32`}
            />
          </div>
          <div>
            <label htmlFor="kapacita" className={LABEL_CLASS}>
              Kapacita
            </label>
            <input
              id="kapacita"
              name="kapacita"
              type="number"
              min={0}
              max={5000}
              step={1}
              required
              defaultValue={day.slots > 0 ? Math.round(day.capacity / day.slots) : 60}
              className={`${INPUT_CLASS} tabular w-28`}
            />
          </div>
          <Button type="submit" variant="quiet">
            Přidat
          </Button>
        </form>
      </section>

      <Back />
    </div>
  );
}

function Back() {
  return (
    <p>
      <Link href="/admin/sezona" className="text-[0.9rem] underline-offset-4 hover:underline">
        Zpět na sezónu
      </Link>
    </p>
  );
}

/** Hláška po akci — text patří do stránky, do adresy jde jen kód a čísla. */
function Message({ get }: { get: (key: string) => string | undefined }) {
  const code = get("z");
  if (!code) return null;

  if (code === "ulozeno") {
    const n = Number(get("n") ?? 0) || 0;
    return (
      <Notice>
        {n === 0 ? "Uloženo. Kapacity zůstaly beze změny." : `Uloženo, změněno kapacit: ${n}.`}
      </Notice>
    );
  }
  if (code === "kapacita") {
    return (
      <Notice tone="bad">
        V časovce {get("cas")} už je prodáno {get("prodano")} míst, kapacitu nelze snížit na{" "}
        {get("na")}.
      </Notice>
    );
  }
  if (code === "pridano") return <Notice>Časovka od {get("cas")} přibyla.</Notice>;
  if (code === "smazano") return <Notice>Časovka je smazaná.</Notice>;
  if (code === "nepridano") {
    return (
      <Notice tone="bad">
        Časovku se nepodařilo přidat — buď v tenhle čas už jedna je, nebo konec předchází začátku.
      </Notice>
    );
  }
  if (code === "nesmazano") {
    return (
      <Notice tone="bad">
        Časovku nelze smazat — jsou na ni prodané vstupenky. Snižte místo toho kapacitu.
      </Notice>
    );
  }
  if (code === "neplatne") {
    return <Notice tone="bad">Zadání nedávalo smysl, nic se neuložilo.</Notice>;
  }
  return <Notice tone="bad">Nepovedlo se to uložit. Zkuste to prosím znovu.</Notice>;
}
