import { notFound } from "next/navigation";

import { CONTENT_PAGES, CONTENT_PAGE_INFO } from "@/content/blocks";
import { ContentEditor, type EditorGroup } from "@/components/admin/ContentEditor";
import { Empty, LinkButton, Notice, PageTitle } from "@/components/admin/ui";
import { hasDatabaseUrl } from "@/lib/db/client";
import { getPageOverrides } from "@/lib/db/content";
import { href } from "@/lib/i18n/routes";

type Params = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Params) {
  const { page } = await params;
  return { title: CONTENT_PAGE_INFO[page]?.title ?? "Texty stránky" };
}

/**
 * Editor jedné stránky.
 *
 * Server sem posílá dvojici „výchozí znění" a „co je teď vidět". Rozdíl mezi
 * nimi je jediné, co editor potřebuje vědět, aby uměl označit upravené bloky
 * i nabídnout návrat k původnímu textu.
 */
export default async function TextsEditor({ params }: Params) {
  const { page } = await params;

  const defs = CONTENT_PAGES[page];
  const info = CONTENT_PAGE_INFO[page];
  if (!defs || !info) notFound();

  const overrides = await getPageOverrides(page);

  const groups: EditorGroup[] = [];
  for (const def of defs) {
    const title = def.group ?? "Ostatní texty";
    let group = groups.find((g) => g.title === title);
    if (!group) {
      group = { title, blocks: [] };
      groups.push(group);
    }

    const base = { cs: def.cs, en: def.en, de: def.de };
    const override = overrides.get(def.key);
    group.blocks.push({
      key: def.key,
      label: def.label,
      multiline: def.multiline === true,
      base,
      // `null` v odchylce znamená „beze změny", ne prázdný text.
      current: {
        cs: override?.cs ?? base.cs,
        en: override?.en ?? base.en,
        de: override?.de ?? base.de,
      },
    });
  }

  return (
    <div className="space-y-10">
      <PageTitle
        title={info.title}
        hint="Vlevo česky, pak anglicky a německy. Prázdné pole znamená původní znění — cizí jazyky nemusíte vyplňovat jen proto, že tam je místo."
        action={
          <LinkButton href={href(info.route, "cs")}>Zobrazit na webu</LinkButton>
        }
      />

      {!hasDatabaseUrl() && (
        <Notice tone="bad">
          Databáze není připojená. Texty jsou vidět, ale uložit se nedají.
        </Notice>
      )}

      {groups.length === 0 ? (
        <Empty>Tahle stránka zatím nemá žádný editovatelný text.</Empty>
      ) : (
        <ContentEditor page={page} groups={groups} />
      )}
    </div>
  );
}
