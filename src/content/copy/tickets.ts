import type { Locale } from "@/lib/i18n/config";
import type { Line } from "./types";

/** Texty stránky Vstupenky a obou komponent výběru slotu. */
export const TICKETS = {
  titlePrefix: {
    cs: "Vstupenky do Dýňového světa",
    en: "Tickets for Pumpkin World",
    de: "Eintrittskarten für die Kürbiswelt",
  },
  lead: {
    cs: "Vstup na konkrétní hodinu. Držíme tím počet lidí na statku tak, aby si všichni měli kde hrát a bylo na koho se dívat.",
    en: "Entry is for a set hour. That keeps the number of people on the farm at a level where everyone has room to play and something to look at.",
    de: "Der Eintritt gilt für eine feste Uhrzeit. So bleibt die Zahl der Gäste auf dem Hof so, dass alle Platz zum Spielen haben.",
  },
  notOpenYet: {
    cs: "Prodej vstupenek na sezónu {season} zatím neběží. Termíny níže jsou vypsané, ale nakupovat půjde až od začátku září — dáme vědět e-mailem i na Facebooku.",
    en: "Ticket sales for the {season} season have not opened yet. The dates below are published, but buying starts in early September — we will announce it by email and on Facebook.",
    de: "Der Ticketverkauf für die Saison {season} läuft noch nicht. Die Termine unten stehen fest, gekauft wird ab Anfang September — wir melden uns per E-Mail und auf Facebook.",
  },

  faq1Title: { cs: "Proč na čas", en: "Why timed entry", de: "Warum feste Zeiten" },
  faq1Text: {
    cs: "Statek má svoji kapacitu. Když se v jednu chvíli sejde příliš lidí, nikdo si nic neužije.",
    en: "The farm has a capacity. If too many people arrive at once, nobody enjoys it.",
    de: "Der Hof hat eine Kapazität. Kommen zu viele Menschen auf einmal, hat niemand etwas davon.",
  },
  faq2Title: {
    cs: "Jak vstupenka vypadá",
    en: "What the ticket looks like",
    de: "Wie das Ticket aussieht",
  },
  faq2Text: {
    cs: "Přijde e-mailem jako QR kód. U vstupu ho ukážete v telefonu, tisknout nemusíte.",
    en: "It arrives by email as a QR code. Show it on your phone at the gate — no need to print it.",
    de: "Es kommt als QR-Code per E-Mail. Am Eingang zeigen Sie es auf dem Handy, ausdrucken müssen Sie nichts.",
  },
  faq3Title: {
    cs: "Když nemůžete přijet",
    en: "If you cannot make it",
    de: "Wenn Sie nicht kommen können",
  },
  faq3Text: {
    cs: "Ozvěte se nám na telefon nebo e-mail a domluvíme se na jiném termínu.",
    en: "Call us or drop us an email and we will find another date together.",
    de: "Rufen Sie an oder schreiben Sie uns — wir finden einen anderen Termin.",
  },
  faq4Title: { cs: "Platba na místě", en: "Paying on site", de: "Zahlung vor Ort" },
  faq4Text: {
    cs: "Kartou na statku bohužel ne. Hotově nebo QR platbou z telefonu ano.",
    en: "We cannot take cards on the farm. Cash or a QR bank payment from your phone is fine.",
    de: "Kartenzahlung ist auf dem Hof leider nicht möglich. Bar oder per QR-Überweisung geht.",
  },
  callUs: {
    cs: "Nejde to, nebo si nejste jistí? Zavolejte na",
    en: "Stuck, or not sure? Give us a ring on",
    de: "Klappt es nicht oder sind Sie unsicher? Rufen Sie an unter",
  },

  /* ── Výběr slotu ─────────────────────────────────────────────────── */
  noDates: {
    cs: "Termíny pro nadcházející sezónu ještě nejsou vypsané. Nechte nám e-mail a dáme vám vědět, jakmile se prodej otevře.",
    en: "The dates for the coming season are not published yet. Leave us your email and we will let you know as soon as sales open.",
    de: "Die Termine für die kommende Saison stehen noch nicht fest. Hinterlassen Sie uns Ihre E-Mail — wir melden uns, sobald der Verkauf startet.",
  },
  slotsLead: {
    cs: "Vstup je na konkrétní hodinu, ať se na statku nesejde víc lidí, než unese. Uvnitř pak můžete zůstat, jak dlouho chcete.",
    en: "Entry is for a set hour so the farm never holds more people than it can. Once inside, stay as long as you like.",
    de: "Der Eintritt gilt für eine feste Uhrzeit, damit der Hof nie überfüllt ist. Drinnen bleiben Sie, solange Sie möchten.",
  },
  selected: { cs: "Vybráno", en: "Selected", de: "Gewählt" },
  slotFull: { cs: "Plno", en: "Full", de: "Voll" },
  select: { cs: "Vybrat", en: "Select", de: "Wählen" },
  basketTitle: { cs: "Vstupenky", en: "Your tickets", de: "Ihre Karten" },
  free: { cs: "zdarma", en: "free", de: "frei" },
  tooMany: {
    cs: "V tomto čase už zbývá jen {n} míst. Zkuste jiný čas nebo snižte počet.",
    en: "Only {n} spots are left at this time. Try another slot or reduce the number.",
    de: "Zu dieser Zeit sind nur noch {n} Plätze frei. Wählen Sie eine andere Uhrzeit oder weniger Karten.",
  },
  pickTimeFirst: { cs: "Nejdřív vyberte čas", en: "Pick a time first", de: "Zuerst Uhrzeit wählen" },
  addTicket: { cs: "Přidejte vstupenku", en: "Add a ticket", de: "Karte hinzufügen" },
  continueToPayment: {
    cs: "Pokračovat k platbě",
    en: "Continue to payment",
    de: "Weiter zur Zahlung",
  },
  paymentNote: {
    cs: "Platí se kartou online. Vstupenku dostanete e-mailem jako QR kód — stačí ho u vstupu ukázat v telefonu. Místo vám držíme 15 minut.",
    en: "Payment is by card online. Your ticket arrives by email as a QR code — just show it on your phone at the gate. We hold your place for 15 minutes.",
    de: "Bezahlt wird online per Karte. Das Ticket kommt als QR-Code per E-Mail — am Eingang einfach auf dem Handy zeigen. Wir halten Ihren Platz 15 Minuten.",
  },
  stepperMinus: { cs: "ubrat", en: "remove one", de: "eins weniger" },
  stepperPlus: { cs: "přidat", en: "add one", de: "eins mehr" },
} as const satisfies Record<string, Line>;

/**
 * „1 místo / 2 místa / 5 míst" — čeština má čtyři tvary, angličtina
 * a němčina dva. Necháváme to na `Intl.PluralRules`, ne na `n === 1`;
 * ručně psaná podmínka by v češtině spolehlivě vyrobila „5 místa".
 */
const SPOTS: Record<Locale, Partial<Record<Intl.LDMLPluralRule, string>>> = {
  cs: { one: "místo", few: "místa", many: "místa", other: "míst" },
  en: { one: "spot left", other: "spots left" },
  de: { one: "Platz frei", other: "Plätze frei" },
};

export function spotsLabel(n: number, locale: Locale): string {
  const rule = new Intl.PluralRules(locale).select(n);
  const forms = SPOTS[locale];
  return forms[rule] ?? forms.other ?? "";
}
