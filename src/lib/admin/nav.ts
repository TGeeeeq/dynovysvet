/**
 * Rozcestník administrace. Skupiny odpovídají tomu, jak o webu přemýšlí
 * majitel, ne tomu, jak je poskládaná databáze: „Prodej" je všechno kolem
 * peněz, „Provoz" všechno kolem otevírací doby, „Obsah" všechno, co je
 * na webu vidět.
 */
export interface AdminLink {
  href: string;
  label: string;
  hint: string;
  /** Jen pro majitele — obsluha u brány tohle vidět nemá. */
  ownerOnly?: boolean;
}

export interface AdminGroup {
  title: string;
  links: AdminLink[];
}

export const ADMIN_NAV: AdminGroup[] = [
  {
    title: "Prodej",
    links: [
      { href: "/admin/objednavky", label: "Objednávky", hint: "Kdo co koupil, storna a vrácení peněz." },
      { href: "/admin/cenik", label: "Ceník vstupného", hint: "Ceny a druhy vstupenek." },
      { href: "/admin/poptavky", label: "Poptávky", hint: "Školy, pronájem statku, bleší trh." },
    ],
  },
  {
    title: "Provoz",
    links: [
      { href: "/admin/sezona", label: "Sezóna a otevírací doba", hint: "Termíny, hodiny a kapacita." },
      { href: "/admin/nastaveni", label: "Nastavení prodeje", hint: "Zapnout či vypnout prodej, délka rezervace." },
    ],
  },
  {
    title: "Obsah webu",
    links: [
      { href: "/admin/texty", label: "Texty stránek", hint: "Všechno, co je na webu napsané — česky, anglicky, německy." },
      { href: "/admin/aktuality", label: "Aktuality", hint: "Krátké novinky na titulní stranu." },
    ],
  },
  {
    title: "Účet",
    links: [
      { href: "/admin/ucet", label: "Moje heslo a přihlášení", hint: "Změna hesla, odhlášení ze všech zařízení." },
      { href: "/admin/uzivatele", label: "Kdo má přístup", hint: "Lidé, kteří se smí přihlásit.", ownerOnly: true },
      { href: "/admin/zaznamy", label: "Záznam změn", hint: "Kdo co kdy změnil.", ownerOnly: true },
    ],
  },
];

export const ALL_ADMIN_LINKS = ADMIN_NAV.flatMap((g) => g.links);
