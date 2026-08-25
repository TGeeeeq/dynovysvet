import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/design/fonts";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VineSpine } from "@/components/illustrations/Vine";
import { FarmJsonLd } from "@/components/site/StructuredData";
import { FARM } from "@/content/farm";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dynovysvet.cz"),
  title: {
    default: "Dýňový svět — Statek u Pipků na Vysočině",
    template: "%s — Statek u Pipků",
  },
  description:
    "Výstava dýní, slámohrad a slámobazén, zvířata a přírodní hřiště na statku v Nové Vsi u Leštiny. Vstupenky na konkrétní čas koupíte online.",
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: FARM.name,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f4ebdc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${fontVariables} h-full antialiased`}>
      <body className="grain relative flex min-h-full flex-col overflow-x-clip">
        {/* Úponek běží celou stránkou jako svislá páteř — ale jen tam, kde je
            vedle obsahu skutečně volný okraj. Přes text by to byla čmára.
            `left` ho zarovná těsně vlevo od kontejneru o šířce 88rem. */}
        <VineSpine className="pointer-events-none absolute top-44 hidden w-20 left-[max(0.25rem,calc(50%-49rem))] min-[1560px]:block" />
        <FarmJsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
