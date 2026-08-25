import type { Line, Lines } from "./types";

/** Texty stránky Dýňový svět. */
export const PUMPKIN_WORLD = {
  kicker: {
    cs: "20. září — 2. listopadu",
    en: "20 September — 2 November",
    de: "20. September — 2. November",
  },
  title: { cs: "Dýňový svět", en: "Pumpkin World", de: "Kürbiswelt" },
  lead: {
    cs: "Na podzim otevřeme dvůr, stodolu i zahradu. Ve stodole stojí regály plné odrůd, které tu za rok vyrostly — u každé je popiska, na co se hodí. Venku slámohrad, slámobazén a děti, které se odmítají vrátit do auta.",
    en: "In autumn we open the courtyard, the barn and the garden. The barn holds shelves of every variety that grew here this year, each with a label saying what it is good for. Outside: the straw castle, the straw pool, and children who refuse to get back in the car.",
    de: "Im Herbst öffnen wir Hof, Scheune und Garten. In der Scheune stehen Regale voller Sorten, die hier dieses Jahr gewachsen sind — bei jeder steht, wofür sie sich eignet. Draußen: Strohburg, Strohbad und Kinder, die nicht mehr ins Auto zurückwollen.",
  },
  pickDate: { cs: "Vybrat termín", en: "Pick a date", de: "Termin wählen" },
  schoolLink: {
    cs: "Jedete se školkou nebo školou?",
    en: "Coming with a nursery or a school?",
    de: "Kommen Sie mit Kindergarten oder Schule?",
  },

  hoursTitle: { cs: "Otevírací doba", en: "Opening hours", de: "Öffnungszeiten" },
  hoursClosed: {
    cs: "V pondělí a v úterý je zavřeno.",
    en: "Closed on Mondays and Tuesdays.",
    de: "Montags und dienstags geschlossen.",
  },
  priceTitle: { cs: "Vstupné", en: "Admission", de: "Eintritt" },
  free: { cs: "zdarma", en: "free", de: "frei" },
  cardNote: {
    cs: "Na statku nejde platit kartou. Hotově nebo QR platbou z telefonu ano — online koupené vstupenky se platí kartou.",
    en: "We cannot take cards on the farm. Cash and QR bank payment from your phone are fine — tickets bought online are paid by card.",
    de: "Auf dem Hof ist keine Kartenzahlung möglich. Bar oder per QR-Überweisung vom Handy geht — online gekaufte Tickets werden mit Karte bezahlt.",
  },

  whatTitle: { cs: "Co tu na vás čeká", en: "What is waiting for you", de: "Was Sie erwartet" },
  whatLead: {
    cs: "Statek funguje celý rok. Na dva měsíce k němu jen přibude výstava a otevřou se vrata.",
    en: "The farm works all year round. For two months an exhibition is added and the gate swings open.",
    de: "Der Hof arbeitet das ganze Jahr. Für zwei Monate kommt eine Ausstellung dazu und das Tor geht auf.",
  },

  varietiesTitle: {
    cs: "Odrůdy vystavené ve stodole",
    en: "The varieties on show in the barn",
    de: "Die Sorten in der Scheune",
  },
  varietiesLead: {
    cs: "U každé je popiska s názvem a s tím, na co se hodí. Většinu si můžete rovnou koupit s sebou.",
    en: "Each has a label with its name and what it is good for. Most of them you can buy and take home.",
    de: "Bei jeder steht der Name und wofür sie sich eignet. Die meisten können Sie gleich mitnehmen.",
  },

  animalsTitle: { cs: "Zvířata", en: "The animals", de: "Die Tiere" },
  animalsLead: {
    cs: "Hospodářská zvířata typická pro český venkov. Kozičky si berou granule přímo z ruky.",
    en: "The farm animals you would find in any Czech village. The dwarf goats take pellets straight from your hand.",
    de: "Nutztiere, wie sie zu jedem tschechischen Dorf gehören. Die Zwergziegen fressen die Pellets aus der Hand.",
  },

  beforeTitle: { cs: "Než vyrazíte", en: "Before you set off", de: "Bevor Sie losfahren" },

  ctaTitle: {
    cs: "Vstup je na konkrétní hodinu",
    en: "Entry is for a set hour",
    de: "Der Eintritt gilt für eine feste Uhrzeit",
  },
  ctaLead: {
    cs: "Držíme tím počet lidí na statku tak, aby si všichni měli kde hrát. Uvnitř pak můžete zůstat, jak dlouho chcete.",
    en: "That way the farm never gets so full that there is nowhere to play. Once inside, you can stay as long as you like.",
    de: "So wird der Hof nie so voll, dass zum Spielen kein Platz bleibt. Drinnen können Sie bleiben, solange Sie möchten.",
  },
  preferPhone: { cs: "Raději po telefonu?", en: "Rather do it by phone?", de: "Lieber telefonisch?" },
} as const satisfies Record<string, Line>;

/** Otevírací doba — dny i poznámka se překládají, časy ne. */
export const PW_HOURS: { days: Line; time: string; note?: Line }[] = [
  {
    days: { cs: "středa – pátek", en: "Wednesday – Friday", de: "Mittwoch – Freitag" },
    time: "14:00 — 18:00",
  },
  {
    days: { cs: "sobota, neděle", en: "Saturday, Sunday", de: "Samstag, Sonntag" },
    time: "10:00 — 18:00",
  },
  {
    days: {
      cs: "27. — 29. 10. a svátek 28. 10.",
      en: "27 — 29 Oct and the 28 Oct public holiday",
      de: "27. — 29. 10. und Feiertag 28. 10.",
    },
    time: "10:00 — 18:00",
    note: { cs: "podzimní prázdniny", en: "half-term holiday", de: "Herbstferien" },
  },
];

export const PW_LISTS = {} as const satisfies Record<string, Lines>;
