import type { Locale } from "@/lib/i18n/config";
import type { Line, Lines } from "./types";

export const FLEA = {
  kicker: {
    cs: "Bleší trh · SWAP · rodinný víkend",
    en: "Flea market · SWAP · family weekend",
    de: "Flohmarkt · SWAP · Familienwochenende",
  },
  title: { cs: "Dětský bleší trh", en: "Children's flea market", de: "Kinderflohmarkt" },
  lead: {
    cs: "Děti mohou s pomocí rodičů prodávat své hračky, hry, knížky, oblečení i sportovní potřeby, které už nepotřebují. Můžete prodávat, kupovat, nebo se jen přijít podívat.",
    en: "With a hand from their parents, children can sell the toys, games, books, clothes and sports kit they have outgrown. Come to sell, to buy, or just to look.",
    de: "Mit Hilfe der Eltern können Kinder Spielzeug, Spiele, Bücher, Kleidung und Sportsachen verkaufen, die sie nicht mehr brauchen. Sie können verkaufen, kaufen oder einfach vorbeischauen.",
  },
  reuse: {
    cs: "Celá akce stojí na myšlence reuse — věcem dáváme druhý život. Nevyhazujeme, co už nepotřebujeme, ale posouváme dál, aby udělaly radost někomu dalšímu. Děti navíc získávají zkušenost s hodnotou věcí a základy finanční gramotnosti.",
    en: "The whole thing rests on reuse — giving things a second life. Instead of throwing away what we no longer need, we pass it on so it can please someone else. And children get a feel for what things are worth, and a first taste of handling money.",
    de: "Die ganze Veranstaltung baut auf Reuse — wir geben Dingen ein zweites Leben. Was wir nicht mehr brauchen, werfen wir nicht weg, sondern geben es weiter, damit es jemand anderem Freude macht. Nebenbei lernen die Kinder, was Dinge wert sind, und machen erste Erfahrungen mit Geld.",
  },
  nextEdition: {
    cs: "I. ročník proběhl 28.—29. června 2025. Termín dalšího ročníku zatím není vypsaný — nechte nám e-mail ve formuláři níže a dáme vám vědět.",
    en: "The first edition took place on 28–29 June 2025. The date of the next one is not set yet — leave us your email in the form below and we will tell you.",
    de: "Die erste Auflage fand am 28.–29. Juni 2025 statt. Der Termin für die nächste steht noch nicht fest — hinterlassen Sie unten Ihre E-Mail, wir melden uns.",
  },

  priceTitle: { cs: "Vstupné", en: "Admission", de: "Eintritt" },
  includedTitle: {
    cs: "Co je v ceně vstupného",
    en: "What admission includes",
    de: "Was im Eintritt enthalten ist",
  },
  refreshments: {
    cs: "Občerstvení otevřeno. Parkování zdarma.",
    en: "Refreshments open. Parking free.",
    de: "Imbiss geöffnet. Parken kostenlos.",
  },

  rulesTitle: {
    cs: "Pravidla pro prodávající",
    en: "Rules for sellers",
    de: "Regeln für Verkäufer",
  },
  rulesLead: {
    cs: "Prodej je určený pro nepodnikající, soukromé prodávající. Stánkaři jen po předchozí domluvě s organizátorem.",
    en: "Selling is for private, non-commercial sellers. Traders only by prior arrangement with the organiser.",
    de: "Der Verkauf ist für private, nicht gewerbliche Verkäufer gedacht. Händler nur nach vorheriger Absprache mit dem Veranstalter.",
  },
  rulesNote: {
    cs: "Organizátor si vyhrazuje právo vyloučit prodávajícího v případě prodeje nevhodného zboží.",
    en: "The organiser reserves the right to exclude a seller offering unsuitable goods.",
    de: "Der Veranstalter behält sich vor, Verkäufer mit ungeeigneter Ware auszuschließen.",
  },

  formTitle: {
    cs: "Chci vědět o dalším ročníku",
    en: "Tell me about the next edition",
    de: "Über die nächste Auflage informieren",
  },
  formLead: {
    cs: "Jakmile vypíšeme termín, ozveme se e-mailem. Nic jiného vám posílat nebudeme.",
    en: "As soon as we set a date we will email you. We will not send you anything else.",
    de: "Sobald der Termin feststeht, schreiben wir Ihnen. Sonst schicken wir Ihnen nichts.",
  },
  formRadioLegend: { cs: "Mám zájem", en: "I would like to", de: "Ich möchte" },
  formOption1: {
    cs: "Přijít jako návštěvník",
    en: "Come as a visitor",
    de: "Als Besucher kommen",
  },
  formOption2: { cs: "Přijet prodávat", en: "Come and sell", de: "Verkaufen kommen" },
  formOption3: {
    cs: "Jen mě informujte o dalších akcích na statku",
    en: "Just keep me posted about events on the farm",
    de: "Mich nur über weitere Veranstaltungen informieren",
  },
  formMessageLabel: {
    cs: "Poznámka nebo dotaz",
    en: "Note or question",
    de: "Anmerkung oder Frage",
  },
  formSubmit: { cs: "Odeslat", en: "Send", de: "Absenden" },
} as const satisfies Record<string, Line>;

