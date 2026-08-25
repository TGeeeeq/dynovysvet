import type { Line } from "./types";

/** Texty domovské stránky. */
export const HOME = {
  kicker: {
    cs: "Nová Ves u Leštiny · Vysočina",
    en: "Nová Ves u Leštiny · Bohemian-Moravian Highlands",
    de: "Nová Ves u Leštiny · Böhmisch-Mährische Höhe",
  },
  titleTop: { cs: "Dýňový", en: "Pumpkin", de: "Kürbis" },
  titleBottom: { cs: "svět", en: "World", de: "welt" },
  lead: {
    cs: "Pěstujeme dýně. Na podzim otevřeme dvůr, stodolu i zahradu a ukážeme vám, kolik jich vlastně existuje. Děti mezitím obsadí slámohrad.",
    en: "We grow pumpkins. Every autumn we open the courtyard, the barn and the garden, and show you how many kinds there really are. The children take the straw castle.",
    de: "Wir bauen Kürbisse an. Im Herbst öffnen wir Hof, Scheune und Garten und zeigen Ihnen, wie viele Sorten es wirklich gibt. Die Kinder erobern derweil die Strohburg.",
  },
  watchSeason: {
    cs: "Hlídat start sezóny {season}",
    en: "Tell me when the {season} season opens",
    de: "Über den Saisonstart {season} informieren",
  },
  whatYouSee: { cs: "Co u nás uvidíte", en: "What there is to see", de: "Was es zu sehen gibt" },

  statSeason: { cs: "Sezóna", en: "Season", de: "Saison" },
  statSeasonNote: { cs: "Ročník", en: "Edition", de: "Jahrgang" },
  statOpen: { cs: "Otevřeno", en: "Open", de: "Geöffnet" },
  statOpenValue: { cs: "st–pá 14—18", en: "Wed–Fri 2—6 pm", de: "Mi–Fr 14—18 Uhr" },
  statOpenNote: {
    cs: "so–ne a svátky 10—18",
    en: "Sat–Sun and holidays 10 am — 6 pm",
    de: "Sa–So und Feiertage 10—18 Uhr",
  },
  statPrice: { cs: "Vstupné", en: "Admission", de: "Eintritt" },
  statPriceValue: { cs: "120 / 100 Kč", en: "120 / 100 CZK", de: "120 / 100 CZK" },
  statPriceNote: {
    cs: "děti do 2 let zdarma · pes 10 Kč",
    en: "under 2s free · dogs 10 CZK",
    de: "Kinder unter 2 frei · Hund 10 CZK",
  },

  doTitle: {
    cs: "Co se na statku dá dělat",
    en: "What there is to do on the farm",
    de: "Was man auf dem Hof machen kann",
  },
  doLead: {
    cs: "Nic z toho není atrakce postavená pro návštěvníky. Je to fungující statek, jen jsme na dva měsíce otevřeli vrata.",
    en: "None of it was built as an attraction. It is a working farm — we just open the gate for two months.",
    de: "Nichts davon wurde für Besucher gebaut. Es ist ein arbeitender Bauernhof — wir öffnen nur für zwei Monate das Tor.",
  },

  photosLabel: { cs: "Ze statku", en: "From the farm", de: "Vom Hof" },

  varietiesTitle: {
    cs: "Odrůdy, které tu letos rostou",
    en: "The varieties growing here this year",
    de: "Die Sorten, die hier dieses Jahr wachsen",
  },
  varietiesLead: {
    cs: "Semena vozíme od švýcarského a německého dodavatele. Vlastní osivo nenabízíme — dýně se navzájem spráší a příští rok by z nich vyrostlo něco jiného.",
    en: "We buy our seed from a Swiss and a German supplier. We do not sell our own — pumpkins cross-pollinate, and next year you would get something else entirely.",
    de: "Unser Saatgut beziehen wir von einem Schweizer und einem deutschen Lieferanten. Eigenes Saatgut verkaufen wir nicht — Kürbisse kreuzen sich, und im nächsten Jahr wüchse etwas ganz anderes.",
  },
  weight: { cs: "Váha", en: "Weight", de: "Gewicht" },
  goodFor: { cs: "Vhodná na", en: "Good for", de: "Geeignet für" },

  animalsTitle: { cs: "Kdo tu bydlí", en: "Who lives here", de: "Wer hier wohnt" },
  animalsLead: {
    cs: "Hospodářská zvířata typická pro český venkov. Většina se dá pohladit, kozičky si berou granule přímo z ruky.",
    en: "The farm animals you would find in any Czech village. Most of them can be stroked; the dwarf goats take pellets straight from your hand.",
    de: "Nutztiere, wie sie zu jedem tschechischen Dorf gehören. Die meisten darf man streicheln, die Zwergziegen fressen die Pellets aus der Hand.",
  },

  beforeTitle: { cs: "Než vyrazíte", en: "Before you set off", de: "Bevor Sie losfahren" },

  ctaOpen: { cs: "Vyberte si den a hodinu", en: "Pick your day and hour", de: "Wählen Sie Tag und Uhrzeit" },
  ctaClosedPrefix: { cs: "Sezóna", en: "The", de: "Die Saison" },
  ctaClosedSuffix: {
    cs: "začíná 20. září",
    en: "season opens on 20 September",
    de: "beginnt am 20. September",
  },
  ctaOpenLead: {
    cs: "Vstup je na konkrétní čas, aby se na statku nesešlo víc lidí, než unese. Vstupenku dostanete e-mailem jako QR kód.",
    en: "Entry is for a set time, so that the farm never holds more people than it comfortably can. Your ticket arrives by email as a QR code.",
    de: "Der Eintritt gilt für eine feste Uhrzeit, damit nie mehr Menschen auf dem Hof sind, als er verträgt. Das Ticket kommt als QR-Code per E-Mail.",
  },
  ctaClosedLead: {
    cs: "Nechte nám e-mail a dáme vám vědět v den, kdy se otevře prodej vstupenek. Nic jiného vám posílat nebudeme.",
    en: "Leave us your email and we will write on the day ticket sales open. We will not send you anything else.",
    de: "Hinterlassen Sie uns Ihre E-Mail — wir schreiben an dem Tag, an dem der Ticketverkauf startet. Sonst schicken wir Ihnen nichts.",
  },
  ctaButtonOpen: { cs: "Na vstupenky", en: "Go to tickets", de: "Zu den Tickets" },
  ctaButtonClosed: { cs: "Chci vědět o startu", en: "Let me know", de: "Benachrichtigt mich" },
  orCall: { cs: "Nebo zavolejte", en: "Or give us a call", de: "Oder rufen Sie an" },
} as const satisfies Record<string, Line>;
