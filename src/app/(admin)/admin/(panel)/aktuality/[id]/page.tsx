import { notFound } from "next/navigation";

import { deleteNews } from "../actions";
import { NewsForm } from "@/components/admin/NewsForm";
import { Badge, Button, Notice, PageTitle, SectionTitle } from "@/components/admin/ui";
import { dateTime } from "@/lib/admin/format";
import { getNews, newsState, toDateInput, toDateTimeInput } from "@/lib/admin/news";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ulozeno?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const item = await getNews(id);
  return { title: item ? item.titleCs : "Aktualita" };
}

/**
 * Úprava aktuality.
 *
 * Mazání stojí ve vlastním formuláři pod editací — vnořit ho do formuláře
 * s texty nejde a rozhodnutí „smazat" má stejně patřit jinam než „uložit".
 * Potvrzuje se rozbalením `<details>`, ne `window.confirm`: prohlížeč ho umí
 * potlačit a majitel by pak mazal na jedno kliknutí.
 */
export default async function EditNews({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);

  const item = await getNews(id);
  if (!item) notFound();

  const state = newsState(item);

  return (
    <div className="space-y-10">
      <PageTitle
        title={item.titleCs}
        hint={`Naposledy upraveno ${dateTime(item.updatedAt)}.`}
        action={<Badge tone={state.tone}>{state.label}</Badge>}
      />

      {query.ulozeno && <Notice>Aktualita je založená. Teď ji můžete dopsat.</Notice>}

      <NewsForm
        values={{
          id: item.id,
          slug: item.slug,
          titleCs: item.titleCs,
          titleEn: item.titleEn ?? "",
          titleDe: item.titleDe ?? "",
          bodyCs: item.bodyCs,
          bodyEn: item.bodyEn ?? "",
          bodyDe: item.bodyDe ?? "",
          publishedAt: toDateTimeInput(item.publishedAt),
          pinnedUntil: toDateInput(item.pinnedUntil),
          imagePath: item.imagePath ?? "",
        }}
      />

      <section className="border-t-2 border-ink/15 pt-6">
        <SectionTitle>Smazat</SectionTitle>
        <details className="mt-4">
          <summary className="cursor-pointer list-none text-[0.92rem] text-ink-soft underline-offset-4 hover:text-ember hover:underline">
            Chci tuhle aktualitu smazat
          </summary>
          <div className="mt-5 border-l-2 border-ember pl-4">
            <p className="max-w-xl text-[0.95rem] text-ink-soft">
              Smazanou aktualitu už nejde vrátit. Pokud ji chcete jen stáhnout z webu, stačí
              vymazat datum zveřejnění a uložit — zůstane tady jako koncept.
            </p>
            <form action={deleteNews} className="mt-5">
              <input type="hidden" name="id" value={item.id} />
              <Button type="submit" variant="danger">
                Ano, smazat aktualitu
              </Button>
            </form>
          </div>
        </details>
      </section>
    </div>
  );
}
