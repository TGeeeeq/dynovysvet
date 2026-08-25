import Link from "next/link";
import { desc, eq, isNotNull, isNull, sql, type SQL, and } from "drizzle-orm";
import { z } from "zod";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import { inquiryKind, type InquiryKind } from "@/lib/db/schema";
import { dateTime, INQUIRY_KIND, longDate } from "@/lib/admin/format";
import {
  Badge,
  Button,
  Empty,
  Hint,
  INPUT_CLASS,
  LABEL_CLASS,
  Notice,
  PageTitle,
  SectionTitle,
  Stat,
} from "@/components/admin/ui";
import { oznacitVyrizene, smazatPoptavku, vratitNevyrizene } from "./actions";

export const metadata = { title: "Poptávky" };

/**
 * Poptávky ze školních výletů, pronájmu statku a blešího trhu.
 *
 * Nevyřízené jsou vždy nahoře — tohle je pracovní fronta, ne archiv. Řadí se
 * v databázi (`handled_at IS NULL` napřed), ne v JavaScriptu, aby to fungovalo
 * i tehdy, až jich bude po sezóně několik set.
 *
 * Celé znění zprávy je schované v rozbalovacím bloku: v seznamu je potřeba
 * vidět, kdo se ptá a jestli je to odbavené, ne odstavec textu u každé položky.
 */

