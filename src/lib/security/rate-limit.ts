/**
 * Jednoduchý in-memory limiter pro veřejné formuláře (poptávka, newsletter).
 *
 * POCTIVĚ: na serverless je tohle jen best-effort per-instance. Každá instance
 * má vlastní mapu, instance se recyklují a Vercel jich pod zátěží roztočí víc –
 * odhodlaný útočník limit obejde tím, že prostě pošle požadavky paralelně.
 * Bere se to jako ochrana proti opakovanému kliknutí a hloupým botům, nic víc.
 *
 * Kde jde o bezpečnost (přihlášení do administrace), počítáme v databázi –
 * viz `src/lib/admin/rate-limit.ts`.
 */

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

/** Nad tímhle počtem klíčů mapu protřídíme, ať neroste bez omezení. */
const MAX_KEYS = 5_000;

export type RateLimitResult = {
  allowed: boolean;
  /** Kolik požadavků v okně ještě zbývá. */
  remaining: number;
  /** Za kolik sekund se uvolní další pokus. Nula, když je povoleno. */
  retryAfterSeconds: number;
};

/**
 * Klouzavé okno: držíme časy jednotlivých zásahů a při každém dotazu zahodíme
 * ty, které z okna vypadly. Pevné okno („na každou čtvrthodinu 5") by pustilo
 * dvojnásobek požadavků na přelomu, klouzavé ne. Pro desítky zásahů na klíč je
 * pole časů levnější než cokoli chytřejšího.
 *
 * @param key    Co se limituje – typicky `"poptavka:" + ip`.
 * @param limit  Kolik zásahů se do okna vejde.
 * @param windowSeconds Délka okna v sekundách.
 */
export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  if (limit < 1 || windowSeconds < 1) {
    throw new RangeError('Limit i délka okna musí být kladné.');
  }

  const nowMs = Date.now();
  const windowStart = nowMs - windowSeconds * 1000;

  if (buckets.size > MAX_KEYS) sweep(windowStart);

  const bucket = buckets.get(key) ?? { hits: [] };
  const hits = bucket.hits.filter((t) => t > windowStart);

  if (hits.length >= limit) {
    bucket.hits = hits;
    buckets.set(key, bucket);
    const oldest = hits[0] ?? nowMs;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowSeconds * 1000 - nowMs) / 1000)),
    };
  }

  hits.push(nowMs);
  bucket.hits = hits;
  buckets.set(key, bucket);

  return { allowed: true, remaining: limit - hits.length, retryAfterSeconds: 0 };
}

/** Ruční reset – používají testy a administrace („odblokuj mi formulář"). */
export function resetRateLimit(key?: string): void {
  if (key === undefined) buckets.clear();
  else buckets.delete(key);
}

/** Vyhodí klíče, které v okně nemají jediný zásah. */
function sweep(windowStart: number): void {
  for (const [key, bucket] of buckets) {
    const alive = bucket.hits.filter((t) => t > windowStart);
    if (alive.length === 0) buckets.delete(key);
    else bucket.hits = alive;
  }
}
