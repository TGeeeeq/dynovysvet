/**
 * Zámek celého veřejného webu.
 *
 * Dokud statek nespustí prodej, nemá web vidět kdokoli, kdo trefí adresu —
 * ale majitel ho musí umět ukázat rodině, škole nebo tisku. Proto jedno
 * společné heslo pro všechny zvané, ne účty: účet by znamenal správu lidí,
 * kteří tu budou týden.
 *
 * Zapíná se **výhradně** proměnnou `SITE_PASSWORD`. Prázdná nebo chybějící
 * znamená otevřený web — to je stav po spuštění a nesmí jít nastavit omylem
 * (například tím, že se zapomene proměnná odebrat, se web zamkne, ne odemkne).
 *
 * Cookie nese podepsaný token, ne heslo. Klíč se odvozuje z hesla samotného
 * (SHA-256), takže **změna hesla okamžitě odhlásí všechny** — přesně to, co
 * po zámku „už to viděl, kdo neměl" chceme. Žádná další proměnná k nastavení.
 *
 * Vědomé hranice: `/foto` a další statická aktiva zámek neřeší (jsou mimo
 * matcher v `src/proxy.ts`), aby fotky mohly ležet v CDN cache. Kdo uhodne
 * přesnou adresu obrázku, na něj dosáhne — na skryté *stránky* ne. Zámek je
 * proti náhodnému návštěvníkovi a proti indexaci, ne proti útočníkovi.
 */
import { SignJWT, jwtVerify } from 'jose';

/** Cookie se zvaným návštěvníkem. Jméno se nesmí krýt s `ds_admin`. */
export const GATE_COOKIE = 'ds_vstup';

/** Stránka s formulářem. Musí zůstat mimo jazykový router (viz `routes.ts`). */
export const GATE_PATH = '/vstup';

/** Parametr s adresou, kam měl návštěvník původně namířeno. */
export const RETURN_PARAM = 'dal';

const ISSUER = 'dynovysvet';
const AUDIENCE = 'zamek';

/**
 * Měsíc. Zámek není autorizace — chrání nespuštěný web, ne peníze — a nutit
 * majitele zadávat heslo na každém zařízení každý den by skončilo tím, že se
 * heslo napíše do e-mailu všem.
 */
export const GATE_TTL_SECONDS = 30 * 24 * 60 * 60;

/* ------------------------------------------------------------------ heslo */

/** Nastavené heslo, nebo `null`, když je web otevřený. */
export function sitePassword(): string | null {
  const value = process.env.SITE_PASSWORD?.trim();
  return value ? value : null;
}

/** Je web zamčený? */
export function isGateEnabled(): boolean {
  return sitePassword() !== null;
}

async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return new Uint8Array(digest);
}

/**
 * Porovnání hesla v konstantním čase.
 *
 * Porovnávají se otisky, ne řetězce: obojí má pak 32 bajtů, takže z doby
 * odpovědi nejde vyčíst ani délka správného hesla, natož jeho začátek.
 */
export async function passwordMatches(candidate: string): Promise<boolean> {
  const expected = sitePassword();
  if (expected === null) return false;

  const [a, b] = await Promise.all([
    sha256(candidate.normalize('NFKC')),
    sha256(expected.normalize('NFKC')),
  ]);

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/* ------------------------------------------------------------------ token */

let cachedKey: Uint8Array | undefined;
let cachedKeyFor: string | undefined;

/** Podpisový klíč odvozený z hesla. Cache podle hodnoty — v testech se mění. */
async function gateKey(password: string): Promise<Uint8Array> {
  if (cachedKey && cachedKeyFor === password) return cachedKey;
  cachedKey = await sha256(password);
  cachedKeyFor = password;
  return cachedKey;
}

/** Token do cookie. Volat až po ověření hesla. */
export async function issueGateToken(): Promise<string> {
  const password = sitePassword();
  if (password === null) throw new Error('SITE_PASSWORD není nastaveno, zámek nemá co podepsat.');

  const nowSec = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(nowSec)
    .setExpirationTime(nowSec + GATE_TTL_SECONDS)
    .sign(await gateKey(password));
}

/**
 * Platí token z cookie? Nikdy nevyhazuje — poškozená cookie je prostě
 * „nepřihlášen", ne chyba serveru.
 */
export async function hasValidGateToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const password = sitePassword();
  if (password === null) return false;

  try {
    await jwtVerify(token, await gateKey(password), { issuer: ISSUER, audience: AUDIENCE });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ cesty */

/**
 * Co projde i se zamčeným webem.
 *
 * - `/vstup` — jinak by se formulář přesměrovával sám na sebe.
 * - `/admin` — má vlastní přihlášení; dva zámky za sebou majiteli nepomůžou.
 * - `/api/cron/…` — volá Vercel bez cookie, chrání ho `CRON_SECRET`.
 * - `/robots.txt` — prohledávač se musí dozvědět, že tu nemá co dělat.
 */
export function isGateExempt(pathname: string): boolean {
  return (
    pathname === GATE_PATH ||
    pathname.startsWith(`${GATE_PATH}/`) ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/cron/') ||
    pathname === '/robots.txt'
  );
}

/**
 * Adresa, kam po odemčení. Bere se z URL, takže je to vstup od návštěvníka:
 * pustit dál smíme jen cestu na vlastní web, nikdy `//zlo.cz` ani `javascript:`.
 */
export function safeReturnPath(raw: string | null | undefined): string {
  if (!raw) return '/';
  // Jen absolutní cesta na tomhle webu. `//` je protokolově relativní adresa
  // na cizí doménu, `/\` na ni některé prohlížeče přeloží taky.
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '/';
  // Zpátky na formulář by byla smyčka.
  if (raw === GATE_PATH || raw.startsWith(`${GATE_PATH}?`) || raw.startsWith(`${GATE_PATH}/`)) return '/';
  return raw;
}
