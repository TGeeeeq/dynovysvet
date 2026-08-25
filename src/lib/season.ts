/**
 * Statek má tři sezóny, ne jednu. Web to ví a podle toho mění náladu:
 * co je v hero, jaká je akcentní barva, jestli se prodávají vstupenky.
 *
 * Termíny jsou tady jako výchozí hodnoty; jakmile je majitel přepíše
 * v administraci, přebíjí je záznam v databázi (`season_config`).
 */

export type SeasonKey = "dyne" | "les" | "trh" | "spanek";

export interface SeasonWindow {
  key: SeasonKey;
  /** Měsíc a den začátku, 1-indexovaný měsíc. */
  from: [month: number, day: number];
  to: [month: number, day: number];
}

/** Výchozí okna odvozená z provozu 2025/2026. */
export const DEFAULT_WINDOWS: SeasonWindow[] = [
  { key: "les", from: [4, 15], to: [6, 22] },
  { key: "trh", from: [6, 23], to: [6, 30] },
  { key: "dyne", from: [9, 20], to: [11, 2] },
];

export interface SeasonMood {
  key: SeasonKey;
  /** Krátký titulek stavu — jde do hlavičky i do OG popisku. */
  label: string;
  /** Akcentní barva pro tuto náladu (CSS proměnná z designového systému). */
  accent: "pumpkin" | "moss" | "wheat";
  /** Prodávají se v tomto období vstupenky online? */
  ticketsOpen: boolean;
}

export const MOODS: Record<SeasonKey, SeasonMood> = {
  dyne: {
    key: "dyne",
    label: "Dýňový svět je otevřený",
    accent: "pumpkin",
    ticketsOpen: true,
  },
  les: {
    key: "les",
    label: "Příroda hrou — lesní hřiště pro školy",
    accent: "moss",
    ticketsOpen: false,
  },
  trh: {
    key: "trh",
    label: "Dětský bleší trh na statku",
    accent: "wheat",
    ticketsOpen: true,
  },
  spanek: {
    key: "spanek",
    label: "Statek je zavřený — chystáme další sezónu",
    accent: "moss",
    ticketsOpen: false,
  },
};

function dayOfYearIndex(month: number, day: number): number {
  return month * 100 + day;
}

/** Vrátí klíč sezóny pro dané datum. */
export function seasonAt(
  date: Date,
  windows: SeasonWindow[] = DEFAULT_WINDOWS,
): SeasonKey {
  const now = dayOfYearIndex(date.getMonth() + 1, date.getDate());
  for (const w of windows) {
    const from = dayOfYearIndex(...w.from);
    const to = dayOfYearIndex(...w.to);
    // Okna zatím nepřetékají přes Nový rok; kdyby někdy ano, tahle
    // podmínka to pokryje.
    const inside = from <= to ? now >= from && now <= to : now >= from || now <= to;
    if (inside) return w.key;
  }
  return "spanek";
}

export function moodAt(date: Date, windows?: SeasonWindow[]): SeasonMood {
  return MOODS[seasonAt(date, windows)];
}

/**
 * Nejbližší budoucí start Dýňového světa. Používá se pro odpočet mimo sezónu —
 * ta stránka je jinak mrtvá, a přitom na ni chodí ~2 000 lidí měsíčně.
 */
export function nextPumpkinOpening(from: Date, windows: SeasonWindow[] = DEFAULT_WINDOWS): Date {
  const w = windows.find((x) => x.key === "dyne") ?? DEFAULT_WINDOWS[2];
  const [m, d] = w.from;
  const thisYear = new Date(Date.UTC(from.getUTCFullYear(), m - 1, d, 8, 0, 0));
  return thisYear > from
    ? thisYear
    : new Date(Date.UTC(from.getUTCFullYear() + 1, m - 1, d, 8, 0, 0));
}