type Search = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined): string | undefined =>
  (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

/** Jazyk, ve kterém poptávka přišla — majitel má odpovědět stejným. */
const JAZYK: Record<string, string> = { cs: "česky", en: "anglicky", de: "německy" };

/**
 * `extra` je volné jsonb pole, do kterého formuláře ukládají specifika
 * (vybraná varianta, zaškrtnuté volby, jazyk). Nevěříme mu tvar — projde zodem
 * a co se nevejde, se prostě nezobrazí.
 */
const Extra = z.object({
  choice: z.string().max(400).optional(),
  options: z.array(z.string().max(200)).max(24).optional(),
  locale: z.string().max(8).optional(),
});

function readExtra(value: unknown): z.infer<typeof Extra> {
  const parsed = Extra.safeParse(value);
  return parsed.success ? parsed.data : {};
}

interface InquiryRow {
  id: string;
  kind: InquiryKind;
  name: string;
  email: string;
  phone: string | null;
  preferredDate: string | null;
  message: string | null;
  extra: unknown;
  handledAt: Date | null;
  createdAt: Date;
}

/** Kolik poptávek se vypíše najednou. Víc než tolik jich za sezónu nepřijde. */
const LIMIT = 200;

async function loadInquiries(
  druh: InquiryKind | undefined,
  stav: "nevyrizene" | "vyrizene" | undefined,
): Promise<{ connected: boolean; rows: InquiryRow[]; nevyrizenych: number }> {
  if (!hasDatabaseUrl()) return { connected: false, rows: [], nevyrizenych: 0 };

  try {
    const db = getDb();
    const parts: SQL[] = [];
    if (druh) parts.push(eq(schema.inquiries.kind, druh));
    if (stav === "nevyrizene") parts.push(isNull(schema.inquiries.handledAt));
    if (stav === "vyrizene") parts.push(isNotNull(schema.inquiries.handledAt));
    const where = parts.length ? and(...parts) : undefined;

    const [rows, cekajici] = await Promise.all([
      db
        .select({
          id: schema.inquiries.id,
          kind: schema.inquiries.kind,
          name: schema.inquiries.name,
          email: schema.inquiries.email,
          phone: schema.inquiries.phone,
          preferredDate: schema.inquiries.preferredDate,
          message: schema.inquiries.message,
          extra: schema.inquiries.extra,
          handledAt: schema.inquiries.handledAt,
          createdAt: schema.inquiries.createdAt,
        })
        .from(schema.inquiries)
        .where(where)
        // Nevyřízené napřed, uvnitř skupiny od nejnovější.
        .orderBy(sql`${schema.inquiries.handledAt} IS NULL DESC`, desc(schema.inquiries.createdAt))
        .limit(LIMIT),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(schema.inquiries)
        .where(isNull(schema.inquiries.handledAt)),
    ]);

    return { connected: true, rows, nevyrizenych: cekajici[0]?.n ?? 0 };
  } catch (error) {
    console.error("Poptávky se nepodařilo načíst:", error);
    return { connected: false, rows: [], nevyrizenych: 0 };
  }
}

function hlaska(kod: string | undefined) {
  switch (kod) {
    case "vyrizeno":
      return { tone: "ok" as const, text: "Poptávka je označená jako vyřízená." };
    case "vraceno":
      return { tone: "ok" as const, text: "Poptávka je zase mezi nevyřízenými." };
    case "smazano":
      return { tone: "ok" as const, text: "Poptávka je smazaná." };
    case "neexistuje":
      return { tone: "bad" as const, text: "Taková poptávka tu už není." };
    case "bez-databaze":
      return { tone: "bad" as const, text: "Databáze není připojená, nešlo nic uložit." };
    case "chyba":
      return { tone: "bad" as const, text: "Něco se pokazilo a změna se neuložila. Zkuste to prosím znovu." };
    default:
      return null;
  }
}

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;

  const druhParam = one(search.druh);
  const druh = (inquiryKind.enumValues as readonly string[]).includes(druhParam ?? "")
    ? (druhParam as InquiryKind)
    : undefined;
  const stavParam = one(search.stav);
  const stav = stavParam === "nevyrizene" || stavParam === "vyrizene" ? stavParam : undefined;

  const { connected, rows, nevyrizenych } = await loadInquiries(druh, stav);
  const zprava = hlaska(one(search.zprava));

  // Filtr, ve kterém majitel právě je. Akce ho pošlou zpátky, ať se po
  // odbavení jedné poptávky nevrátí na začátek seznamu.
  const dotaz = new URLSearchParams();
  if (druh) dotaz.set("druh", druh);
  if (stav) dotaz.set("stav", stav);
  const dotazText = dotaz.toString();

  return (
    <div className="space-y-12">
      <PageTitle
        title="Poptávky"
        hint="Školy a skupiny, pronájem statku, bleší trh a obecné dotazy z webu. Nevyřízené jsou nahoře."
      />

      {!connected && (
        <Notice tone="bad">
          Databáze zatím není připojená, takže se nemá odkud načíst žádná poptávka.
        </Notice>
      )}

      {zprava && <Notice tone={zprava.tone}>{zprava.text}</Notice>}

      <section>
        <SectionTitle>Výběr</SectionTitle>
        <form method="get" action="/admin/poptavky" className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-3">
          <div>
            <label htmlFor="druh" className={LABEL_CLASS}>
              Druh poptávky
            </label>
            <select
              id="druh"
              name="druh"
              defaultValue={druh ?? ""}
              className={INPUT_CLASS}
            >
              <option value="">Všechny druhy</option>
              {inquiryKind.enumValues.map((value) => (
                <option key={value} value={value}>
                  {INQUIRY_KIND[value] ?? value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stav" className={LABEL_CLASS}>
              Stav
            </label>
            <select
              id="stav"
              name="stav"
              defaultValue={stav ?? ""}
              className={INPUT_CLASS}
            >
              <option value="">Vyřízené i nevyřízené</option>
              <option value="nevyrizene">Jen nevyřízené</option>
              <option value="vyrizene">Jen vyřízené</option>
            </select>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <Button type="submit">Zobrazit</Button>
            {(druh || stav) && (
              <Link href="/admin/poptavky" className="pb-2.5 text-[0.9rem] underline-offset-4 hover:underline">
                Zrušit výběr
              </Link>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          <Stat label="Čeká na vyřízení" value={nevyrizenych} note="ze všech poptávek" />
          <Stat
            label="Ve výběru"
            value={rows.length}
            note={rows.length === LIMIT ? `zobrazeno prvních ${LIMIT}` : undefined}
          />
        </div>
      </section>

      <section>
        {rows.length === 0 ? (
          <Empty>
            {druh || stav
              ? "Tomuhle výběru neodpovídá žádná poptávka."
              : "Zatím tu žádná poptávka není."}
          </Empty>
        ) : (
          <ul>
            {rows.map((i) => {
              const extra = readExtra(i.extra);
              const jazyk = extra.locale ? (JAZYK[extra.locale] ?? extra.locale) : null;
              const telefon = i.phone?.trim();

              return (
                <li key={i.id} className="border-t-2 border-ink/15 py-6">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge>{INQUIRY_KIND[i.kind] ?? i.kind}</Badge>
                      {i.handledAt ? (
                        <Badge tone="ok">vyřízeno</Badge>
                      ) : (
                        <Badge tone="warn">čeká na odpověď</Badge>
                      )}
                    </div>
                    <p className="tabular text-[0.86rem] text-ink-faint">
                      přijato {dateTime(i.createdAt)}
                    </p>
                  </div>

                  <p className="mt-3 font-display text-[1.25rem] font-semibold leading-tight">{i.name}</p>

                  <p className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.95rem]">
                    <a href={`mailto:${i.email}`} className="underline underline-offset-4">
                      {i.email}
                    </a>
                    {telefon && (
                      <a href={`tel:${telefon.replace(/\s+/g, "")}`} className="underline underline-offset-4">
                        {telefon}
                      </a>
                    )}
                    {i.preferredDate && (
                      <span className="text-ink-soft">
                        preferovaný termín: {longDate(`${i.preferredDate}T12:00:00Z`)}
                      </span>
                    )}
                    {jazyk && <span className="text-ink-soft">píše {jazyk}</span>}
                  </p>

                  <details className="mt-4">
                    <summary className="cursor-pointer list-none text-[0.92rem] text-ink-soft underline-offset-4 hover:underline">
                      Zobrazit celou zprávu
                    </summary>
                    <div className="mt-3 max-w-3xl border-l-2 border-ink/15 pl-4">
                      {extra.choice && (
                        <p className="text-[0.95rem]">
                          <span className="text-ink-faint">Volba: </span>
                          {extra.choice}
                        </p>
                      )}
                      {extra.options && extra.options.length > 0 && (
                        <p className="mt-1 text-[0.95rem]">
                          <span className="text-ink-faint">Volby: </span>
                          {extra.options.join(", ")}
                        </p>
                      )}
                      <p className="mt-1 text-[0.95rem]">
                        <span className="text-ink-faint">Jazyk poptávky: </span>
                        {jazyk ?? "neuvedeno"}
                      </p>
                      <p className="mt-3 whitespace-pre-line leading-relaxed">
                        {i.message?.trim() || "Zákazník žádnou zprávu nenapsal."}
                      </p>
                      {i.handledAt && (
                        <p className="tabular mt-3 text-[0.86rem] text-ink-faint">
                          vyřízeno {dateTime(i.handledAt)}
                        </p>
                      )}
                    </div>
                  </details>

                  <div className="mt-4 flex flex-wrap items-start gap-x-6 gap-y-3">
                    <form action={i.handledAt ? vratitNevyrizene : oznacitVyrizene}>
                      <input type="hidden" name="id" value={i.id} />
                      <input type="hidden" name="dotaz" value={dotazText} />
                      <Button type="submit" variant={i.handledAt ? "quiet" : "primary"}>
                        {i.handledAt ? "Vrátit mezi nevyřízené" : "Označit jako vyřízené"}
                      </Button>
                    </form>

                    {/* Mazání je nevratné, proto se tlačítko musí nejdřív rozbalit. */}
                    <form action={smazatPoptavku}>
                      <input type="hidden" name="id" value={i.id} />
                      <input type="hidden" name="dotaz" value={dotazText} />
                      <details>
                        <summary className="cursor-pointer list-none py-2.5 text-[0.92rem] text-ember underline-offset-4 hover:underline">
                          Smazat poptávku
                        </summary>
                        <p className="mt-1 max-w-md text-[0.9rem] leading-relaxed text-ink-soft">
                          Poptávka od {i.name} zmizí ze systému natrvalo i s celou zprávou.
                          Do záznamu změn se zapíše, kdo ji smazal.
                        </p>
                        <Button type="submit" variant="danger" className="mt-3">
                          Ano, smazat
                        </Button>
                      </details>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Hint>
        Poptávky se z webu ukládají sem a zároveň chodí e-mailem. Odpovídá se běžnou poštou —
        stačí kliknout na e-mailovou adresu. Až je hotovo, označte poptávku za vyřízenou,
        ať víte, co ještě čeká.
      </Hint>
    </div>
  );
}
