import type { Locale } from "@/lib/i18n/config";
import type { Line } from "./types";

export const SCHOOLS = {
  kicker: { cs: "Dopolední programy", en: "Morning programmes", de: "Vormittagsprogramme" },
  title: {
    cs: "Pro školky, první stupeň a skupiny dětí",
    en: "For nurseries, primary schools and children's groups",
    de: "Für Kindergärten, Grundschulen und Kindergruppen",
  },
  lead: {
    cs: "Dva programy podle ročního období. Na podzim výstava dýní a zahrada se slámou, na jaře les upravený pro volnou hru. Obojí venku, obojí končí tak, aby se stihl oběd.",
    en: "Two programmes, one for each season. In autumn the pumpkin exhibition and a garden full of straw; in spring a forest laid out for free play. Both outdoors, both finish in time for lunch.",
    de: "Zwei Programme, je nach Jahreszeit. Im Herbst die Kürbisausstellung und ein Garten voller Stroh, im Frühjahr ein Wald zum freien Spielen. Beides draußen, beides endet rechtzeitig vor dem Mittagessen.",
  },
  programLabel: { cs: "Program", en: "Programme", de: "Programm" },

  howTitle: { cs: "Jak to u nás chodí", en: "How a visit works", de: "Wie ein Besuch abläuft" },
  howLead: {
    cs: "Většinu otázek dostáváme opakovaně, tak je tu rovnou zodpovídáme.",
    en: "We get the same questions again and again, so here are the answers.",
    de: "Dieselben Fragen kommen immer wieder — hier sind die Antworten.",
  },

  weatherTitle: {
    cs: "Když se pokazí počasí",
    en: "If the weather turns",
    de: "Wenn das Wetter umschlägt",
  },
  weather1: {
    cs: "Výlet se dá bez dalšího odvolat. Vždycky si bereme telefon na organizátora a jednou až dvakrát za sezónu školky sami obvoláváme — když má pršet celý den, výlet by nebyl příjemný. Vaše rozhodnutí výlet zrušit respektujeme stejně.",
    en: "The trip can be called off with no further ado. We always take the organiser's phone number and once or twice a season we ring round ourselves — a whole day of rain makes for a miserable outing. If you decide to cancel, we respect that just the same.",
    de: "Der Ausflug kann jederzeit abgesagt werden. Wir notieren uns immer die Telefonnummer der Organisatoren und rufen ein- bis zweimal pro Saison selbst an — bei Dauerregen macht der Besuch keine Freude. Sagen Sie ab, ist das für uns ebenso in Ordnung.",
  },
  weather2: {
    cs: "Když nepřeje jen část dopoledne, máme dost krytého prostoru: stodolu, patro ve stodole, zastřešený prostor u stodoly, restauraci a venkovní posezení. Na podzim se dá tou dobou zabavit vyřezáváním dýně.",
    en: "If only part of the morning is wet, we have plenty of cover: the barn, the loft above it, the roofed area beside it, the restaurant and the outdoor seating. In autumn that is a good moment for pumpkin carving.",
    de: "Regnet es nur zeitweise, gibt es genug überdachten Platz: die Scheune, das Obergeschoss, den überdachten Bereich daneben, das Restaurant und den Sitzbereich draußen. Im Herbst bietet sich dann das Kürbisschnitzen an.",
  },

  testimonialsTitle: {
    cs: "Co nám napsaly školy",
    en: "What the schools wrote to us",
    de: "Was uns die Schulen geschrieben haben",
  },

  formTitle: { cs: "Domluvit termín", en: "Arrange a date", de: "Termin vereinbaren" },
  formLeadPrefix: {
    cs: "Napište nám, o jaký program máte zájem a kolik dětí přijede. Ozveme se e-mailem nebo telefonicky. Rychlejší je zavolat na",
    en: "Tell us which programme you are interested in and how many children are coming. We will reply by email or phone. Calling is faster:",
    de: "Schreiben Sie uns, welches Programm Sie interessiert und wie viele Kinder kommen. Wir antworten per E-Mail oder Telefon. Schneller geht es telefonisch:",
  },
  formDateLabel: { cs: "Předběžný termín", en: "Provisional date", de: "Wunschtermin" },
  formDateHint: {
    cs: "Nemusí být závazný, upřesníme spolu.",
    en: "Not binding — we can nail it down together.",
    de: "Nicht verbindlich — wir legen ihn gemeinsam fest.",
  },
  formRadioLegend: {
    cs: "O jaký program jde",
    en: "Which programme",
    de: "Um welches Programm geht es",
  },
  formOption1: {
    cs: "Výlet do Dýňového světa",
    en: "A trip to Pumpkin World",
    de: "Ausflug in die Kürbiswelt",
  },
  formOption2: {
    cs: "Výlet do lesa – Příroda hrou",
    en: "A trip to the forest – Nature at Play",
    de: "Waldausflug – Natur zum Spielen",
  },
  formOption3: { cs: "Ještě nevím", en: "Not sure yet", de: "Weiß ich noch nicht" },
  formMessageLabel: { cs: "Poznámka", en: "Note", de: "Anmerkung" },
  formMessageHint: {
    cs: "Počet dětí, věk, jestli chcete malé dýně pro každého.",
    en: "Number of children, their age, whether you want a small pumpkin for each of them.",
    de: "Anzahl der Kinder, Alter, ob Sie für jedes einen kleinen Kürbis möchten.",
  },

  operatorNote: {
    cs: "Lesní programy provozuje {spolek}, IČO {icoSpolek}. Dýňový svět provozuje {owner}, IČ {ico}.",
    en: "The forest programmes are run by {spolek}, ID No. {icoSpolek}. Pumpkin World is run by {owner}, ID No. {ico}.",
    de: "Die Waldprogramme betreibt {spolek}, IdNr. {icoSpolek}. Die Kürbiswelt betreibt {owner}, IdNr. {ico}.",
  },
} as const satisfies Record<string, Line>;

