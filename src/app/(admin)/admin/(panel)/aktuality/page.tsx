import Link from "next/link";

import { Badge, Empty, Hint, LinkButton, Notice, PageTitle, Table, Td } from "@/components/admin/ui";
import { dateTime, date as dateOnly } from "@/lib/admin/format";
import { listNews, newsState } from "@/lib/admin/news";
import { hasDatabaseUrl } from "@/lib/db/client";

export const metadata = { title: "Aktuality" };

type Props = { searchParams: Promise<{ smazano?: string; chyba?: string }> };

/**
 * Seznam aktualit. Nejnovější nahoře, koncepty úplně na začátku — jsou to
 * rozdělané věci, na které se má nejdřív podívat.
 */
export default async function NewsIndex({ searchParams }: Props) {
  const [items, params] = await Promise.all([listNews(), searchParams]);

  return (
    <div className="space-y-10">
      <PageTitle
        title="Aktuality"
        hint="Krátké novinky na titulní stranu — změna otevírací doby, nový termín, akce navíc."
        action={
          <LinkButton href="/admin/aktuality/nova" variant="primary">
            Napsat aktualitu
          </LinkButton>
        }
      />

      {params.smazano && <Notice>Aktualita je smazaná.</Notice>}
      {params.chyba && <Notice tone="bad">Aktualitu se nepodařilo smazat.</Notice>}

      {!hasDatabaseUrl() && (
        <Notice tone="bad">
          Databáze není připojená, takže se nemá odkud načíst žádná aktualita.
        </Notice>
      )}

      {items.length === 0 ? (
        <Empty>Zatím tu žádná aktualita není.</Empty>
      ) : (
        <Table head={["Nadpis", "Zveřejněno od", "Nahoře do", "Stav"]}>
          {items.map((item) => {
            const state = newsState(item);
            return (
              <tr key={item.id}>
                <Td>
                  <Link
                    href={`/admin/aktuality/${item.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {item.titleCs}
                  </Link>
                  <span className="block text-[0.82rem] text-ink-faint">{item.slug}</span>
                </Td>
                <Td className="tabular whitespace-nowrap">
                  {item.publishedAt ? dateTime(item.publishedAt) : "—"}
                </Td>
                <Td className="tabular whitespace-nowrap">
                  {item.pinnedUntil ? dateOnly(item.pinnedUntil) : "—"}
                </Td>
                <Td>
                  <Badge tone={state.tone}>{state.label}</Badge>
                </Td>
              </tr>
            );
          })}
        </Table>
      )}

      <Hint>
        Aktualita bez data zveřejnění je koncept — na webu ji nikdo neuvidí. Datum v budoucnu
        znamená, že se ukáže sama v ten čas.
      </Hint>
    </div>
  );
}
