import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";

/**
 * Všechna tři písma musí umět českou diakritiku (ě š č ř ž ý á í é ú ů ď ť ň),
 * proto `latin-ext`. Ověřeno proti Google Fonts CSS API — všechna tři
 * `latin-ext` subset mají.
 */

/** Display. Osy SOFT a WONK dávají tvarům organickou, mírně ručně řezanou povahu. */
export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  // Osy se dají zadat jen u variabilního řezu — proto tu nesmí být
  // výčet vah; Fraunces se načte jako variabilní font s plnou osou váhy.
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

/** Text a UI. Čistý grotesk, který nechá serif vyniknout. */
export const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/** Data. Ceny, kapacita, časy slotů, čísla vstupenek — tabulkové číslice. */
export const jetbrains = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const fontVariables = `${fraunces.variable} ${instrument.variable} ${jetbrains.variable}`;
