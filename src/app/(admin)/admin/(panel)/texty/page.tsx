import Link from "next/link";

import { CONTENT_PAGES, CONTENT_PAGE_INFO, CONTENT_PAGE_KEYS } from "@/content/blocks";
import { Empty, Hint, Notice, PageTitle, Table, Td } from "@/components/admin/ui";
import { getPageOverrides } from "@/lib/db/content";
import { hasDatabaseUrl } from "@/lib/db/client";
import { href } from "@/lib/i18n/routes";

export const metadata = { title: "Texty stránek" };

/**
 * Rozcestník stránek. Odpovídá na jedinou otázku: kde se čeho dotknout —
 * a kde už někdo něco přepsal.
 */
export default async function TextsIndex() {
  const pages = CONTENT_PAGE_KEYS;
  const overrides = await Promise.all(pages.map((page) => getPageOverrides(page)));

  const rows = pages.map((page, i) => {
    const info = CONTENT_PAGE_INFO[page];
    const blocks = CONTENT_PAGES[page] ?? [];
    // Řádek v databázi existuje jen u skutečné odchylky, ale může mít
    // vyplněný jen jeden jazyk — počítáme bloky, ne jazyky.
    const changed = [...overrides[i].values()].filter(
      (o) => o.cs !== null || o.en !== null || o.de !== null,
    ).length;
    return { page, title: info?.title ?? page, web: info ? href(info.route, "cs") : null, blocks: blocks.length, changed };
  });

  const changedTotal = rows.reduce((sum, r) => sum + r.changed, 0);

  return (
    <div className="space-y-10">
      <PageTitle
        title="Texty stránek"
        hint="V databázi leží jen to, co jste sami přepsali; všechno ostatní se bere z webu. Jakmile text vrátíte na původní znění, z databáze zase zmizí."
      />

      {!hasDatabaseUrl() && (
        <Notice tone="bad">
          Databáze není připojená. Texty jde prohlížet, ale uložit se zatím nedají.
        </Notice>
      )}

      {rows.length === 0 ? (
        <Empty>Zatím tu není žádná stránka s editovatelnými texty.</Empty>
      ) : (
        <>
          <Table head={["Stránka", "Textů", "Upraveno", "Na webu"]}>
            {rows.map((r) => (
              <tr key={r.page}>
                <Td>
                  <Link
                    href={`/admin/texty/${r.page}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {r.title}
                  </Link>
                </Td>
                <Td className="tabular">{r.blocks}</Td>
                <Td className="tabular">
                  {r.changed > 0 ? (
                    <span className="text-ember">{r.changed}</span>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </Td>
                <Td>
                  {r.web && (
                    <a
                      href={r.web}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink-soft underline-offset-4 hover:underline"
                    >
                      Zobrazit na webu
                    </a>
                  )}
                </Td>
              </tr>
            ))}
          </Table>

          <Hint>
            {changedTotal > 0
              ? `Celkem máte přepsaných textů: ${changedTotal}. Zbytek se bere z výchozího znění.`
              : "Zatím jste nepřepsali žádný text — web běží celý na výchozím znění."}{" "}
            Do polí patří prostý text, ne HTML.
          </Hint>
        </>
      )}
    </div>
  );
}
