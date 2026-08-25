import type { Locale } from "@/lib/i18n/config";

/**
 * Jediný zdroj pravdy o statku. Texty pocházejí ze starého webu — mluví
 * hlasem majitelů a ten se držíme, jen se přesázel. Konkrétnost (jména
 * zvířat, vlaková zastávka, kombajn) je to, co web odlišuje od šablony.
 */

export const FARM = {
  name: "Statek u Pipků",
  event: "Dýňový svět",
  owner: "Josef Pipek",
  ico: "45904472",
  icoSpolek: "23325879",
  spolek: "Statek u Pipků – Příroda hrou, z.s.",
  street: "Nová Ves u Leštiny 5",
  zip: "582 82",
  phone: "+420 776 815 332",
  phoneHuman: "776 815 332",
  email: "pipkovinovaves@seznam.cz",
  facebook: "https://www.facebook.com/dynovysvet",
  bankAccount: "2667118524/0600",
  gps: { lat: 49.786227, lng: 15.4042246 },
  gpsParking: { lat: 49.7872403, lng: 15.4046482 },
} as const;

/**
 * Zvířata mají jména a to je půlka kouzla toho místa. Jména se nepřekládají
 * ani v cizojazyčné mutaci — Žofka se nejmenuje Sophie.
 */
const ANIMALS_ALL = [
  {
    name: "Black",
    kind: { cs: "kůň", en: "horse", de: "Pferd" },
    note: { cs: "Starší z dvojice koní.", en: "The older of the two horses.", de: "Das ältere der beiden Pferde." },
  },
  {
    name: "Natin",
    kind: { cs: "kůň", en: "horse", de: "Pferd" },
    note: {
      cs: "Chodí vždycky kousek za Blackem.",
      en: "Always walks a few steps behind Black.",
      de: "Läuft immer ein Stück hinter Black her.",
    },
  },
  {
    name: "Princezna",
    kind: { cs: "poník", en: "pony", de: "Pony" },
    note: {
      cs: "Nejmenší, a ví o tom.",
      en: "The smallest one, and she knows it.",
      de: "Die Kleinste — und sie weiß es.",
    },
  },
  {
    name: "Žofka",
    kind: { cs: "telátko", en: "calf", de: "Kalb" },
    note: { cs: "Bydlí ve stodole.", en: "She lives in the barn.", de: "Sie wohnt in der Scheune." },
  },
  {
    name: "Kirbinka",
    kind: { cs: "pes", en: "dog", de: "Hund" },
    note: {
      cs: "Canisterapeutka. Umí být hodně trpělivá.",
      en: "A therapy dog. Endlessly patient.",
      de: "Therapiehündin. Unendlich geduldig.",
    },
  },
  {
    name: "Šumavanky",
    kind: { cs: "slepičky", en: "hens", de: "Hühner" },
    note: {
      cs: "Pobíhají po zahradě.",
      en: "They roam the garden.",
      de: "Sie laufen frei durch den Garten.",
    },
  },
  {
    name: "kozičky",
    kind: { cs: "zakrslé kozy", en: "dwarf goats", de: "Zwergziegen" },
    note: {
      cs: "Berou si granule přímo z ruky.",
      en: "They take pellets straight from your hand.",
      de: "Sie fressen die Pellets direkt aus der Hand.",
    },
  },
  {
    name: "ovečky",
    kind: { cs: "ovce", en: "sheep", de: "Schafe" },
    note: { cs: "", en: "", de: "" },
  },
  {
    name: "prasátka",
    kind: { cs: "prasata", en: "pigs", de: "Schweine" },
    note: { cs: "", en: "", de: "" },
  },
  {
    name: "králíci",
    kind: { cs: "velcí králíci", en: "giant rabbits", de: "Riesenkaninchen" },
    note: {
      cs: "Ve stodole vedle Žofky.",
      en: "In the barn, next to Žofka.",
      de: "In der Scheune, neben Žofka.",
    },
  },
] as const;

export function animalsFor(locale: Locale) {
  return ANIMALS_ALL.map((a) => ({ name: a.name, kind: a.kind[locale], note: a.note[locale] }));
}

/**
 * Co na statku je — z původního textu, jen rozdělené na položky
 * a doplněné o překlad. Jména zvířat i „slámohrad" zůstávají tím, čím jsou;
 * překládá se popis, ne charakter místa.
 */
