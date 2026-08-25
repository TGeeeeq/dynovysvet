import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { fontVariables } from "@/lib/design/fonts";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VineSpine } from "@/components/illustrations/Vine";
import { FarmJsonLd } from "@/components/site/StructuredData";
import { FARM } from "@/content/farm";
import { SEO } from "@/content/seo";
import { HTML_LANG, LOCALES, OG_LOCALE, isLocale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/dict";
import "../../globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#f4ebdc",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const seo = SEO.home[locale];

  return {
    metadataBase: new URL("https://www.dynovysvet.cz"),
    title: {
      default: seo.title,
      template: `%s — ${FARM.name}`,
    },
    description: seo.description,
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      siteName: FARM.name,
    },
    // Prohledávače nesmí považovat tři mutace za tři konkurenční kopie téhož.
    // Konkrétní `alternates` pro každou stránku doplňuje sama stránka.
    formatDetection: { telephone: false },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = makeT(locale);

  return (
    <html lang={HTML_LANG[locale]} className={`${fontVariables} h-full antialiased`}>
      <body className="grain relative flex min-h-full flex-col overflow-x-clip">
        <a
          href="#obsah"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2 focus:text-paper"
        >
          {t("skipToContent")}
        </a>
        {/* Úponek běží celou stránkou jako svislá páteř — ale jen tam, kde je
            vedle obsahu skutečně volný okraj. Přes text by to byla čmára.
            `left` ho zarovná těsně vlevo od kontejneru o šířce 88rem. */}
        <VineSpine className="pointer-events-none absolute top-44 hidden w-20 left-[max(0.25rem,calc(50%-49rem))] min-[1560px]:block" />
        <FarmJsonLd locale={locale} />
        <Header locale={locale} />
        <main id="obsah" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