/** Dva programy. Ceny jsou čísla, jen měna a slovo „zdarma" se mění. */
export const SCHOOL_PROGRAMS: {
  plate: string;
  name: Line;
  when: Line;
  prices: { who: Line; price: Line }[];
  text: Record<Locale, readonly string[]>;
}[] = [
  {
    plate: "I",
    name: {
      cs: "Výlet do „Dýňového světa“",
      en: "A trip to “Pumpkin World”",
      de: "Ausflug in die „Kürbiswelt“",
    },
    when: {
      cs: "podzim · 20. 9. — 2. 11.",
      en: "autumn · 20 Sept — 2 Nov",
      de: "Herbst · 20. 9. — 2. 11.",
    },
    prices: [
      {
        who: { cs: "dítě", en: "child", de: "Kind" },
        price: { cs: "100 Kč", en: "100 CZK", de: "100 CZK" },
      },
      {
        who: {
          cs: "pedagogický doprovod",
          en: "accompanying teacher",
          de: "pädagogische Begleitung",
        },
        price: { cs: "zdarma", en: "free", de: "frei" },
      },
    ],
    text: {
      cs: [
        "Na statku v Nové Vsi u Leštiny pěstujeme tykve různých druhů, tvarů a barev. Oranžové dýně na Halloween od nejmenších, vhodných na strašidla pro školky, po ty obrovské. K tomu druhy na vaření a drobné dekorativní tykvičky.",
        "Ve stodole máme prodej dýní formou výstavních regálů. U každé jsou popisky s názvem a možným využitím konkrétního druhu. Ve stodole také míváme telátko, prasátko a velké králíky.",
        "V zahradě jsou dřevěné a slaměné atrakce, slámohrad ze slaměných balíků a „slámobazén“. Mezi poskládanými dýněmi jsou různé probíhačky.",
      ],
      en: [
        "On the farm in Nová Ves u Leštiny we grow gourds of every kind, shape and colour. Orange Halloween pumpkins from the smallest ones — just right for a nursery jack-o'-lantern — up to the giants. Alongside them, cooking varieties and small decorative gourds.",
        "In the barn the pumpkins are sold from exhibition shelves. Each has a label with its name and what the variety can be used for. The barn usually also holds a calf, a piglet and the giant rabbits.",
        "The garden has wooden and straw structures, a castle built of straw bales and a “straw pool”. Runs and passages wind between the stacked pumpkins.",
      ],
      de: [
        "Auf dem Hof in Nová Ves u Leštiny bauen wir Kürbisse aller Arten, Formen und Farben an. Orangefarbene Halloween-Kürbisse — von den kleinsten, die sich für Kindergartengespenster eignen, bis zu den riesigen. Dazu Speisesorten und kleine Zierkürbisse.",
        "In der Scheune werden die Kürbisse aus Ausstellungsregalen verkauft. Bei jedem steht der Name und wofür sich die Sorte eignet. In der Scheune sind meist auch ein Kalb, ein Ferkel und die Riesenkaninchen.",
        "Im Garten stehen Holz- und Strohgeräte, eine Burg aus Strohballen und ein „Strohbad“. Zwischen den gestapelten Kürbissen führen Laufwege hindurch.",
      ],
    },
  },
  {
    plate: "II",
    name: {
      cs: "Výlet do lesa — „Příroda hrou“",
      en: "A trip to the forest — “Nature at Play”",
      de: "Waldausflug — „Natur zum Spielen“",
    },
    when: {
      cs: "jaro · polovina dubna — konec června",
      en: "spring · mid-April — end of June",
      de: "Frühjahr · Mitte April — Ende Juni",
    },
    prices: [
      {
        who: {
          cs: "žák I. stupně ZŠ",
          en: "primary school pupil (years 1–5)",
          de: "Grundschulkind (Klassen 1–5)",
        },
        price: { cs: "150 Kč", en: "150 CZK", de: "150 CZK" },
      },
      {
        who: { cs: "dítě z MŠ", en: "nursery child", de: "Kindergartenkind" },
        price: { cs: "120 Kč", en: "120 CZK", de: "120 CZK" },
      },
      {
        who: {
          cs: "pedagogický doprovod",
          en: "accompanying teacher",
          de: "pädagogische Begleitung",
        },
        price: { cs: "zdarma", en: "free", de: "frei" },
      },
    ],
    text: {
      cs: [
        "Na „lesní hřiště“ a zpět ke statku vás sveze cestou mezi poli traktor-taxi.",
        "V lese najdete speciálně upravenou paseku s probíháním mezi stromy — „bludištěm“. V prostoru lesa jsou prvky z upravených smrkových klád, kde si děti užijí volný pohyb a zábavu v přírodě.",
        "Děti zažijí les všemi smysly, poznávají základní druhy stromů, jejich listy a plody. Program vychází z principů lesní pedagogiky.",
        "Každá školní skupina si na „lesní zahrádce“ vyzkouší zasadit svůj strom. Děti se tak podílejí na obnově lesa po kůrovcové kalamitě — společně vytvoříme nový les.",
        "Pro ZŠ je součástí opékání „hadů“. V případě nepřízně počasí se můžeme ohřát u ohýnku a je k dispozici teplý nápoj.",
      ],
      en: [
        "A tractor-taxi carries you along the field track to the “forest playground” and back to the farm.",
        "In the wood there is a clearing laid out for running between the trees — a “maze”. Around it stand structures made from shaped spruce logs, where children can move and play freely in the open.",
        "Children experience the forest with all their senses and learn the common tree species, their leaves and their fruit. The programme follows the principles of forest pedagogy.",
        "Every school group plants its own tree in the “forest nursery”. The children take part in restoring the wood after the bark-beetle outbreak — together we grow a new forest.",
        "For primary schools, baking dough “snakes” over the fire is part of the day. If the weather turns we can warm up by the fire, and a hot drink is available.",
      ],
      de: [
        "Ein Traktor-Taxi bringt Sie über den Feldweg zum „Waldspielplatz“ und wieder zurück zum Hof.",
        "Im Wald erwartet Sie eine eigens angelegte Lichtung zum Laufen zwischen den Bäumen — ein „Labyrinth“. Ringsum stehen Elemente aus bearbeiteten Fichtenstämmen, an denen sich die Kinder frei bewegen und in der Natur spielen können.",
        "Die Kinder erleben den Wald mit allen Sinnen und lernen die wichtigsten Baumarten, ihre Blätter und Früchte kennen. Das Programm folgt den Grundsätzen der Waldpädagogik.",
        "Jede Schulgruppe pflanzt im „Waldgärtchen“ ihren eigenen Baum. So beteiligen sich die Kinder an der Wiederaufforstung nach dem Borkenkäferbefall — gemeinsam entsteht ein neuer Wald.",
        "Für Grundschulen gehört das Backen von Teig-„Schlangen“ über dem Feuer dazu. Bei schlechtem Wetter wärmen wir uns am Feuer, ein heißes Getränk steht bereit.",
      ],
    },
  },
];

