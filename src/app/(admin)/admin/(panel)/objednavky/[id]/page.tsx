import Link from "next/link";
import { notFound } from "next/navigation";
import { orderDetail } from "@/lib/admin/orders";
import { czk, dateTime, longDate, ORDER_STATUS, time } from "@/lib/admin/format";
import {
  Badge,
  Button,
  Empty,
  Hint,
  Notice,
  PageTitle,
  SectionTitle,
  Stat,
  Table,
  Td,
} from "@/components/admin/ui";
import {
  oznacitVracene,
  oznacitZaplacene,
  poslatVstupenkuZnovu,
  zrusitObjednavku,
} from "../actions";

export const metadata = { title: "Objednávka" };

type Search = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined): string | undefined =>
  (Array.isArray(v) ? v[0] : v) || undefined;

/** Jazyk objednávky česky — majitel podle toho pozná, jak má odpovědět. */
const JAZYK: Record<string, string> = { cs: "česky", en: "anglicky", de: "německy" };

/** Stavy z platební brány chodí anglicky; do administrace patří česky. */
const PLATBA: Record<string, string> = {
  PAID: "Zaplaceno",
  PENDING: "Čeká na dokončení",
  CANCELLED: "Zrušeno",
  TIMEOUT: "Vypršel čas",
  AUTHORIZED: "Předautorizováno",
  REFUNDED: "Vráceno",
};

/** Hlášky po zásahu. Kód nese adresa, ať je stránka po obnovení pořád stejná. */
function hlaska(kod: string | undefined, mista: string | undefined) {
  switch (kod) {
    case "zaplaceno":
      return { tone: "ok" as const, text: "Objednávka je označená jako zaplacená." };
    case "zruseno":
      return {
        tone: "ok" as const,
        text:
          mista && mista !== "0"
            ? `Objednávka je zrušená a ${mista} míst se vrátilo do prodeje.`
            : "Objednávka je zrušená. Žádná místa se neuvolnila — tahle objednávka už žádná nedržela.",
      };
    case "vraceno":
      return {
        tone: "ok" as const,
        text: "Poznamenáno, že se vstupné vrací. Peníze pošlete zákazníkovi ručně.",
      };
    case "email-nezapojen":
      return { tone: "bad" as const, text: "Odesílání e-mailů zatím není zapojené." };
    case "jiny-stav":
      return {
        tone: "bad" as const,
        text: "Objednávka už mezitím změnila stav, akce se neprovedla. Zkontrolujte, jak je na tom teď.",
      };
    case "neexistuje":
      return { tone: "bad" as const, text: "Taková objednávka v systému není." };
    case "bez-databaze":
      return { tone: "bad" as const, text: "Databáze není připojená, nešlo nic uložit." };
    case "chyba":
      return { tone: "bad" as const, text: "Něco se pokazilo a změna se neuložila. Zkuste to prosím znovu." };
    default:
      return null;
  }
}

/**
 * Potvrzení nevratného zásahu.
 *
 * Místo vyskakovacího okna se tlačítko schová do rozbalovacího bloku: majitel
 * musí nejdřív rozkliknout, přečíst si větu o tom, co se stane, a teprve pak
 * má na co kliknout. Funguje to i bez JavaScriptu a nedá se to odklikat omylem.
 */
