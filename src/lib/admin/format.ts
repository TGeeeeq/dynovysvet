/**
 * Formátování pro administraci. Vždy česky a vždy v pražském čase —
 * server běží v UTC, ale majitel počítá dny podle toho, co je za oknem.
 */

const CZK = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  maximumFractionDigits: 0,
});

const DATE = new Intl.DateTimeFormat("cs-CZ", {
  timeZone: "Europe/Prague",
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

const DATE_TIME = new Intl.DateTimeFormat("cs-CZ", {
  timeZone: "Europe/Prague",
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const WEEKDAY = new Intl.DateTimeFormat("cs-CZ", {
  timeZone: "Europe/Prague",
  weekday: "long",
});

const TIME = new Intl.DateTimeFormat("cs-CZ", {
  timeZone: "Europe/Prague",
  hour: "2-digit",
  minute: "2-digit",
});

export const czk = (v: number) => CZK.format(v);
export const date = (v: Date | string) => DATE.format(new Date(v));
export const dateTime = (v: Date | string) => DATE_TIME.format(new Date(v));
export const time = (v: Date | string) => TIME.format(new Date(v));
export const weekday = (v: Date | string) => WEEKDAY.format(new Date(v));

/** „pátek 26. 9. 2026" — jak by to majitel řekl nahlas. */
export function longDate(v: Date | string): string {
  return `${weekday(v)} ${date(v)}`;
}

/** Stav objednávky česky, aby v tabulce nebyly databázové kódy. */
export const ORDER_STATUS: Record<string, { label: string; tone: "neutral" | "ok" | "warn" | "bad" }> = {
  ceka_na_platbu: { label: "Čeká na platbu", tone: "warn" },
  zaplaceno: { label: "Zaplaceno", tone: "ok" },
  zruseno: { label: "Zrušeno", tone: "neutral" },
  expirovano: { label: "Vypršelo", tone: "neutral" },
  k_vraceni: { label: "K vrácení peněz", tone: "bad" },
};

export const INQUIRY_KIND: Record<string, string> = {
  skola: "Školy a skupiny",
  pronajem: "Pronájem statku",
  blesi_trh: "Bleší trh",
  obecny: "Obecný dotaz",
};
