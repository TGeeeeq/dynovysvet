import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/design/fonts";
import "../../globals.css";

export const metadata: Metadata = {
  title: { default: "Správa webu", template: "%s — Správa webu" },
  // Administrace nepatří do vyhledávačů ani do náhledů odkazů.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#f4ebdc",
};

/**
 * Vlastní kořenový layout administrace.
 *
 * Web má svůj v `(site)/[locale]/layout.tsx` — administrace je jednojazyčná
 * (česky, protože ji používá majitel) a nesmí sdílet ani hlavičku, ani
 * patičku, ani úponek. Dva kořenové layouty vedle sebe jsou přesně to,
 * na co jsou route groups.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
