/**
 * Hashování hesel administrace.
 *
 * Proč scrypt z `node:crypto` a ne argon2/bcrypt: obojí je nativní addon, který
 * se na Vercelu musí kompilovat pro správný runtime, a kvůli čtyřem účtům
 * obsluhy to nestojí za závislost navíc. scrypt je v jádře Node, je paměťově
 * náročný (na rozdíl od PBKDF2) a při N=2^16 trvá ověření stovky milisekund –
 * což je přesně to, co po nás na přihlašovacím formuláři chceme.
 *
 * Formát uloženého hesla: `scrypt$N$r$p$<salt base64>$<hash base64>`.
 * Parametry nesou hesla sama, takže je můžeme kdykoli zvednout, aniž bychom
 * znehodnotili starší záznamy – `verifyPassword` si je přečte z řetězce.
 */
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/** Aktuální parametry. Zvednutím `N` se stará hesla nerozbijí, jen se při další změně přepočítají. */
const N = 2 ** 16;
const R = 8;
const P = 1;
const KEYLEN = 64;
const SALT_BYTES = 16;

/**
 * Node má výchozí `maxmem` 32 MB, což na N=2^16, r=8 nestačí (128*N*r ≈ 64 MB)
 * a scrypt by spadl. Dvojnásobek teoretické potřeby dává rezervu i pro případ,
 * že parametry v budoucnu povyrostou.
 */
function maxmemFor(n: number, r: number): number {
  return 128 * n * r * 2;
}

