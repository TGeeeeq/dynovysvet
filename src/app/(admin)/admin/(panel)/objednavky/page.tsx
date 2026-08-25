import Link from "next/link";
import { listOrders, PAGE_SIZE, type OrderFilters } from "@/lib/admin/orders";
import { czk, dateTime, ORDER_STATUS } from "@/lib/admin/format";
import { orderStatus, type OrderStatus } from "@/lib/db/schema";
import {
  Badge,
  Button,
  Empty,
  INPUT_CLASS,
  LABEL_CLASS,
  Notice,
  PageTitle,
  SectionTitle,
  Stat,
  Table,
  Td,
} from "@/components/admin/ui";

export const metadata = { title: "Objednávky" };

/**
 * Výpis objednávek.
 *
 * Filtry žijí výhradně v adrese a formulář je obyčejný `method="get"`. Odkaz
 * na vyfiltrovaný seznam („objednávky k vrácení peněz“) tak jde poslat
 * e-mailem, uložit do záložek a vrátit se na něj tlačítkem zpět — což by
 * s filtrem drženým v paměti prohlížeče nešlo.
 */

type Search = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined): string | undefined =>
  (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

const DEN = /^\d{4}-\d{2}-\d{2}$/;

function isStatus(value: string | undefined): value is OrderStatus {
  return value !== undefined && (orderStatus.enumValues as readonly string[]).includes(value);
}

/** Odkaz na jinou stránku téhož filtru. */
function pageHref(search: Search, page: number): string {
  const q = new URLSearchParams();
  for (const key of ["stav", "hledat", "od", "do"]) {
    const value = one(search[key]);
    if (value) q.set(key, value);
  }
  if (page > 1) q.set("strana", String(page));
  const s = q.toString();
  return s ? `/admin/objednavky?${s}` : "/admin/objednavky";
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams;

  const stav = one(search.stav);
  const hledat = one(search.hledat);
  const od = one(search.od);
  const doDne = one(search.do);
  const strana = Number.parseInt(one(search.strana) ?? "1", 10);

  const filters: OrderFilters = {
    status: isStatus(stav) ? stav : undefined,
    search: hledat?.slice(0, 120),
    from: od && DEN.test(od) ? od : undefined,
    to: doDne && DEN.test(doDne) ? doDne : undefined,
    page: Number.isFinite(strana) && strana > 0 ? strana : 1,
  };

  const list = await listOrders(filters);
  const filtrovano = Boolean(filters.status || filters.search || filters.from || filters.to);
  const prvni = (list.page - 1) * PAGE_SIZE + 1;
  const posledni = (list.page - 1) * PAGE_SIZE + list.rows.length;

  return (
    <div className="space-y-12">
      <PageTitle
        title="Objednávky"
        hint="Kdo si koupil vstupenky, kdo zaplatil a u koho je potřeba zasáhnout."
      />

      {!list.connected && (
        <Notice tone="bad">
          Databáze zatím není připojená, takže se nemá odkud načíst žádná objednávka.
        </Notice>
      )}

      {one(search.zprava) === "neexistuje" && (
        <Notice tone="bad">Taková objednávka v systému není.</Notice>
      )}

      <section>
        <SectionTitle>Vyhledávání</SectionTitle>
        {/* Cíl formuláře je uvedený natvrdo, ať se stránkování při novém
            hledání vynuluje — pole „strana“ se prostě neodešle. */}
        <form
          method="get"
          action="/admin/objednavky"
          className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="lg:col-span-2">
            <label htmlFor="hledat" className={LABEL_CLASS}>
              Číslo objednávky nebo e-mail
            </label>
            <input
              id="hledat"
              name="hledat"
              type="search"
              defaultValue={hledat ?? ""}
              placeholder="DS2026-0042 nebo novak@"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="stav" className={LABEL_CLASS}>
              Stav
            </label>
            <select id="stav" name="stav" defaultValue={isStatus(stav) ? stav : ""} className={INPUT_CLASS}>
              <option value="">Všechny stavy</option>
              {orderStatus.enumValues.map((value) => (
                <option key={value} value={value}>
                  {ORDER_STATUS[value]?.label ?? value}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <label htmlFor="od" className={LABEL_CLASS}>
                Přijato od
              </label>
              <input id="od" name="od" type="date" defaultValue={od ?? ""} className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="do" className={LABEL_CLASS}>
                Přijato do
              </label>
              <input id="do" name="do" type="date" defaultValue={doDne ?? ""} className={INPUT_CLASS} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-4">
            <Button type="submit">Vyhledat</Button>
            {filtrovano && (
              <Link href="/admin/objednavky" className="text-[0.9rem] underline-offset-4 hover:underline">
                Zrušit filtr
              </Link>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          <Stat
            label={filtrovano ? "Nalezeno objednávek" : "Objednávek celkem"}
            value={list.found}
            note={list.found > PAGE_SIZE ? `zobrazeno ${prvni}–${posledni}` : undefined}
          />
          <Stat
            label="Celková částka"
            value={czk(list.foundTotalCzk)}
            note="součet všech nalezených, bez ohledu na stav"
          />
        </div>
      </section>

      <section>
        {list.rows.length === 0 ? (
          <Empty>
            {filtrovano
              ? "Tomuhle zadání neodpovídá žádná objednávka. Zkuste hledat jinak."
              : "Zatím tu žádná objednávka není."}
          </Empty>
        ) : (
          <Table head={["Číslo", "Zákazník", "Termín návštěvy", "Přijato", "Částka", "Stav"]}>
            {list.rows.map((o) => {
              const s = ORDER_STATUS[o.status] ?? { label: o.status, tone: "neutral" as const };
              return (
                <tr key={o.id}>
                  <Td className="tabular whitespace-nowrap">
                    <Link
                      href={`/admin/objednavky/${o.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </Td>
                  <Td>
                    <span className="block">{o.name || "—"}</span>
                    <span className="block text-[0.84rem] text-ink-faint">{o.email}</span>
                  </Td>
                  <Td className="tabular whitespace-nowrap">
                    {o.visitAt ? dateTime(o.visitAt) : "—"}
                  </Td>
                  <Td className="tabular whitespace-nowrap">{dateTime(o.createdAt)}</Td>
                  <Td className="tabular">{czk(o.totalCzk)}</Td>
                  <Td>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </section>

      {list.pages > 1 && (
        <nav
          aria-label="Stránkování"
          className="flex items-center justify-between gap-4 border-t-2 border-ink/15 pt-5 text-[0.92rem]"
        >
          {list.page > 1 ? (
            <Link href={pageHref(search, list.page - 1)} className="underline-offset-4 hover:underline">
              ← Předchozí
            </Link>
          ) : (
            <span className="text-ink-faint">← Předchozí</span>
          )}
          <span className="tabular text-ink-soft">
            Strana {list.page} z {list.pages}
          </span>
          {list.page < list.pages ? (
            <Link href={pageHref(search, list.page + 1)} className="underline-offset-4 hover:underline">
              Další →
            </Link>
          ) : (
            <span className="text-ink-faint">Další →</span>
          )}
        </nav>
      )}
    </div>
  );
}