function Potvrzeni({
  id,
  action,
  summary,
  popis,
  tlacitko,
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  summary: string;
  popis: string;
  tlacitko: string;
}) {
  return (
    <form action={action} className="border-t-2 border-ink/15 pt-4">
      <input type="hidden" name="id" value={id} />
      <details className="group">
        <summary className="cursor-pointer list-none text-[0.98rem] underline-offset-4 hover:underline">
          {summary}
          <span className="ml-2 text-[0.78rem] uppercase tracking-[0.16em] text-ink-faint">
            rozbalit
          </span>
        </summary>
        <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-ink-soft">{popis}</p>
        <Button type="submit" variant="danger" className="mt-4">
          {tlacitko}
        </Button>
      </details>
    </form>
  );
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Search>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const order = await orderDetail(id);
  if (!order) notFound();

  const stav = ORDER_STATUS[order.status] ?? { label: order.status, tone: "neutral" as const };
  const zprava = hlaska(one(search.zprava), one(search.mista));

  // Termín návštěvy bereme z položek — objednávka sama žádný nemá a zboží
  // bez časovky (dýně, mošt) ho mít nemusí.
  const terminy = [
    ...new Map(
      order.items
        .filter((i) => i.slotStartsAt)
        .map((i) => [i.slotStartsAt!.getTime(), { od: i.slotStartsAt!, doKdy: i.slotEndsAt }]),
    ).values(),
  ].sort((a, b) => a.od.getTime() - b.od.getTime());

  return (
    <div className="space-y-12">
      <PageTitle
        title={`Objednávka č. ${order.orderNumber}`}
        hint={`Přijato ${dateTime(order.createdAt)}${order.paidAt ? `, zaplaceno ${dateTime(order.paidAt)}` : ""}.`}
        action={
          <Link href="/admin/objednavky" className="text-[0.9rem] underline-offset-4 hover:underline">
            ← Zpět na objednávky
          </Link>
        }
      />

      {zprava && <Notice tone={zprava.tone}>{zprava.text}</Notice>}

      <section>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Stav" value={<Badge tone={stav.tone}>{stav.label}</Badge>} />
          <Stat label="Částka" value={czk(order.totalCzk)} note={order.currency !== "CZK" ? order.currency : undefined} />
          <Stat
            label="Vstupenky"
            value={order.tickets.total}
            note={
              order.tickets.total === 0
                ? "zatím nevystavené"
                : `${order.tickets.checkedIn} už prošlo branou`
            }
          />
          <Stat label="Objednáno" value={JAZYK[order.locale] ?? order.locale} note="jazyk objednávky" />
        </div>
      </section>

      <section>
        <SectionTitle>Zákazník</SectionTitle>
        <dl className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">Jméno</dt>
            <dd className="mt-1.5 text-[1.05rem]">{order.name || "neuvedeno"}</dd>
          </div>
          <div>
            <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">E-mail</dt>
            <dd className="mt-1.5 text-[1.05rem]">
              <a href={`mailto:${order.email}`} className="underline underline-offset-4">
                {order.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">Telefon</dt>
            <dd className="mt-1.5 text-[1.05rem]">
              {order.phone ? (
                <a href={`tel:${order.phone.replace(/\s+/g, "")}`} className="underline underline-offset-4">
                  {order.phone}
                </a>
              ) : (
                "neuvedeno"
              )}
            </dd>
          </div>
        </dl>

        {order.note && (
          <div className="mt-8 border-l-2 border-ink/20 pl-4">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">
              Poznámka od zákazníka
            </p>
            <p className="mt-1.5 whitespace-pre-line leading-relaxed">{order.note}</p>
          </div>
        )}
      </section>

      <section>
        <SectionTitle>Termín návštěvy</SectionTitle>
        <div className="mt-5">
          {terminy.length === 0 ? (
            <p className="text-ink-soft">Objednávka není navázaná na žádnou časovku.</p>
          ) : (
            <ul className="space-y-2">
              {terminy.map((t) => (
                <li key={t.od.getTime()} className="text-[1.05rem]">
                  {longDate(t.od)} <span className="tabular">{time(t.od)}</span>
                  {t.doKdy && <span className="tabular text-ink-soft"> – {time(t.doKdy)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <SectionTitle>Co si zákazník koupil</SectionTitle>
        <div className="mt-5">
          {order.items.length === 0 ? (
            <Empty>Objednávka nemá žádné položky.</Empty>
          ) : (
            <Table head={["Vstupenka", "Počet", "Cena za kus", "Celkem", "Časovka"]}>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <Td>
                    {i.ticketTypeName}
                    {!i.countsToCapacity && (
                      <span className="block text-[0.82rem] text-ink-faint">nezabírá místo</span>
                    )}
                  </Td>
                  <Td className="tabular">{i.quantity}</Td>
                  <Td className="tabular">{czk(i.unitPriceCzk)}</Td>
                  <Td className="tabular">{czk(i.subtotalCzk)}</Td>
                  <Td className="tabular whitespace-nowrap">
                    {i.slotStartsAt ? dateTime(i.slotStartsAt) : "—"}
                  </Td>
                </tr>
              ))}
              <tr>
                <Td className="font-medium">Celkem</Td>
                <Td>{""}</Td>
                <Td>{""}</Td>
                <Td className="tabular font-medium">{czk(order.totalCzk)}</Td>
                <Td>{""}</Td>
              </tr>
            </Table>
          )}
        </div>
      </section>

      <section>
        <SectionTitle>Platby</SectionTitle>
        <div className="mt-5">
          {order.payments.length === 0 ? (
            <Empty>Z platební brány zatím nic nedorazilo.</Empty>
          ) : (
            <Table head={["Kdy", "Brána", "Stav", "Částka"]}>
              {order.payments.map((p) => (
                <tr key={p.id}>
                  <Td className="tabular whitespace-nowrap">{dateTime(p.createdAt)}</Td>
                  <Td>{p.gateway === "comgate" ? "Comgate" : p.gateway}</Td>
                  <Td>{PLATBA[p.status.toUpperCase()] ?? p.status}</Td>
                  <Td className="tabular">{czk(p.amountCzk)}</Td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </section>

      <section>
        <SectionTitle>Co s objednávkou udělat</SectionTitle>
        <div className="mt-5 space-y-6">
          {order.status === "ceka_na_platbu" && (
            <form action={oznacitZaplacene} className="border-t-2 border-ink/15 pt-4">
              <input type="hidden" name="id" value={order.id} />
              <Button type="submit">Označit jako zaplacené</Button>
              <Hint>
                Pro platbu převodem na účet nebo hotově na místě. Objednávka se přepne na
                „Zaplaceno“ a zapíše se dnešní datum.
              </Hint>
            </form>
          )}

          {order.status !== "zruseno" && (
            <Potvrzeni
              id={order.id}
              action={zrusitObjednavku}
              summary="Zrušit objednávku a uvolnit místa"
              popis="Objednávka se přepne na „Zrušeno“ a místa, která drží, se vrátí do prodeje ostatním. Vstupenky tím přestanou platit. Vrátit se to nedá."
              tlacitko="Ano, zrušit a uvolnit místa"
            />
          )}

          {(order.status === "k_vraceni" || order.status === "zaplaceno") && (
            <div className="space-y-2">
              <Potvrzeni
                id={order.id}
                action={oznacitVracene}
                summary="Označit jako vrácené"
                popis="Zapíše se, že se vstupné vrací, a objednávka se přepne na „Zrušeno“. Peníze systém nikam neposílá — vrátíte je sami převodem v bance nebo přes Comgate. Místa se tím neuvolní; pokud je chcete vrátit do prodeje, použijte „Zrušit objednávku a uvolnit místa“."
                tlacitko="Ano, peníze vracím"
              />
              <Hint>
                Vrácení peněz je vždycky ruční krok. Systém si ho jen poznamená do záznamu změn,
                aby bylo později dohledatelné, kdo a kdy o něm rozhodl.
              </Hint>
            </div>
          )}

          <form action={poslatVstupenkuZnovu} className="border-t-2 border-ink/15 pt-4">
            <input type="hidden" name="id" value={order.id} />
            <Button type="submit" variant="quiet">
              Poslat vstupenku znovu e-mailem
            </Button>
            <Hint>Odesílání e-mailů zatím není zapojené — zatím se jen poznamená, že jste o to požádali.</Hint>
          </form>
        </div>
      </section>
    </div>
  );
}
