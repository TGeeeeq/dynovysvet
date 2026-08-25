import type { Locale } from "@/lib/i18n/config";
import type { RouteKey } from "@/lib/i18n/routes";

/**
 * Titulky a popisky pro vyhledávače, všechny na jednom místě.
 *
 * České znění je přepsané ze starého webu a doladěné; anglické a německé
 * nejsou doslovný překlad. Němec hledá „Kürbisfest Tschechien", ne
 * „Dýňový svět" — popisek musí mluvit jazykem dotazu, jinak je k ničemu.
 * Délku držíme do ~155 znaků, jinak Google popisek utne.
 */
export interface SeoEntry {
  title: string;
  description: string;
}

export const SEO: Record<RouteKey, Record<Locale, SeoEntry>> = {
  home: {
    cs: {
      title: "Dýňový svět — Statek u Pipků na Vysočině",
      description:
        "Výstava dýní, slámohrad a slámobazén, zvířata a přírodní hřiště na statku v Nové Vsi u Leštiny. Vstupenky na konkrétní čas koupíte online.",
    },
    en: {
      title: "Pumpkin World — a family farm in the Czech highlands",
      description:
        "Hundreds of pumpkin varieties, a straw castle and straw pool, farm animals and a natural playground in Nová Ves u Leštiny. Book a timed ticket online.",
    },
    de: {
      title: "Kürbiswelt — Bauernhof u Pipků in Tschechien",
      description:
        "Kürbisausstellung, Strohburg und Strohbad, Tiere und Naturspielplatz auf dem Hof in Nová Ves u Leštiny. Zeitfenster-Tickets online buchen.",
    },
  },
  pumpkinWorld: {
    cs: {
      title: "Dýňový svět",
      description:
        "Výstava dýní, slámohrad a slámobazén ve stodole, zvířata a přírodní hřiště. Od 20. září do 2. listopadu na Statku u Pipků v Nové Vsi u Leštiny.",
    },
    en: {
      title: "Pumpkin World",
      description:
        "A barn full of pumpkin varieties, a straw castle and straw pool, animals and a natural playground. Open 20 September to 2 November at Statek u Pipků.",
    },
    de: {
      title: "Kürbiswelt",
      description:
        "Kürbisausstellung in der Scheune, Strohburg und Strohbad, Tiere und Naturspielplatz. Vom 20. September bis 2. November auf dem Statek u Pipků.",
    },
  },
  tickets: {
    cs: {
      title: "Vstupenky",
      description:
        "Vstupenky do Dýňového světa na Statku u Pipků. Vyberte si den a hodinu příchodu, zaplaťte kartou a QR vstupenku dostanete e-mailem.",
    },
    en: {
      title: "Tickets",
      description:
        "Tickets for Pumpkin World at Statek u Pipků. Pick a day and an arrival time, pay by card and your QR ticket arrives by email.",
    },
    de: {
      title: "Eintrittskarten",
      description:
        "Tickets für die Kürbiswelt auf dem Statek u Pipků. Tag und Ankunftszeit wählen, mit Karte zahlen — das QR-Ticket kommt per E-Mail.",
    },
  },
  schools: {
    cs: {
      title: "Pro MŠ, ZŠ a skupiny dětí",
      description:
        "Dopolední programy pro mateřské školy, první stupeň ZŠ a skupiny dětí. Výlet do Dýňového světa na podzim a Příroda hrou na lesním hřišti na jaře.",
    },
    en: {
      title: "Schools and groups",
      description:
        "Morning programmes for nurseries, primary schools and children's groups. A trip to Pumpkin World in autumn and Nature at Play on the forest playground in spring.",
    },
    de: {
      title: "Schulen und Gruppen",
      description:
        "Vormittagsprogramme für Kindergärten, Grundschulen und Kindergruppen. Im Herbst der Ausflug in die Kürbiswelt, im Frühjahr Natur zum Spielen am Waldspielplatz.",
    },
  },
  venue: {
    cs: {
      title: "Pronájem statku",
      description:
        "Svatby, oslavy a firemní akce na statku na Vysočině. Dvůr, stodola, zahrada a zvířata za humny. Napište nám termín a domluvíme se.",
    },
    en: {
      title: "Hire the farm",
      description:
        "Weddings, celebrations and company days at a working farm in the Czech highlands. Courtyard, barn, garden and animals next door. Tell us your date.",
    },
    de: {
      title: "Hof mieten",
      description:
        "Hochzeiten, Feiern und Firmenveranstaltungen auf einem Bauernhof in der Vysočina. Hof, Scheune, Garten und Tiere gleich nebenan. Schreiben Sie uns Ihren Termin.",
    },
  },
  fleaMarket: {
    cs: {
      title: "Dětský bleší trh",
      description:
        "Bleší trh a SWAP pro děti na Statku u Pipků. Děti prodávají hračky, knížky a oblečení, které už nepotřebují. Vstupné 80 Kč, prodejní místo 3 × 3 m za 80 Kč.",
    },
    en: {
      title: "Children's flea market",
      description:
        "A flea market and swap run by children at Statek u Pipků. Kids sell the toys, books and clothes they have outgrown. Entry 80 CZK, a 3 × 3 m pitch 80 CZK.",
    },
    de: {
      title: "Kinderflohmarkt",
      description:
        "Flohmarkt und Tauschbörse für Kinder auf dem Statek u Pipků. Kinder verkaufen Spielzeug, Bücher und Kleidung, die sie nicht mehr brauchen. Eintritt 80 CZK, Stand 3 × 3 m 80 CZK.",
    },
  },
  recipes: {
    cs: {
      title: "Recepty z dýní, cuket a patizonů",
      description:
        "Vyzkoušené recepty ze Statku u Pipků: dýňová polévka, kandovaná dýně, dýňové muffiny, marmeláda i slaný nákyp. Postupy tak, jak je píšeme my, ne jak je opisuje internet.",
    },
    en: {
      title: "Pumpkin, courgette and pattypan recipes",
      description:
        "Recipes tested at Statek u Pipků: pumpkin soup, candied pumpkin, pumpkin muffins, jam and a savoury bake. Written the way we cook them, not copied off the internet.",
    },
    de: {
      title: "Rezepte mit Kürbis, Zucchini und Patisson",
      description:
        "Erprobte Rezepte vom Statek u Pipků: Kürbissuppe, kandierter Kürbis, Kürbismuffins, Marmelade und herzhafter Auflauf. So, wie wir sie wirklich kochen.",
    },
  },
  growing: {
    cs: {
      title: "Rady a tipy na pěstování a skladování dýní",
      description:
        "Kdy vysévat, jak daleko od sebe sázet, kde dýně přezimují a jak prodloužit životnost vydlabané halloweenské dýně. Zkušenosti ze Statku u Pipků v Nové Vsi u Leštiny.",
    },
    en: {
      title: "Growing and storing pumpkins",
      description:
        "When to sow, how far apart to plant, where pumpkins keep over winter and how to make a carved Halloween pumpkin last. Experience from a Czech pumpkin farm.",
    },
    de: {
      title: "Kürbisse anbauen und lagern",
      description:
        "Wann säen, wie weit pflanzen, wo Kürbisse überwintern und wie ein geschnitzter Halloween-Kürbis länger hält. Erfahrungen vom Statek u Pipků.",
    },
  },
  contact: {
    cs: {
      title: "Kontakt",
      description:
        "Statek u Pipků, Nová Ves u Leštiny 5. Dostanete se k nám autem i vlakem — vlaková zastávka je 200 m od statku, parkování zdarma.",
    },
    en: {
      title: "Contact and how to get here",
      description:
        "Statek u Pipků, Nová Ves u Leštiny 5, Czech Republic. Reachable by car and by train — the railway stop is 200 m away and parking is free.",
    },
    de: {
      title: "Kontakt und Anfahrt",
      description:
        "Statek u Pipků, Nová Ves u Leštiny 5, Tschechien. Mit dem Auto und der Bahn erreichbar — die Haltestelle liegt 200 m entfernt, Parken ist kostenlos.",
    },
  },
  terms: {
    cs: {
      title: "Obchodní podmínky",
      description:
        "Obchodní podmínky prodeje zboží v internetovém obchodě dynovysvet.cz — prodávající Josef Pipek, Nová Ves u Leštiny 5. Uzavření smlouvy, platba, doprava, odstoupení od smlouvy a reklamace.",
    },
    en: {
      title: "Terms and conditions",
      description:
        "Terms and conditions for purchases at dynovysvet.cz — seller Josef Pipek, Nová Ves u Leštiny 5. Contract, payment, delivery, withdrawal and complaints.",
    },
    de: {
      title: "Allgemeine Geschäftsbedingungen",
      description:
        "AGB für Käufe auf dynovysvet.cz — Verkäufer Josef Pipek, Nová Ves u Leštiny 5. Vertragsschluss, Zahlung, Lieferung, Widerruf und Reklamation.",
    },
  },
  privacy: {
    cs: {
      title: "Pravidla ochrany soukromí",
      description:
        "Jak Statek u Pipků nakládá s osobními údaji zákazníků e-shopu dynovysvet.cz — účel a doba zpracování, zpracovatelé, práva kupujícího a kontakt na správce.",
    },
    en: {
      title: "Privacy policy",
      description:
        "How Statek u Pipků handles the personal data of dynovysvet.cz customers — purpose and duration of processing, processors, your rights and how to reach the controller.",
    },
    de: {
      title: "Datenschutzrichtlinie",
      description:
        "Wie der Statek u Pipků mit personenbezogenen Daten der Kunden von dynovysvet.cz umgeht — Zweck und Dauer der Verarbeitung, Auftragsverarbeiter, Rechte und Kontakt.",
    },
  },
};
