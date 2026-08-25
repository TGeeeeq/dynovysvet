/**
 * SPAYD – český "short payment descriptor" pro QR platbu.
 *
 * Používáme na místě u pokladny (doplatek, prodej dýní) a na fakturách: zákazník
 * naskenuje QR bankovní appkou a má předvyplněný příkaz. Norma je ČBA SPAYD 1.0.
 *
 * Prodejce: Josef Pipek, IČ 45904472, plátce DPH, účet 2667118524/0600.
 */
import { qrSvg, type QrOptions } from '@/lib/tickets/qr';
import { SELLER } from '@/lib/db/schema';

/* ------------------------------------------------------------------- IBAN */

const CZ_COUNTRY_DIGITS = '1235'; // C=12, Z=35 podle ISO 13616

/** Váhy modulo-11 kontroly českého čísla účtu (ČNB). */
const PREFIX_WEIGHTS = [10, 5, 8, 4, 2, 1];
const ACCOUNT_WEIGHTS = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1];

export type CzAccount = { prefix: string; account: string; bank: string };

/** Rozloží `[předčíslí-]číslo/kód banky` na normalizované části. */
export function parseCzAccount(input: string): CzAccount {
  const cleaned = input.replace(/\s/g, '');
  const m = /^(?:(\d{1,6})-)?(\d{1,10})\/(\d{4})$/.exec(cleaned);
  if (!m) {
    throw new Error(`Neplatné číslo účtu: "${input}". Očekávám formát [předčíslí-]číslo/kód banky.`);
  }
  return { prefix: (m[1] ?? '').padStart(6, '0'), account: m[2]!.padStart(10, '0'), bank: m[3]! };
}

function mod11Ok(digits: string, weights: number[]): boolean {
  // Váhy se přikládají zprava, proto čteme obě pole od konce.
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[digits.length - 1 - i]);
    sum += d * (weights[weights.length - 1 - i] ?? 0);
  }
  return sum % 11 === 0;
}

/**
 * Kontrola samotného čísla účtu (modulo 11). Chytí překlep dřív, než vyrobíme
 * formálně platný IBAN mířící nikam – IBAN check digits totiž ověřují jen sebe.
 */
export function isValidCzAccount(input: string): boolean {
  try {
    const { prefix, account } = parseCzAccount(input);
    return mod11Ok(prefix, PREFIX_WEIGHTS) && mod11Ok(account, ACCOUNT_WEIGHTS);
  } catch {
    return false;
  }
}

/**
 * Převede české číslo účtu na IBAN.
 *
 * CZ BBAN má pevných 20 znaků: 4 číslice kód banky + 6 předčíslí + 10 číslo účtu,
 * všechno doleva vynulované. Kontrolní číslice: BBAN + "CZ" + "00" přepsané na
 * číslice, mod 97, a 98 − zbytek.
 *
 * `2667118524/0600` ⇒ `CZ2106000000002667118524`.
 */
export function czAccountToIban(input: string): string {
  const { prefix, account, bank } = parseCzAccount(input);
  const bban = `${bank}${prefix}${account}`;

  // Mod 97 počítáme po číslicích – 24místné číslo se do Number nevejde přesně.
  let rem = 0;
  for (const ch of `${bban}${CZ_COUNTRY_DIGITS}00`) {
    rem = (rem * 10 + Number(ch)) % 97;
  }

  return `CZ${String(98 - rem).padStart(2, '0')}${bban}`;
}

/** IBAN statku – počítá se z čísla účtu, aby existoval jen jeden zdroj pravdy. */
export const SELLER_IBAN = czAccountToIban(SELLER.bankAccount);

/* ------------------------------------------------------------------ SPAYD */

export type SpaydOptions = {
  /** Částka v Kč. Do řetězce jde vždy na dvě desetinná místa. */
  amountCzk: number;
  /** Variabilní symbol – u nás číslo objednávky bez písmen, max 10 číslic. */
  variableSymbol?: string;
  /** Zpráva pro příjemce, max 60 znaků, bez diakritiky a bez `*`. */
  message?: string;
  /** Jméno příjemce (RN), max 35 znaků. */
  recipientName?: string;
  iban?: string;
};

/**
 * SPAYD je hvězdičkami oddělený formát bez escapování – hodnota, která obsahuje
 * `*`, by rozbila parser v bankovní aplikaci. Zároveň jde o ASCII formát, takže
 * diakritiku rozkládáme a zahazujeme, než ji banka nahradí otazníky.
 */
function sanitize(value: string, maxLength: number): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Typografické pomlčky a uvozovky nejsou ASCII; bez převodu by ze zprávy
    // beze stopy zmizely a zůstalo by "Dynovy svet  objednavka 42".
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
    .replace(/[\u201c\u201d\u201e\u201f]/g, '"')
    .replace(/[\u00a0\u2000-\u200a\u202f\u205f]/g, ' ')
    .replace(/[*\r\n]/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function formatAmount(amountCzk: number): string {
  if (!Number.isFinite(amountCzk) || amountCzk < 0) {
    throw new RangeError(`Neplatná částka: ${amountCzk}`);
  }
  return amountCzk.toFixed(2);
}

/**
 * Sestaví SPAYD řetězec:
 * `SPD*1.0*ACC:<IBAN>*AM:<částka>*CC:CZK*X-VS:<VS>*MSG:<zpráva>`
 *
 * Pořadí polí držíme podle normy (ACC musí být první); volitelná pole,
 * která nedostaneme, vynecháváme úplně – prázdná hodnota některé appky mate.
 */
export function spaydString(options: SpaydOptions): string {
  const parts = ['SPD', '1.0', `ACC:${options.iban ?? SELLER_IBAN}`, `AM:${formatAmount(options.amountCzk)}`, 'CC:CZK'];

  if (options.recipientName) parts.push(`RN:${sanitize(options.recipientName, 35)}`);

  if (options.variableSymbol) {
    const vs = options.variableSymbol.replace(/\D/g, '').slice(-10);
    if (vs) parts.push(`X-VS:${vs}`);
  }

  if (options.message) parts.push(`MSG:${sanitize(options.message, 60)}`);

  return parts.join('*');
}

/** SPAYD rovnou jako SVG QR – stejný renderer jako u vstupenek. */
export async function spaydQrSvg(options: SpaydOptions, qrOptions: QrOptions = {}): Promise<string> {
  // 'M' korekce stačí; SPAYD je krátký a QR zůstává řídké i na účtence.
  return qrSvg(spaydString(options), qrOptions);
}