function scryptAsync(plain: string, salt: Buffer, n: number, r: number, p: number, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(plain.normalize('NFKC'), salt, keylen, { N: n, r, p, maxmem: maxmemFor(n, r) }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

/** Vrací řetězec pro sloupec `admin_users.password_hash`. Nikam jinam nepatří. */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await scryptAsync(plain, salt, N, R, P, KEYLEN);
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

type ParsedHash = { n: number; r: number; p: number; salt: Buffer; key: Buffer };

/** `null` znamená „tomuhle řetězci nerozumím" – volající to musí brát jako neúspěch, ne jako chybu. */
function parseStored(stored: string): ParsedHash | null {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return null;

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return null;
  // Strop na parametrech je ochrana proti DoS: podvržený hash s N=2^30 by nám
  // sežral paměť instance dřív, než by stihl odpovědět.
  if (n < 2 ** 12 || n > 2 ** 20 || r < 1 || r > 32 || p < 1 || p > 16) return null;

  const salt = Buffer.from(parts[4] ?? '', 'base64');
  const key = Buffer.from(parts[5] ?? '', 'base64');
  if (salt.length < 8) return null;
  // Kratší klíč než `KEYLEN` odmítáme, i když je jinak validní. scrypt s menším
  // `keylen` vrací PREFIX delšího výstupu, takže ořezaný hash by se ověřil proti
  // správnému heslu – a útočník s právem zápisu do DB by si tím zkrátil práci.
  // Delší klíč pustíme: zvednutí `KEYLEN` do budoucna nesmí znehodnotit hesla.
  if (key.length < KEYLEN) return null;

  return { n, r, p, salt, key };
}

/**
 * Ověří heslo proti uloženému řetězci.
 *
 * Na jakoukoli chybu vrací `false` a nikdy nevyhazuje – přihlašovací endpoint
 * nesmí rozlišovat „špatné heslo" od „poškozený záznam v DB", jinak z chybové
 * hlášky vyčteme stav účtu. Ze stejného důvodu se porovnává `timingSafeEqual`.
 */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parsed = parseStored(stored);
  if (!parsed) {
    // Poškozený nebo cizí formát: stejně spálíme čas, ať se z délky odpovědi
    // nedá poznat, že účet vůbec nemá použitelný hash.
    await dummyVerify();
    return false;
  }

  try {
    const candidate = await scryptAsync(plain, parsed.salt, parsed.n, parsed.r, parsed.p, parsed.key.length);
    if (candidate.length !== parsed.key.length) return false;
    return timingSafeEqual(candidate, parsed.key);
  } catch {
    return false;
  }
}

/**
 * Spálí srovnatelný čas jako `verifyPassword` nad skutečným hashem.
 *
 * Volá se, když uživatel s daným e-mailem neexistuje nebo je zamčený. Bez toho
 * je z doby odpovědi (jednotky ms vs. stovky ms) poznat, které e-maily mají
 * v administraci účet – a to je přesně ten seznam, který útočník potřebuje.
 */
export async function dummyVerify(): Promise<void> {
  try {
    await scryptAsync('dummy-heslo-bez-uctu', DUMMY_SALT, N, R, P, KEYLEN);
  } catch {
    // I kdyby scrypt selhal (limit paměti), nesmí to shodit přihlašovací akci.
  }
}

/** Konstantní sůl – hash nikam neukládáme, jde jen o spotřebovaný čas. */
const DUMMY_SALT = Buffer.alloc(SALT_BYTES, 7);

/* --------------------------------------------------------------- politika */

export const PASSWORD_POLICY = {
  minLength: 12,
  /**
   * Ne úplný slovník, jen to, co v praxi zadá člověk, kterému někdo řekne
   * „vymysli si heslo". Skutečnou ochranu dělá délka a rate limit; tenhle
   * seznam jen chytí nejtrapnější případy dřív, než se uloží.
   */
  blocklist: [
    'heslo',
    'heslo123',
    'heslo1234',
    'tajneheslo',
    'password',
    'password1',
    'password123',
    'passw0rd',
    'qwertyuiop',
    'querty123',
    'asdfghjkl',
    'yxcvbnm',
    'zxcvbnm',
    '123456',
    '1234567',
    '12345678',
    '123456789',
    '1234567890',
    'admin',
    'admin123',
    'administrator',
    'letmein',
    'welcome',
    'iloveyou',
    'monkey',
    'dragon',
    'sunshine',
    'football',
    'baseball',
    'slunicko',
    'miluji',
    'pepa',
    'honzik',
    'lucie',
    'praha',
    'ceskarepublika',
    'statek',
    'dyne',
    'dynovysvet',
    'pipek',
    'pipkovi',
  ],
} as const;

export type PasswordCheck = { ok: boolean; problem?: string };

/**
 * Kontrola síly hesla při zakládání účtu a změně hesla.
 *
 * Hlášky jsou české a konkrétní schválně – tady o žádný únik informací nejde,
 * uživatel své vlastní heslo zná. Generické zůstávají jen hlášky u přihlášení.
 */
export function checkPasswordStrength(plain: string): PasswordCheck {
  const value = plain.normalize('NFKC');

  if (value.length === 0) return { ok: false, problem: 'Zadejte heslo.' };
  if (value.trim().length !== value.length) {
    return { ok: false, problem: 'Heslo nesmí začínat ani končit mezerou.' };
  }
  if (value.length < PASSWORD_POLICY.minLength) {
    return { ok: false, problem: `Heslo musí mít alespoň ${PASSWORD_POLICY.minLength} znaků.` };
  }
  // Rozumný strop – scrypt nad megabajtovým vstupem je zbytečná zátěž.
  if (value.length > 200) {
    return { ok: false, problem: 'Heslo je příliš dlouhé, maximum je 200 znaků.' };
  }

  const normalized = stripDiacritics(value.toLowerCase());
  for (const bad of PASSWORD_POLICY.blocklist) {
    // `includes`, ne rovnost: „dynovysvet2025" je pořád špatné heslo.
    if (normalized.includes(bad)) {
      return { ok: false, problem: 'Heslo obsahuje příliš častý nebo uhodnutelný výraz. Zvolte jiné.' };
    }
  }

  if (/^(.)\1*$/.test(value)) {
    return { ok: false, problem: 'Heslo nesmí být jeden opakovaný znak.' };
  }
  // Aspoň dvě různé kategorie znaků. Nevymáháme velká písmena ani symboly –
  // dlouhá česká věta je lepší heslo než „Ab1!xy".
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(value)).length;
  if (classes < 2) {
    return { ok: false, problem: 'Kombinujte alespoň dva druhy znaků (písmena, číslice nebo interpunkci).' };
  }

  return { ok: true };
}

/** Bez diakritiky se „Dýňovýsvět" v blocklistu chytne stejně jako „dynovysvet". */
function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}
