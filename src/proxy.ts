import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { isReservedPath } from "@/lib/i18n/routes";
import {
  GATE_COOKIE,
  GATE_PATH,
  RETURN_PARAM,
  hasValidGateToken,
  isGateEnabled,
  isGateExempt,
} from "@/lib/security/site-gate";

/**
 * Tři věci naráz, všechny levné.
 *
 * 0. **Zámek nespuštěného webu.** Dokud je nastavené `SITE_PASSWORD`, pustí
 *    dál jen návštěvníka s cookie od `/vstup`. Musí to být tady, ne
 *    v layoutu: veřejné stránky jsou statické a vykreslené předem, takže
 *    kontrola uvnitř Reactu by přišla až po tom, co je Vercel vydá z cache.
 *    Zámek je proti náhodnému návštěvníkovi a proti indexaci — viz
 *    `src/lib/security/site-gate.ts`.
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

// Včetně `/cs`: většinu českých adres sice srovná přesměrování v next.config
// dřív, než se sem požadavek dostane, ale výjimky (náhledový obrázek, který
// Next generuje na `/cs/opengraph-image-<hash>`) přijdou už v tomhle tvaru
// a druhý prefix by z nich udělal `/cs/cs/…`.
const LOCALE_PREFIXES = LOCALES.map((l) => `/${l}`);

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

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const nonce = crypto.randomUUID().replaceAll("-", "");
    const csp = adminCsp(nonce);
    const headers = new Headers(req.headers);
    headers.set("x-nonce", nonce);
    // Next hledá nonce v CSP na *požadavku* a sám ho doplní do skriptů,
    // které generuje. Bez toho by přísné `script-src` shodilo hydrataci.
    headers.set("Content-Security-Policy", csp);
    const res = NextResponse.next({ request: { headers } });
    res.headers.set("Content-Security-Policy", csp);
    // Administrace nesmí skončit v cizí cache ani v historii prohlížeče.
    res.headers.set("Cache-Control", "no-store, max-age=0");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  const locked = await gateCheck(req);
  if (locked) return locked;

  if (isReservedPath(pathname)) return NextResponse.next();

  // `/en/…` a `/de/…` už mají tvar, který router čeká.
  if (LOCALE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

/**
 * Odpověď pro zamčený web, nebo `null`, když se má pokračovat dál.
 *
 * Stránky končí přesměrováním na `/vstup` (a ne přepisem), aby bylo
 * návštěvníkovi z adresy jasné, kde je, a aby se mu původní adresa dala
 * vrátit po odemčení. API vrací 401 — přesměrovaný `fetch` by v prohlížeči
 * skončil nesrozumitelnou chybou při parsování HTML.
 */
async function gateCheck(req: NextRequest): Promise<NextResponse | null> {
  if (!isGateEnabled()) return null;

  const { pathname, search } = req.nextUrl;
  if (isGateExempt(pathname)) return null;
  if (await hasValidGateToken(req.cookies.get(GATE_COOKIE)?.value)) return null;

  if (pathname.startsWith("/api/")) {
    const res = NextResponse.json(
      { error: "Web je zatím jen pro zvané." },
      { status: 401 },
    );
    res.headers.set("Cache-Control", "no-store, max-age=0");
    return res;
  }

  const url = req.nextUrl.clone();
  url.pathname = GATE_PATH;
  url.search = "";
  if (pathname !== "/") url.searchParams.set(RETURN_PARAM, `${pathname}${search}`);

  const res = NextResponse.redirect(url);
  // Přesměrování na zámek se nesmí zacachovat — po odemčení by drželo dál.
  res.headers.set("Cache-Control", "no-store, max-age=0");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
