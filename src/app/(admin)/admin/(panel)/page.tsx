import Link from "next/link";
import { getAdminSession } from "@/lib/admin/session";
import { overview, recentOrders, upcomingDays } from "@/lib/admin/queries";
import { czk, dateTime, longDate, ORDER_STATUS } from "@/lib/admin/format";
import { Badge, Empty, Notice, PageTitle, SectionTitle, Stat, Table, Td } from "@/components/admin/ui";

export const metadata = { title: "Přehled" };

/**
 * První obrazovka po přihlášení. Odpovídá na tři otázky v tomhle pořadí:
 * kolik lidí dnes přijde, jestli něco nehoří, a co se prodalo.
 */
export default async function AdminHome() {
  const session = await getAdminSession();
  const [data, orders, days] = await Promise.all([overview(), recentOrders(8), upcomingDays(6)]);

  const firstName = session?.user.name?.split(" ")[0];
  const alerts = [
    data.needsRefund > 0 && {
      href: "/admin/objednavky?stav=k_vraceni",
      text: `${data.needsRefund}× přišla platba, ale místo už nebylo. Je potřeba vrátit peníze.`,
    },
    data.newInquiries > 0 && {
      href: "/admin/poptavky",
      text: `${data.newInquiries} nevyřízených poptávek.`,
    },
  ].filter(Boolean) as { href: string; text: string }[];

  return (
    <div className="space-y-14">
      <PageTitle
        title={firstName ? `Dobrý den, ${firstName}` : "Přehled"}
        hint="Co se na statku děje dnes a co se prodalo za poslední měsíc."
      />

      {!data.connected && (
        <Notice tone="bad">
          Databáze zatím není připojená, takže se nemá odkud načíst nic reálného.
          Čísla níže jsou nuly.
        </Notice>
      )}

      {alerts.length > 0 && (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="block border-l-2 border-ember py-2.5 pl-4 text-[0.98rem] text-ember underline-offset-4 hover:underline"
              >
                {a.text}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section>
        <SectionTitle>Dnes a zítra</SectionTitle>
        <div className="mt-5 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Dnes dorazí"
            value={data.todayVisitors}
            note={data.todayCapacity ? `z kapacity ${data.todayCapacity}` : "dnes je zavřeno"}
          />
          <Stat label="Zítra dorazí" value={data.tomorrowVisitors} />
          <Stat
            label="Čeká na platbu"
            value={data.awaitingPayment}
            note="rozdělané objednávky"
          />
          <Stat label="Odběratelů novinek" value={data.newsletter} />
        </div>
      </section>

      <section>
        <SectionTitle>Posledních 30 dní</SectionTitle>
        <div className="mt-5 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Zaplacené objednávky" value={data.paidOrders30d} />
          <Stat label="Tržba" value={czk(data.revenue30dCzk)} note="jen zaplacené" />
          <Stat
            label="Průměrná objednávka"
            value={czk(data.paidOrders30d ? Math.round(data.revenue30dCzk / data.paidOrders30d) : 0)}
          />
          <Stat label="Nevyřízené poptávky" value={data.newInquiries} />
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <SectionTitle>Nejbližší otevírací dny</SectionTitle>
          <Link href="/admin/sezona" className="text-[0.88rem] underline-offset-4 hover:underline">
            Upravit sezónu
          </Link>
        </div>
        <div className="mt-5">
          {days.length === 0 ? (
            <Empty>Zatím nejsou vypsané žádné otevírací dny.</Empty>
          ) : (
            <Table head={["Den", "Časovek", "Obsazeno", "Stav"]}>
              {days.map((d) => (
                <tr key={d.date}>
                  <Td>{longDate(`${d.date}T12:00:00Z`)}</Td>
                  <Td className="tabular">{d.slots}</Td>
                  <Td className="tabular">
                    {d.reserved} / {d.capacity}
                  </Td>
                  <Td>
                    {d.published ? (
                      <Badge tone="ok">v prodeji</Badge>
                    ) : (
                      <Badge>nezveřejněno</Badge>
                    )}
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <SectionTitle>Poslední objednávky</SectionTitle>
          <Link href="/admin/objednavky" className="text-[0.88rem] underline-offset-4 hover:underline">
            Všechny objednávky
          </Link>
        </div>
        <div className="mt-5">
          {orders.length === 0 ? (
            <Empty>Zatím tu žádná objednávka není.</Empty>
          ) : (
            <Table head={["Číslo", "Zákazník", "Přijato", "Částka", "Stav"]}>
              {orders.map((o) => {
                const s = ORDER_STATUS[o.status] ?? { label: o.status, tone: "neutral" as const };
                return (
                  <tr key={o.id}>
                    <Td className="tabular">
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
        </div>
      </section>
    </div>
  );
}