export const SCHOOL_PRACTICAL: { label: Line; value: Line }[] = [
  {
    label: { cs: "Kdy přijíždíte", en: "When you arrive", de: "Wann Sie ankommen" },
    value: {
      cs: "Skupiny k nám přijíždějí v pracovní dny zhruba kolem deváté hodiny ranní. Návštěva trvá asi dvě hodiny, kolem jedenácté skupiny odjíždějí, aby stihly oběd. Delší pobyt jen po předchozí domluvě.",
      en: "Groups arrive on weekdays at around nine in the morning. The visit lasts about two hours; groups leave around eleven so they are back for lunch. A longer stay only by prior arrangement.",
      de: "Gruppen kommen werktags gegen neun Uhr morgens. Der Besuch dauert etwa zwei Stunden, gegen elf fahren die Gruppen zurück, um das Mittagessen zu schaffen. Längerer Aufenthalt nur nach Absprache.",
    },
  },
  {
    label: { cs: "Autobus", en: "Coach", de: "Bus" },
    value: {
      cs: "Pro autobusy máme připravené parkoviště cca 100 metrů od statku.",
      en: "There is a coach park about 100 metres from the farm.",
      de: "Für Busse gibt es einen Parkplatz etwa 100 Meter vom Hof entfernt.",
    },
  },
  {
    label: { cs: "Svačina", en: "Snack", de: "Vesper" },
    value: {
      cs: "Některé školky svačí po cestě v autobuse, většina u nás na statku nebo přímo v lese.",
      en: "Some nurseries eat on the coach on the way; most have their snack at the farm or out in the wood.",
      de: "Manche Kindergärten vespern unterwegs im Bus, die meisten bei uns auf dem Hof oder direkt im Wald.",
    },
  },
  {
    label: { cs: "Oblečení", en: "Clothing", de: "Kleidung" },
    value: {
      cs: "Přizpůsobte pobytu v přírodě. Jarní i podzimní rána bývají chladná a plná rosy v trávě, někdy s mrazíky. Ke konci října už to bývá na zimní oblečení.",
      en: "Dress for being outdoors. Spring and autumn mornings are cold, the grass is heavy with dew and there can be a ground frost. By late October it is winter-coat weather.",
      de: "Auf den Aufenthalt im Freien einstellen. Frühjahrs- und Herbstmorgen sind kühl, das Gras ist nass vom Tau, manchmal gibt es Bodenfrost. Ende Oktober ist Winterkleidung angebracht.",
    },
  },
  {
    label: { cs: "Když je zima", en: "If it is cold", de: "Wenn es kalt ist" },
    value: {
      cs: "Na statku máme vytápěnou restauraci, kde se děti mohou ohřát. Zahrada ale nabízí dost aktivit, u kterých se zahřejí pohybem.",
      en: "The farm has a heated restaurant where children can warm up. The garden, though, offers plenty that warms them up by moving.",
      de: "Auf dem Hof gibt es ein beheiztes Restaurant, in dem sich die Kinder aufwärmen können. Der Garten bietet aber genug, wobei sie sich in Bewegung warmhalten.",
    },
  },
  {
    label: { cs: "Toalety", en: "Toilets", de: "Toiletten" },
    value: {
      cs: "Ve dvoře dámské, pánské i bezbariérové s dostatečnou kapacitou. Toaleta je i na lesním hřišti.",
      en: "Ladies', gents' and accessible toilets in the courtyard, with capacity for a group. There is a toilet at the forest playground too.",
      de: "Im Hof Damen-, Herren- und barrierefreie Toiletten mit ausreichender Kapazität. Auch am Waldspielplatz gibt es eine Toilette.",
    },
  },
  {
    label: {
      cs: "Dýně pro každého",
      en: "A pumpkin for everyone",
      de: "Ein Kürbis für jedes Kind",
    },
    value: {
      cs: "Na podzim si můžete koupit pro každé dítě malou tykev na tvoření. Když nám dáte vědět předem, jsme na větší odběr připravení.",
      en: "In autumn you can buy a small gourd for every child to work with. Tell us in advance and we will have enough ready.",
      de: "Im Herbst können Sie für jedes Kind einen kleinen Kürbis zum Basteln kaufen. Sagen Sie vorher Bescheid, dann halten wir genug bereit.",
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
];

/**
 * Reference od škol. V cizojazyčné mutaci jde o překlad — obsah zůstává
 * doslovný, jen se nepředstírá, že to napsala škola anglicky.
 */
export const SCHOOL_TESTIMONIALS: { text: Line; by: string }[] = [
  {
    text: {
      cs: "Velice děkujeme za krásně zorganizovaný a připravený program pro děti. Děti si užily celý den venku, den plný her, hledání, sázení stromku, bludiště. Opékání hadů bylo pro děti dalším zážitkem. Celou radost završil taxi traktor, ze kterého jsme byli uneseni všichni. Děkujeme za krásně strávený školní výlet a určitě jsme nebyli naposledy.",
      en: "Thank you so much for a beautifully organised and prepared programme for the children. They had a whole day outdoors — games, searching, planting a tree, the maze. Baking the dough snakes was another treat. The tractor-taxi crowned it all; every one of us was delighted. Thank you for a wonderful school trip — we will certainly be back.",
      de: "Herzlichen Dank für das wunderbar organisierte und vorbereitete Programm für die Kinder. Sie hatten einen ganzen Tag draußen — Spiele, Suchen, einen Baum pflanzen, das Labyrinth. Das Backen der Teigschlangen war ein weiteres Erlebnis. Gekrönt wurde alles vom Traktor-Taxi, von dem wir alle begeistert waren. Danke für einen schönen Schulausflug — wir kommen bestimmt wieder.",
    },
    by: "ZŠ Nuselská, Havlíčkův Brod",
  },
  {
    text: {
      cs: "Výlet se nám moc líbil, myslím, že pro děti to bylo něco nového a zajímavého. Sázení stromků, jízda na valníku i opékání těsta. I když to jsou děti z vesnice, tak to někteří vůbec neznají. Za nás paráda. Moc děkujeme.",
      en: "We loved the trip; I think it was something new and interesting for the children. Planting the trees, the ride on the trailer, baking the dough. Even though these are village children, some of them had never done any of it. Brilliant, as far as we are concerned. Thank you very much.",
      de: "Der Ausflug hat uns sehr gefallen, für die Kinder war es etwas Neues und Spannendes. Bäume pflanzen, die Fahrt auf dem Anhänger, das Teigbacken. Obwohl es Dorfkinder sind, kannten das manche gar nicht. Für uns großartig. Vielen Dank.",
    },
    by: "Příměstský tábor, Tělocvičná jednota Sokol Roveň",
  },
  {
    text: {
      cs: "Ještě jednou děkujeme. S programem jsme byli opravdu moc spokojeni.",
      en: "Thank you once again. We were really very happy with the programme.",
      de: "Nochmals vielen Dank. Wir waren mit dem Programm wirklich sehr zufrieden.",
    },
    by: "ZŠ Lánecká, Světlá nad Sázavou",
  },
];
