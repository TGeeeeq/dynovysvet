import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/design/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Zatím jen pro zvané",
  // Zámek nepatří do vyhledávačů — ani jako jediná indexovaná stránka webu.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#f4ebdc",
};

/**
 * Kořenový layout zámku.
 *
 * Vlastní, a ne sdílený s webem: stránka s heslem nesmí mít hlavičku ani
 * patičku, protože v nich jsou odkazy na obsah, který návštěvník ještě
 * nemá vidět, a jazykový přepínač na stránku, která jazyk neřeší.
 */
export default function GateRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${fontVariables} h-full antialiased`}>
      <body className="grain min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
