import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Home } from "@/components/pages/Home";
import { SEO } from "@/content/seo";
import { isLocale } from "@/lib/i18n/config";
import { alternates } from "@/lib/i18n/routes";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const seo = SEO.home[locale];
  const alts = alternates("home");
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: alts[locale],
      languages: { ...alts, "x-default": alts.cs },
    },
  };
}

export default async function HomeRoute({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <Home locale={locale} />;
}