export const FLEA_PRICES: { who: Line; price: Line; note?: Line }[] = [
  {
    who: {
      cs: "Vstupné 1 den / 1 osoba",
      en: "Admission, 1 day / 1 person",
      de: "Eintritt 1 Tag / 1 Person",
    },
    price: { cs: "80 Kč", en: "80 CZK", de: "80 CZK" },
    note: {
      cs: "projížďka traktorem-taxi v ceně",
      en: "tractor-taxi ride included",
      de: "Fahrt mit dem Traktor-Taxi inklusive",
    },
  },
  {
    who: {
      cs: "Prodejní místo „základna 3 × 3 m“ / 1 den",
      en: "Selling pitch, a 3 × 3 m “base” / 1 day",
      de: "Verkaufsplatz „Basis 3 × 3 m“ / 1 Tag",
    },
    price: { cs: "80 Kč", en: "80 CZK", de: "80 CZK" },
  },
  {
    who: { cs: "Dítě do 2 let", en: "Child under 2", de: "Kind unter 2 Jahren" },
    price: { cs: "zdarma", en: "free", de: "frei" },
  },
];

export const FLEA_INCLUDED: Record<Locale, readonly string[]> = {
  cs: [
    "Stodola a zahrada statku",
    "Přírodní hřiště se slámohradem a slámobazénem",
    "Dřevěné atrakce",
    "Zvířátka",
    "Projížďka traktorem-taxi pro malé i velké",
  ],
  en: [
    "The barn and the farm garden",
    "The natural playground with the straw castle and straw pool",
    "The wooden structures",
    "The animals",
    "A tractor-taxi ride, for small and large alike",
  ],
  de: [
    "Scheune und Hofgarten",
    "Naturspielplatz mit Strohburg und Strohbad",
    "Die Holzgeräte",
    "Die Tiere",
    "Eine Fahrt mit dem Traktor-Taxi, für Klein und Groß",
  ],
} satisfies Lines;

export const FLEA_RULES: { n: string; title: Line; text: Line }[] = [
  {
    n: "1",
    title: {
      cs: "Registrace a zajištění místa",
      en: "Registering and securing a pitch",
      de: "Anmeldung und Platzreservierung",
    },
    text: {
      cs: "Pro zajištění prodejního místa vyplňte rezervační formulář níže. Zájem o prodej je třeba nahlásit předem, abyste si zajistili místo 3 × 3 m.",
      en: "To secure a pitch, fill in the booking form below. Selling has to be registered in advance so that your 3 × 3 m spot is reserved.",
      de: "Für einen Verkaufsplatz füllen Sie bitte das Formular unten aus. Der Verkauf muss vorab angemeldet werden, damit Ihr 3 × 3 m großer Platz reserviert ist.",
    },
  },
  {
    n: "2",
    title: {
      cs: "Prodejní místo a vybavení",
      en: "The pitch and what to bring",
      de: "Verkaufsplatz und Ausstattung",
    },
    text: {
      cs: "„Základna 3 × 3 m“ slouží jako prodejní místo i jako místo na odpočinek. Vezměte si deku nebo malý stoleček, křesílko či lehátko. Stanoviště jsou venku v zahradě na slunném místě — hodí se opalovací krém, pokrývka hlavy nebo malé zastínění. Jinde v areálu je během odpoledne dost stínu.",
      en: "The 3 × 3 m “base” is both your pitch and your resting place. Bring a blanket or a small table, a chair or a lounger. The pitches are outdoors in the garden, in the sun — sunscreen, a hat or a bit of shade of your own are worth having. Elsewhere on the site there is plenty of shade in the afternoon.",
      de: "Die „Basis 3 × 3 m“ dient als Verkaufsplatz und als Ruheplatz. Bringen Sie eine Decke oder einen kleinen Tisch, einen Stuhl oder eine Liege mit. Die Plätze liegen draußen im Garten in der Sonne — Sonnencreme, Kopfbedeckung oder ein kleiner Sonnenschutz sind sinnvoll. Anderswo auf dem Gelände gibt es nachmittags reichlich Schatten.",
    },
  },
  {
    n: "3",
    title: { cs: "Co nabízet", en: "What to offer", de: "Was Sie anbieten" },
    text: {
      cs: "Prosíme, nabízejte jen čisté a nepoškozené věci, které byste sami rádi dostali nebo koupili. Zachovejme společně kvalitu a úroveň prodeje.",
      en: "Please offer only clean, undamaged things you would be glad to be given or to buy yourself. Let us keep the standard up together.",
      de: "Bitte bieten Sie nur saubere, unbeschädigte Dinge an, über die Sie sich selbst freuen würden. Halten wir das Niveau gemeinsam hoch.",
    },
  },
  {
    n: "4",
    title: {
      cs: "Příjezd a instalace",
      en: "Arriving and setting up",
      de: "Anfahrt und Aufbau",
    },
    text: {
      cs: "Příjezd a instalace probíhá z parkoviště podle pokynů personálu. K místu je možné zajet osobním vozidlem od 13:00 do 13:45, odjezd vozidla od prodejního místa je nutný do 14:00.",
      en: "Arrival and setting up is from the car park, following the staff's directions. You may drive up to your pitch between 13:00 and 13:45; the car must be away from the pitch by 14:00.",
      de: "Anfahrt und Aufbau erfolgen vom Parkplatz aus nach Anweisung des Personals. Sie dürfen zwischen 13:00 und 13:45 Uhr an den Platz fahren; bis 14:00 Uhr muss das Fahrzeug wieder weg sein.",
    },
  },
];
