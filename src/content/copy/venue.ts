import type { Line } from "./types";

export const VENUE = {
  kicker: {
    cs: "Svatby · oslavy · firemní akce",
    en: "Weddings · celebrations · company days",
    de: "Hochzeiten · Feiern · Firmenfeste",
  },
  title: {
    cs: "Statek si můžete pronajmout",
    en: "You can hire the whole farm",
    de: "Sie können den Hof mieten",
  },
  lead: {
    cs: "Nabízíme prostory Statku u Pipků k pořádání svateb, oslav a podobných soukromých či firemních akcí. Můžete využít vybavenou restauraci, uzavřený dvůr, stodolu i zahradu.",
    en: "The spaces of Statek u Pipků are available for weddings, celebrations and similar private or company events. You can use the fitted restaurant, the enclosed courtyard, the barn and the garden.",
    de: "Die Räume des Statek u Pipků stehen für Hochzeiten, Feiern und ähnliche private oder betriebliche Veranstaltungen zur Verfügung. Nutzbar sind das eingerichtete Restaurant, der geschlossene Hof, die Scheune und der Garten.",
  },
  spacesTitle: { cs: "Co je k dispozici", en: "What is available", de: "Was zur Verfügung steht" },

  formTitle: {
    cs: "Poptávka pořádání akce",
    en: "Event enquiry",
    de: "Anfrage für eine Veranstaltung",
  },
  formLead: {
    cs: "Napište nám, o jakou akci jde a jaký bude předběžný počet účastníků. Ozveme se co nejdřív zpátky.",
    en: "Tell us what kind of event it is and roughly how many people are coming. We will get back to you as soon as we can.",
    de: "Schreiben Sie uns, um welche Veranstaltung es geht und mit wie vielen Gästen Sie rechnen. Wir melden uns so schnell wie möglich.",
  },
  formDateLabel: {
    cs: "Předběžný termín akce",
    en: "Provisional date of the event",
    de: "Voraussichtlicher Termin",
  },
  formRadioLegend: { cs: "Mám zájem o", en: "I am interested in", de: "Ich interessiere mich für" },
  formOption1: { cs: "Konzultaci", en: "A conversation", de: "Ein Beratungsgespräch" },
  formOption2: { cs: "Cenovou nabídku", en: "A quote", de: "Ein Angebot" },
  formMessageLabel: { cs: "Zpráva", en: "Message", de: "Nachricht" },
  formMessageHint: {
    cs: "O jakou akci se jedná a kolik lidí přibližně přijede.",
    en: "What kind of event it is and roughly how many people will come.",
    de: "Um welche Veranstaltung es geht und wie viele Gäste ungefähr kommen.",
  },
  formSubmit: { cs: "Poptat", en: "Send enquiry", de: "Anfragen" },
  orCall: { cs: "Nebo rovnou zavolejte", en: "Or just give us a call", de: "Oder rufen Sie einfach an" },
} as const satisfies Record<string, Line>;

export const VENUE_SPACES: { name: Line; text: Line }[] = [
  {
    name: { cs: "Restaurace", en: "The restaurant", de: "Das Restaurant" },
    text: {
      cs: "Vybavená, s kuchyňským a sociálním zázemím. Vytápěná, takže funguje celoročně.",
      en: "Fully fitted, with a kitchen and washrooms. Heated, so it works all year round.",
      de: "Voll ausgestattet, mit Küche und Sanitärbereich. Beheizt, also ganzjährig nutzbar.",
    },
  },
  {
    name: { cs: "Uzavřený dvůr", en: "The enclosed courtyard", de: "Der geschlossene Hof" },
    text: {
      cs: "Prostorný a soukromý. Kolem něj toalety včetně bezbariérové.",
      en: "Roomy and private, with toilets — including an accessible one — around it.",
      de: "Großzügig und privat. Rundherum Toiletten, auch eine barrierefreie.",
    },
  },
  {
    name: { cs: "Stodola", en: "The barn", de: "Die Scheune" },
    text: {
      cs: "Krytý prostor i s patrem. V sezóně v ní stojí slámohrad.",
      en: "Covered space with a loft above. In season it holds the straw castle.",
      de: "Überdachter Raum mit Obergeschoss. In der Saison steht darin die Strohburg.",
    },
  },
  {
    name: { cs: "Zahrada", en: "The garden", de: "Der Garten" },
    text: {
      cs: "Se stylovými dřevěnými a slaměnými atrakcemi. Pro oslavu s dětmi to bývá hlavní důvod, proč sem lidé jezdí.",
      en: "With its wooden and straw structures. For a party with children it is usually the main reason people come.",
      de: "Mit den Holz- und Strohgeräten. Für Feiern mit Kindern ist er meist der Hauptgrund, herzukommen.",
    },
  },
];
