import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PAGES } from "@/components/pages/registry";
import { SEO } from "@/content/seo";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { ROUTES, ROUTE_KEYS, alternates, routeKeyFromSlug } from "@/lib/i18n/routes";

/**
 * Všechny podstránky vedou sem. Rozcestník je slug — v každém jazyce jiný,
 * takže se to nedá vyřešit složkami v `app/`.
 *
 * `dynamicParams = false` znamená, že cokoli mimo registr vrátí 404 rovnou
 * z CDN a vůbec nespustí funkci. Levné a zároveň to zavírá dveře pokusům
 * generovat libovolné cesty.
 */
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  return ROUTE_KEYS.filter((key) => key !== "home").map((key) => ({
    slug: [ROUTES[key][locale]],
  }));
}

function resolve(locale: string, slug: string[]) {
  if (!isLocale(locale) || slug.length !== 1) return null;
  const key = routeKeyFromSlug(locale, slug[0]);
  return key ? { locale, key } : null;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/[...slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const hit = resolve(locale, slug);
  if (!hit) return {};

  const seo = SEO[hit.key][hit.locale];
  const alts = alternates(hit.key);
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: alts[hit.locale],
      languages: { ...alts, "x-default": alts.cs },
    },
  };
}

export default async function LocalisedPage({ params }: PageProps<"/[locale]/[...slug]">) {
  const { locale, slug } = await params;
  const hit = resolve(locale, slug);
  if (!hit) notFound();

  const Page = PAGES[hit.key];
  return <Page locale={hit.locale} />;
}