const ATTRACTIONS_ALL = [
  {
    title: {
      cs: "Slámohrad a slámobazén",
      en: "Straw castle and straw pool",
      de: "Strohburg und Strohbad",
    },
    text: {
      cs: "Ve stodole stavíme každý rok hrad ze slaměných balíků. Vedle něj je slámobazén, ze kterého se děti nedají dostat ven.",
      en: "Every year we build a castle of straw bales in the barn. Next to it is a pool of loose straw that children refuse to leave.",
      de: "Jedes Jahr bauen wir in der Scheune eine Burg aus Strohballen. Daneben liegt ein Strohbad, aus dem die Kinder nicht mehr herauswollen.",
    },
  },
  {
    title: {
      cs: "Výstava odrůd",
      en: "The variety exhibition",
      de: "Sortenausstellung",
    },
    text: {
      cs: "Ve dvoře a v zahradě máme vystavené druhy dýní, které pěstujeme. U každé je popiska s názvem a na co se hodí.",
      en: "The courtyard and the garden hold every pumpkin variety we grow. Each one has a label with its name and what it is good for.",
      de: "Im Hof und im Garten zeigen wir alle Kürbissorten, die wir anbauen. Bei jeder steht der Name und wofür sie sich eignet.",
    },
  },
  {
    title: { cs: "Kombajn", en: "The combine harvester", de: "Der Mähdrescher" },
    text: {
      cs: "V zahradě stojí kombajn. Dá se na něj vylézt a sednout si za volant.",
      en: "There is a combine harvester in the garden. You can climb up and sit behind the wheel.",
      de: "Im Garten steht ein Mähdrescher. Man darf hinaufklettern und sich ans Steuer setzen.",
    },
  },
  {
    title: { cs: "Zvířata", en: "The animals", de: "Die Tiere" },
    text: {
      cs: "Kozičky, ovečky, koně Black a Natin, poník Princezna, telátko Žofka, prasátka a velcí králíci.",
      en: "Dwarf goats, sheep, the horses Black and Natin, the pony Princezna, the calf Žofka, piglets and giant rabbits.",
      de: "Zwergziegen, Schafe, die Pferde Black und Natin, das Pony Princezna, das Kalb Žofka, Ferkel und Riesenkaninchen.",
    },
  },
  {
    title: { cs: "Prodej dýní", en: "Pumpkins for sale", de: "Kürbisverkauf" },
    text: {
      cs: "Dýně na dekoraci, na vaření i na vyřezávání na Halloween. Vybíráte přímo z regálů ve stodole.",
      en: "Pumpkins for decoration, for cooking and for Halloween carving. You pick them straight off the shelves in the barn.",
      de: "Kürbisse zum Dekorieren, zum Kochen und zum Schnitzen an Halloween. Sie wählen direkt aus den Regalen in der Scheune.",
    },
  },
  {
    title: { cs: "Přírodní hřiště", en: "The natural playground", de: "Naturspielplatz" },
    text: {
      cs: "Zahrada s dřevěnými atrakcemi, průlezy a probíhačkami mezi dýněmi.",
      en: "A garden of wooden climbing frames, tunnels and runs winding between the pumpkins.",
      de: "Ein Garten mit Holzgeräten, Klettertunneln und Laufwegen zwischen den Kürbissen.",
    },
  },
] as const;

/** Praktické informace, které lidé hledají jako první. */
const PRACTICAL_ALL = [
  {
    label: { cs: "Parkoviště", en: "Parking", de: "Parkplatz" },
    value: {
      cs: "Zdarma, cca 50 m od statku, značeno směrovkami.",
      en: "Free, about 50 m from the farm, signposted.",
      de: "Kostenlos, etwa 50 m vom Hof entfernt, ausgeschildert.",
    },
  },
  {
    label: { cs: "Vlakem", en: "By train", de: "Mit der Bahn" },
    value: {
      cs: "Zastávka Nová Ves u Leštiny je 200 m od statku. Pár metrů do kopce a jste tady.",
      en: "The Nová Ves u Leštiny stop is 200 m away. A short walk uphill and you are here.",
      de: "Die Haltestelle Nová Ves u Leštiny liegt 200 m entfernt. Ein kurzes Stück bergauf und Sie sind da.",
    },
  },
  {
    label: { cs: "Pes", en: "Dogs", de: "Hunde" },
    value: {
      cs: "Vstup se psem povolen, vstupné 10 Kč.",
      en: "Dogs are welcome, 10 CZK per dog.",
      de: "Hunde sind willkommen, 10 CZK pro Hund.",
    },
  },
  {
    label: { cs: "Wi-Fi", en: "Wi-Fi", de: "WLAN" },
    value: {
      cs: "V celém areálu zdarma.",
      en: "Free across the whole site.",
      de: "Auf dem gesamten Gelände kostenlos.",
    },
  },
  {
    label: { cs: "Platba na místě", en: "Paying on site", de: "Zahlung vor Ort" },
    value: {
      cs: "Hotově nebo QR platbou. Kartou na statku bohužel ne.",
      en: "Cash or QR bank payment. We cannot take cards on the farm.",
      de: "Bar oder per QR-Überweisung. Kartenzahlung ist auf dem Hof leider nicht möglich.",
    },
  },
  {
    label: { cs: "Toalety", en: "Toilets", de: "Toiletten" },
    value: {
      cs: "Dámské, pánské i bezbariérové, ve dvoře.",
      en: "Ladies', gents' and accessible, in the courtyard.",
      de: "Damen, Herren und barrierefrei, im Hof.",
    },
  },
] as const;

const RULES_ALL = {
  cs: [
    "Vstup do areálu je na vlastní nebezpečí.",
    "Dítě pouze v doprovodu a za dohledu dospělé osoby.",
  ],
  en: [
    "You enter the site at your own risk.",
    "Children only in the company and under the supervision of an adult.",
  ],
  de: [
    "Das Betreten des Geländes erfolgt auf eigene Gefahr.",
    "Kinder nur in Begleitung und unter Aufsicht eines Erwachsenen.",
  ],
} as const satisfies Record<Locale, readonly string[]>;

export function attractionsFor(locale: Locale) {
  return ATTRACTIONS_ALL.map((a) => ({ title: a.title[locale], text: a.text[locale] }));
}

export function practicalFor(locale: Locale) {
  return PRACTICAL_ALL.map((p) => ({ label: p.label[locale], value: p.value[locale] }));
}

export function rulesFor(locale: Locale): readonly string[] {
  return RULES_ALL[locale];
}
