/**
 * Podepsané vstupenkové tokeny.
 *
 * Na statku je mizerný signál, takže brána (PWA na mobilu obsluhy) musí umět
 * vstupenku ověřit bez sítě. Token proto nese vše potřebné přímo v sobě
 * – id vstupenky, časovku a den – a je podepsaný HS256. Ověření je čistá
 * kryptografie, žádné volání serveru, žádné JWKS.
 *
 * Kompromis HS256: brána drží stejný klíč, kterým se podepisuje, takže by teoreticky
 * uměla vstupenky i vyrábět. Zařízení jsou naše a klíč se rotuje mezi sezónami;
 * kdyby se to změnilo (cizí brigádníci, BYOD), přepnout na EdDSA s veřejným
 * klíčem na bráně je záležitost výměny `signTicket`/`verifyTicket`.
 *
 * Token NENÍ jediná kontrola – `tickets.checked_in_at` v DB brání opakovanému
 * vstupu. Offline brána si sken zapíše lokálně a synchronizuje ho, až chytí signál.
 */
import { SignJWT, jwtVerify, errors as joseErrors } from 'jose';

export type TicketClaims = {
  /** UUID řádku v `tickets`. */
  ticketId: string;
  /** UUID časovky – obsluha podle něj pozná, jestli člověk nedorazil o dvě hodiny dřív. */
  slotId: string;
  /** Kalendářní den vstupu, YYYY-MM-DD. Čitelné i bez připojení k DB. */
  day: string;
};

export type VerifyResult =
  | { ok: true; claims: TicketClaims }
  | { ok: false; reason: 'neplatny_podpis' | 'expirovano' | 'poskozeny_token' };

const ISSUER = 'dynovysvet';
const AUDIENCE = 'brana';
/**
 * Tolerance hodin brány. Mobil obsluhy může být offline celý den a rozejít se
 * o desítky sekund; pár minut navíc nikoho nepustí dovnitř neprávem.
 */
const CLOCK_TOLERANCE = '5 minutes';
/** Vstupenka platí do konce dne návštěvy + rezerva na doprodej a reklamace. */
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 3;

let cachedSecret: Uint8Array | undefined;
let cachedSecretSource: string | undefined;

function getSecret(): Uint8Array {
  const raw = process.env.TICKET_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error('TICKET_SECRET musí být nastaven a mít alespoň 32 znaků.');
  }
  // Cache držíme podle hodnoty, ne natrvalo – v testech se proměnná přepisuje.
  if (cachedSecret && cachedSecretSource === raw) return cachedSecret;
  cachedSecret = new TextEncoder().encode(raw);
  cachedSecretSource = raw;
  return cachedSecret;
}

/**
 * Vytvoří token pro jednu vstupenku.
 *
 * Claimy zkracujeme na jednopísmenné – QR kód se skenuje z rozmoklého papíru
 * u brány za šera a každý znak navíc znamená hustší mřížku.
 */
export async function signTicket(claims: TicketClaims, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);

  return new SignJWT({ t: claims.ticketId, s: claims.slotId, d: claims.day })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(nowSec)
    .setExpirationTime(nowSec + ttlSeconds)
    .sign(getSecret());
}

/**
 * Ověří token. Volá se na bráně offline – uvnitř není žádné I/O.
 * Nikdy nevyhazuje na neplatném vstupu; padnout smí jen chybějící konfigurace.
 */
export async function verifyTicket(token: string): Promise<VerifyResult> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ['HS256'],
      clockTolerance: CLOCK_TOLERANCE,
    });

    const { t, s, d } = payload as Record<string, unknown>;
    if (typeof t !== 'string' || typeof s !== 'string' || typeof d !== 'string') {
      return { ok: false, reason: 'poskozeny_token' };
    }
    return { ok: true, claims: { ticketId: t, slotId: s, day: d } };
  } catch (err) {
    if (err instanceof joseErrors.JWTExpired) return { ok: false, reason: 'expirovano' };
    if (err instanceof joseErrors.JWSSignatureVerificationFailed) return { ok: false, reason: 'neplatny_podpis' };
    if (err instanceof joseErrors.JOSEError) return { ok: false, reason: 'poskozeny_token' };
    throw err;
  }
}
