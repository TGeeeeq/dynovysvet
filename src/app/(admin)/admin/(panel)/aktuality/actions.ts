"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import {
  createNews,
  endOfPragueDay,
  fromDateTimeInput,
  removeNews,
  slugify,
  updateNews,
  type NewsInput,
} from "@/lib/admin/news";
import { requireAdmin } from "@/lib/admin/session";
import { LOCALES } from "@/lib/i18n/config";

/**
 * Aktuality — zakládání, úpravy a mazání.
 *
 * Formuláři se nevěří v ničem: adresa se znovu přepíše přes `slugify`, data se
 * čtou jen v přesném tvaru z `<input>`, cesta k obrázku smí být jen cesta na
 * našem webu. Do databáze jde až to, co projde zodem.
 */

export type NewsFormState = { ok?: boolean; error?: string };

/**
 * Do aktualit jde prostý text. Nikde se nevykresluje přes
 * `dangerouslySetInnerHTML`, značka by tedy na webu vyšla jako viditelné
 * `<b>` — odmítnout ji rovnou je poctivější než ji nechat projít.
 */
const HTML_TAG = /<\s*\/?\s*[a-zA-Z][^>]*>/;

const plain = (max: number) =>
  z.string().trim().max(max, "Text je příliš dlouhý.").refine((v) => !HTML_TAG.test(v), {
    message: "Do textu nepatří značky HTML — pole berou prostý text.",
  });

const Form = z.object({
  id: z.union([z.uuid(), z.literal("")]).default(""),
  slug: z
    .string()
    .trim()
    .min(1, "Adresa aktuality nesmí zůstat prázdná.")
    .max(80, "Adresa aktuality je příliš dlouhá."),
  titleCs: plain(200).pipe(z.string().min(2, "Český nadpis je povinný.")),
  titleEn: plain(200),
  titleDe: plain(200),
  bodyCs: plain(20_000).pipe(z.string().min(2, "Český text aktuality je povinný.")),
  bodyEn: plain(20_000),
  bodyDe: plain(20_000),
  publishedAt: z
    .string()
    .trim()
    .regex(/^$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Datum zveřejnění není v pořádku."),
  pinnedUntil: z
    .string()
    .trim()
    .regex(/^$|^\d{4}-\d{2}-\d{2}$/, "Datum připnutí není v pořádku."),
  imagePath: z
    .string()
    .trim()
    .max(300)
    .regex(/^$|^\/[A-Za-z0-9._\-/]+$/, "Cesta k obrázku musí začínat lomítkem, např. /foto/dyne.jpg."),
});

export async function saveNews(
  _prev: NewsFormState,
  formData: FormData,
): Promise<NewsFormState> {
  const user = await requireAdmin();

  const parsed = Form.safeParse({
    id: text(formData, "id"),
    slug: text(formData, "slug"),
    titleCs: text(formData, "titleCs"),
    titleEn: text(formData, "titleEn"),
    titleDe: text(formData, "titleDe"),
    bodyCs: text(formData, "bodyCs"),
    bodyEn: text(formData, "bodyEn"),
    bodyDe: text(formData, "bodyDe"),
    publishedAt: text(formData, "publishedAt"),
    pinnedUntil: text(formData, "pinnedUntil"),
    imagePath: text(formData, "imagePath"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulář se nepodařilo přečíst." };
  }
  const v = parsed.data;

  // Adresu normalizujeme znovu na serveru — v prohlížeči si ji uživatel může
  // přepsat na cokoli a v odkazu nesmí skončit mezera ani diakritika.
  const slug = slugify(v.slug);
  if (!slug) return { error: "Z adresy aktuality nezbylo nic použitelného. Zvolte prosím jinou." };

  const input: NewsInput = {
    slug,
    titleCs: v.titleCs,
    titleEn: blank(v.titleEn),
    titleDe: blank(v.titleDe),
    bodyCs: v.bodyCs,
    bodyEn: blank(v.bodyEn),
    bodyDe: blank(v.bodyDe),
    // Prázdné datum zveřejnění = koncept. Budoucí datum = naplánováno.
    publishedAt: v.publishedAt ? fromDateTimeInput(v.publishedAt) : null,
    pinnedUntil: v.pinnedUntil ? endOfPragueDay(v.pinnedUntil) : null,
    imagePath: blank(v.imagePath),
  };

  if (v.publishedAt && !input.publishedAt) return { error: "Datum zveřejnění není v pořádku." };
  if (v.pinnedUntil && !input.pinnedUntil) return { error: "Datum připnutí není v pořádku." };

  const result = v.id ? await updateNews(v.id, input) : await createNews(input);
  if (!result.ok) return { error: result.problem };

  await audit(user.id, v.id ? "aktualita.upravena" : "aktualita.zalozena", {
    entity: "news",
    entityId: result.id,
    detail: { slug, zverejneno: input.publishedAt?.toISOString() ?? null },
  });

  revalidateNews(result.id);

  // Nová aktualita nemá kam se vrátit — po založení pokračujeme rovnou
  // v její editaci, ať je vidět, že opravdu vznikla.
  if (!v.id) redirect(`/admin/aktuality/${result.id}?ulozeno=1`);

  return { ok: true };
}

export async function deleteNews(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const ok = await removeNews(id);
  if (ok) {
    await audit(user.id, "aktualita.smazana", { entity: "news", entityId: id });
    revalidateNews(id);
  }

  redirect(ok ? "/admin/aktuality?smazano=1" : "/admin/aktuality?chyba=1");
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Prázdný překlad ukládáme jako `null` — web pak sáhne po českém znění. */
function blank(value: string): string | null {
  return value.length > 0 ? value : null;
}

/**
 * Aktuality visí na titulní straně, takže se po každé změně musí přegenerovat
 * všechny tři jazykové mutace titulky. Uvnitř aplikace má i čeština prefix
 * (`/cs`), na veřejnou adresu bez prefixu ji přepisuje `src/proxy.ts`.
 */
function revalidateNews(id: string): void {
  revalidatePath("/admin/aktuality");
  revalidatePath(`/admin/aktuality/${id}`);
  for (const locale of LOCALES) revalidatePath(`/${locale}`);
}
