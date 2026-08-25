import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { isReservedPath } from "@/lib/i18n/routes";

/**
 * Dvě věci naráz, obě levné.
 *
 * 1. **Jazyk do cesty.** Čeština běží na kořeni (`/vstupenky`), zatímco
 *    aplikace uvnitř má jednotný tvar `/[locale]/…`. Middleware ten rozdíl
 *    přepisem zahladí, takže české adresy zůstávají přesně takové, jaké byly
 *    na Webnode, a v kódu přesto existuje jen jedna sada stránek.
 *    Přepis, ne přesměrování — návštěvník ani Google žádný skok neuvidí.
 *
 * 2. **Nonce pro administraci.** Veřejné stránky jsou statické, a nonce by je
 *    donutil generovat se na každý požadavek — přesně to, co si při náporu
 *    v den otevření registrací nemůžeme dovolit. Ty proto dostávají přísné
 *    CSP bez nonce (viz next.config.ts). Administrace je dynamická tak jako
 *    tak, takže tam nonce nic nestojí a CSP může být ostré.
 */

export const config = {
  // Statická aktiva, obrázky a servisní soubory nechceme řešit — jen stránky.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|foto/|.*\\.[\\w]+$).*)"],
};

const LOCALE_PREFIXES = LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((l) => `/${l}`);

function adminCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const nonce = crypto.randomUUID().replaceAll("-", "");
    const headers = new Headers(req.headers);
    headers.set("x-nonce", nonce);
    const res = NextResponse.next({ request: { headers } });
    res.headers.set("Content-Security-Policy", adminCsp(nonce));
    // Administrace nesmí skončit v cizí cache ani v historii prohlížeče.
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  if (isReservedPath(pathname)) return NextResponse.next();

  // `/en/…` a `/de/…` už mají tvar, který router čeká.
  if (LOCALE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}
