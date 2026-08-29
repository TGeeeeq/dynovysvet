import type { Locale } from "./config";

type Entry = Record<Locale, string>;

/**
 * Texty rámu webu — navigace, patička, tlačítka, hlášky formulářů, stavy
 * prodeje. Jsou v kódu záměrně: majitel je z administrace needituje, protože
 * změna slova „Vstupenky" v navigaci není redakční práce, ale zásah do
 * struktury webu. Obsah stránek se edituje jinde (`src/content/blocks/`).
 */
export const dict = {
  /* ------------------------------------------------------------ navigace */
  skipToContent: { cs: "Přeskočit na obsah", en: "Skip to content", de: "Zum Inhalt springen" },
  mainNav: { cs: "Hlavní navigace", en: "Main navigation", de: "Hauptnavigation" },
  footerNav: { cs: "Patička", en: "Footer", de: "Fußzeile" },
  openMenu: { cs: "Otevřít menu", en: "Open menu", de: "Menü öffnen" },
  closeMenu: { cs: "Zavřít menu", en: "Close menu", de: "Menü schließen" },
  homeLink: { cs: "Dýňový svět — domů", en: "Pumpkin World — home", de: "Kürbiswelt — Startseite" },

  navPumpkinWorld: { cs: "Dýňový svět", en: "Pumpkin World", de: "Kürbiswelt" },
  navTickets: { cs: "Vstupenky", en: "Tickets", de: "Eintritt" },
  navSchools: { cs: "Školy a skupiny", en: "Schools & groups", de: "Schulen & Gruppen" },
  navVenue: { cs: "Statek", en: "The farm", de: "Der Hof" },
  navFleaMarket: { cs: "Bleší trh", en: "Flea market", de: "Flohmarkt" },
  navRecipes: { cs: "Recepty", en: "Recipes", de: "Rezepte" },
  navGrowing: { cs: "Pěstování", en: "Growing", de: "Anbau" },
  navContact: { cs: "Kontakt", en: "Contact", de: "Kontakt" },
  navTerms: { cs: "Obchodní podmínky", en: "Terms & conditions", de: "AGB" },
  navPrivacy: { cs: "Ochrana soukromí", en: "Privacy policy", de: "Datenschutz" },

  /* -------------------------------------------------------------- jazyky */
  language: { cs: "Jazyk", en: "Language", de: "Sprache" },
  switchLanguage: { cs: "Přepnout jazyk", en: "Switch language", de: "Sprache wechseln" },

  /* ------------------------------------------------------------ vstupenky */
  buyTickets: { cs: "Koupit vstupenky", en: "Buy tickets", de: "Karten kaufen" },
  ticketsCta: { cs: "Vstupenky", en: "Tickets", de: "Eintritt" },
  soldOut: { cs: "Vyprodáno", en: "Sold out", de: "Ausverkauft" },
  free: { cs: "volno", en: "available", de: "frei" },
  fewLeft: { cs: "poslední místa", en: "few left", de: "letzte Plätze" },
  remaining: { cs: "volných míst", en: "spots left", de: "Plätze frei" },
  closed: { cs: "Zavřeno", en: "Closed", de: "Geschlossen" },
  chooseDay: { cs: "Vyberte den", en: "Choose a day", de: "Tag wählen" },
  chooseTime: { cs: "Vyberte čas příchodu", en: "Choose your arrival time", de: "Ankunftszeit wählen" },
  perPerson: { cs: "za osobu", en: "per person", de: "pro Person" },
  total: { cs: "Celkem", en: "Total", de: "Gesamt" },
  currency: { cs: "Kč", en: "CZK", de: "CZK" },

  /* ---------------------------------------------------------- formuláře */
  formName: { cs: "Jméno", en: "Name", de: "Name" },
  formEmail: { cs: "E-mail", en: "Email", de: "E-Mail" },
  formPhone: { cs: "Telefon", en: "Phone", de: "Telefon" },
  formDate: { cs: "Termín", en: "Preferred date", de: "Wunschtermin" },
  formMessage: { cs: "Zpráva", en: "Message", de: "Nachricht" },
  formSend: { cs: "Odeslat poptávku", en: "Send enquiry", de: "Anfrage senden" },
  formSending: { cs: "Odesílám…", en: "Sending…", de: "Wird gesendet…" },
  formOptional: { cs: "nepovinné", en: "optional", de: "optional" },
  formRequired: { cs: "povinné", en: "required", de: "Pflichtfeld" },
  formOk: {
    cs: "Děkujeme, poptávka dorazila. Ozveme se vám co nejdřív.",
    en: "Thank you, your enquiry has arrived. We will get back to you shortly.",
    de: "Vielen Dank, Ihre Anfrage ist angekommen. Wir melden uns in Kürze.",
  },
  formError: {
    cs: "Odeslání se nepovedlo. Zkuste to prosím znovu, nebo nám zavolejte.",
    en: "Sending failed. Please try again, or give us a call.",
    de: "Das Senden ist fehlgeschlagen. Bitte versuchen Sie es erneut oder rufen Sie uns an.",
  },
  formNameFull: { cs: "Jméno a příjmení", en: "Full name", de: "Vor- und Nachname" },
  formLeaveEmpty: { cs: "Nechte prázdné", en: "Leave empty", de: "Leer lassen" },
  formErrNameEmail: {
    cs: "Vyplňte prosím jméno a e-mail.",
    en: "Please fill in your name and email.",
    de: "Bitte geben Sie Name und E-Mail an.",
  },
  formErrEmail: {
    cs: "E-mail nevypadá správně. Zkontrolujte ho prosím.",
    en: "That email does not look right. Please check it.",
    de: "Die E-Mail-Adresse sieht nicht richtig aus. Bitte prüfen Sie sie.",
  },
  formErrChoice: {
    cs: "Vyberte prosím jednu z možností.",
    en: "Please pick one of the options.",
    de: "Bitte wählen Sie eine der Möglichkeiten.",
  },
  formErrSendPhone: {
    cs: "Odeslání se nepovedlo. Zkuste to prosím znovu, nebo nám zavolejte na",
    en: "Sending failed. Please try again, or call us on",
    de: "Das Senden ist fehlgeschlagen. Bitte erneut versuchen oder rufen Sie uns an unter",
  },
  formOkLong: {
    cs: "Děkujeme, máme to. Ozveme se vám e-mailem nebo telefonem.",
    en: "Thank you, we have it. We will get back to you by email or phone.",
    de: "Vielen Dank, wir haben Ihre Anfrage. Wir melden uns per E-Mail oder Telefon.",
  },
  formGdprPrefix: {
    cs: "Odesláním souhlasíte se zpracováním údajů podle",
    en: "By sending you agree to your data being processed under our",
    de: "Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Daten gemäß unserer",
  },
  formGdprLink: {
    cs: "pravidel ochrany soukromí",
    en: "privacy policy",
    de: "Datenschutzrichtlinie",
  },
  formGdpr: {
    cs: "Odesláním souhlasíte se zpracováním údajů pro vyřízení poptávky.",
    en: "By sending you agree to your data being processed to handle this enquiry.",
    de: "Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Daten zur Bearbeitung der Anfrage zu.",
  },

  /* ------------------------------------------------------------- patička */
  findUs: { cs: "Kde nás najdete", en: "Where to find us", de: "So finden Sie uns" },
  onTheFarm: { cs: "Na statku", en: "On the farm", de: "Auf dem Hof" },
  operator: { cs: "Provozovatel", en: "Operator", de: "Betreiber" },
  trainNote: {
    cs: "Vlaková zastávka Nová Ves u Leštiny je 200 m od statku.",
    en: "The Nová Ves u Leštiny railway stop is 200 m from the farm.",
    de: "Die Bahnhaltestelle Nová Ves u Leštiny liegt 200 m vom Hof entfernt.",
  },
  operatorNote: {
    cs: "Zemědělský podnikatel, plátce DPH.",
    en: "Registered agricultural entrepreneur, VAT payer.",
    de: "Eingetragener landwirtschaftlicher Unternehmer, umsatzsteuerpflichtig.",
  },
  forestNote: {
    cs: "Lesní programy provozuje",
    en: "Forest programmes are run by",
    de: "Die Waldprogramme betreibt",
  },
  partners: { cs: "Spolupracujeme", en: "Our partners", de: "Unsere Partner" },
  madeBy: { cs: "Web vytvořil", en: "Website by", de: "Website von" },
  siteAdmin: { cs: "Správa webu", en: "Site administration", de: "Website-Verwaltung" },

  related: { cs: "Souvisí", en: "See also", de: "Siehe auch" },

  /* ------------------------------------------------------------- recepty */
  recipesTitle: { cs: "Recepty — vaříme nejen z dýní", en: "Recipes — and not only from pumpkins", de: "Rezepte — nicht nur aus Kürbis" },
  recipesLead: {
    cs: "Naše oblíbené vyzkoušené recepty.",
    en: "Our favourite tried-and-tested recipes.",
    de: "Unsere liebsten, erprobten Rezepte.",
  },
  recipesIndex: { cs: "Rejstřík receptů", en: "Recipe index", de: "Rezeptverzeichnis" },
  ingredients: { cs: "Suroviny", en: "Ingredients", de: "Zutaten" },
  method: { cs: "Postup", en: "Method", de: "Zubereitung" },
  ownRecipeTitle: { cs: "Máte vlastní recept?", en: "Got a recipe of your own?", de: "Haben Sie ein eigenes Rezept?" },
  ownRecipeLead: {
    cs: "Uvítáme, když nám pošlete další osvědčené dobré recepty na přípravu pokrmů z dýně. Rádi je vyzkoušíme a zveřejníme na našich stránkách.",
    en: "We would love you to send us more tried-and-tested pumpkin recipes. We will happily cook them and publish them here.",
    de: "Wir freuen uns über weitere bewährte Kürbisrezepte. Wir probieren sie gern aus und veröffentlichen sie hier.",
  },
  tvShow: {
    cs: "Recepty z dýní — TV pořad „Hrdina kuchyně“",
    en: "Pumpkin recipes on the Czech TV show “Hrdina kuchyně”",
    de: "Kürbisrezepte in der tschechischen TV-Sendung „Hrdina kuchyně“",
  },
  recipeCategory: { cs: "Z dýní", en: "Pumpkin", de: "Kürbis" },

  /* ------------------------------------------------------------- chyby */
  notFoundTitle: { cs: "Tady nic neroste", en: "Nothing grows here", de: "Hier wächst nichts" },
  notFoundBody: {
    cs: "Stránka, kterou hledáte, na statku není. Možná se přestěhovala jinam.",
    en: "The page you are looking for is not on the farm. It may have moved.",
    de: "Die gesuchte Seite gibt es auf dem Hof nicht. Vielleicht ist sie umgezogen.",
  },
  backHome: { cs: "Zpátky na titulní stranu", en: "Back to the home page", de: "Zurück zur Startseite" },

  /* -------------------------------------------------------------- odrůdy */
  weightLabel: { cs: "Váha", en: "Weight", de: "Gewicht" },
  goodForLabel: { cs: "Vhodná na", en: "Good for", de: "Geeignet für" },

  /* ------------------------------------------------------------- intro */
  introHint: {
    cs: "Táhněte po dýni a vyřežte ji",
    en: "Drag across the pumpkin to carve it",
    de: "Über den Kürbis ziehen und schnitzen",
  },
  introHintTouch: {
    cs: "Přejeďte prstem po dýni",
    en: "Swipe across the pumpkin",
    de: "Mit dem Finger über den Kürbis wischen",
  },
  introSkip: { cs: "Přeskočit", en: "Skip", de: "Überspringen" },
  introTitle: { cs: "Dýňový svět", en: "Pumpkin World", de: "Kürbiswelt" },
  introSub: {
    cs: "Statek u Pipků — Nová Ves u Leštiny",
    en: "Statek u Pipků — Nová Ves u Leštiny, Czechia",
    de: "Statek u Pipků — Nová Ves u Leštiny, Tschechien",
  },
  introLabel: {
    cs: "Úvodní animace — vyřezávání dýně",
    en: "Intro animation — carving a pumpkin",
    de: "Intro-Animation — Kürbisschnitzen",
  },
} as const satisfies Record<string, Entry>;

export type DictKey = keyof typeof dict;

/** `t("navTickets")` v daném jazyce. */
export function makeT(locale: Locale) {
  return (key: DictKey): string => dict[key][locale];
}
