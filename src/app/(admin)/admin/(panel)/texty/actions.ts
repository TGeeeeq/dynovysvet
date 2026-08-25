"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { CONTENT_PAGES, CONTENT_PAGE_INFO } from "@/content/blocks";
import { audit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/admin/session";
import { savePageContent, type ContentLocale, type PageContentInput } from "@/lib/db/content";
import { LOCALES } from "@/lib/i18n/config";
import { ROUTES } from "@/lib/i18n/routes";

/**
 * Uložení textů jedné stránky.
 *
 * Formulář posílá pole pojmenovaná `blok:<klíč>:<jazyk>`. Nečteme, co přišlo,
 * ale procházíme registr a bereme jen bloky, které do stránky patří — jinak by
 * šlo podstrčené pole zapsat cokoli pod libovolný klíč. Neznámé bloky zahazuje
 * i `savePageContent`, tady je odmítáme dřív, ať se do auditu nedostane smetí.
 *
 * Mazání se nedělá zvlášť: pole vrácené na výchozí znění (nebo prázdné) uloží
 * `savePageContent` jako „žádná odchylka" a řádek z databáze zmizí.
 */

export type SaveTextsState = {
  ok?: boolean;
  saved?: number;
  deleted?: number;
  error?: string;
};

/** Text delší než tohle už není nadpis ani odstavec, ale nedopatření. */
const MAX_LENGTH = 6000;

/**
 * Do textů jde prostý text, ne HTML. Nikde je nevykreslujeme přes
 * `dangerouslySetInnerHTML`, takže by značka na webu stejně vyšla jako
 * viditelné `<b>`; odmítnout ji rovnou je srozumitelnější než ji tam nechat
 * ležet — a kdyby někdo v budoucnu vykreslování změnil, tohle drží.
 */
const HTML_TAG = /<\s*\/?\s*[a-zA-Z][^>]*>/;

const Field = z.string().max(MAX_LENGTH).refine((v) => !HTML_TAG.test(v), {
  message: "html",
});

export async function saveTexts(
  _prev: SaveTextsState,
  formData: FormData,
): Promise<SaveTextsState> {
  const user = await requireAdmin();

  const page = String(formData.get("stranka") ?? "");
  const defs = CONTENT_PAGES[page];
  if (!defs) return { error: "Taková stránka v seznamu textů není." };

  const values: PageContentInput = {};

  for (const def of defs) {
    for (const locale of LOCALES) {
      const raw = formData.get(fieldName(def.key, locale));
      // Pole, které formulář neposlal, znamená „neměň" — ne „smaž".
      if (raw === null) continue;

      const parsed = Field.safeParse(String(raw));
      if (!parsed.success) {
        const why = parsed.error.issues[0]?.message;
        return {
          error:
            why === "html"
              ? `Do pole „${def.label}" se dostala značka HTML. Pole berou prostý text.`
              : `Text v poli „${def.label}" je příliš dlouhý.`,
        };
      }

      const bucket = (values[def.key] ??= {});
      bucket[locale] = parsed.data;
    }
  }

  const result = await savePageContent(page, values, user.id);
  if (!result.ok) return { error: result.problem };

  await audit(user.id, "texty.ulozeny", {
    entity: "content_blocks",
    entityId: page,
    detail: { ulozeno: result.saved, smazano: result.deleted },
  });

  revalidatePath("/admin/texty");
  revalidatePath(`/admin/texty/${page}`);
  for (const path of publicPaths(page)) revalidatePath(path);

  return { ok: true, saved: result.saved, deleted: result.deleted };
}

/** Jméno pole ve formuláři. Musí sedět s tím, co skládá `ContentEditor`. */
function fieldName(key: string, locale: ContentLocale): string {
  return `blok:${key}:${locale}`;
}

/**
 * Cesty veřejné stránky ve všech jazycích.
 *
 * Uvnitř aplikace mají všechny jazyky prefix (`/cs/vstupenky`) — českou adresu
 * bez prefixu na něj přepisuje `src/proxy.ts`. Přegenerovat se musí ten vnitřní
 * tvar, protože pod ním stránka v cache leží.
 */
function publicPaths(page: string): string[] {
  const info = CONTENT_PAGE_INFO[page];
  if (!info) return [];
  return LOCALES.map((locale) => {
    const slug = ROUTES[info.route][locale];
    return slug ? `/${locale}/${slug}` : `/${locale}`;
  });
}
