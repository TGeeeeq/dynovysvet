import type { Line } from "./types";

export const CONTACT = {
  kicker: {
    cs: "Nová Ves u Leštiny · Vysočina",
    en: "Nová Ves u Leštiny · Bohemian-Moravian Highlands",
    de: "Nová Ves u Leštiny · Böhmisch-Mährische Höhe",
  },
  title: {
    cs: "Dostanete se k nám autem i vlakem",
    en: "You can reach us by car and by train",
    de: "Sie erreichen uns mit dem Auto und mit der Bahn",
  },
  byTrain: { cs: "Vlakem", en: "By train", de: "Mit der Bahn" },
  byTrainText: {
    cs: "Přímo v Nové Vsi u Leštiny je vlaková zastávka. Ujdete pár metrů do kopce a jste u nás na statku.",
    en: "There is a railway stop right in Nová Ves u Leštiny. A few metres uphill and you are at the farm.",
    de: "Direkt in Nová Ves u Leštiny gibt es eine Bahnhaltestelle. Ein paar Meter bergauf und Sie sind auf dem Hof.",
  },
  byCar: { cs: "Autem", en: "By car", de: "Mit dem Auto" },
  byCarText: {
    cs: "Parkování je označené směrovými tabulemi, cca 50 m od statku. Zdarma.",
    en: "Parking is signposted, about 50 m from the farm. Free of charge.",
    de: "Der Parkplatz ist ausgeschildert, etwa 50 m vom Hof entfernt. Kostenlos.",
  },
  coordinates: { cs: "Souřadnice", en: "Coordinates", de: "Koordinaten" },
  coordFarm: { cs: "statek", en: "farm", de: "Hof" },
  coordParking: { cs: "parkoviště", en: "car park", de: "Parkplatz" },
  wifi: { cs: "Wi-Fi", en: "Wi-Fi", de: "WLAN" },
  wifiText: {
    cs: "V celém areálu zdarma.",
    en: "Free across the whole site.",
    de: "Auf dem gesamten Gelände kostenlos.",
  },
  mapTitle: {
    cs: "Mapa — Statek u Pipků, Nová Ves u Leštiny 5",
    en: "Map — Statek u Pipků, Nová Ves u Leštiny 5",
    de: "Karte — Statek u Pipků, Nová Ves u Leštiny 5",
  },
  mapOpen: {
    cs: "Otevřít mapu ve větším",
    en: "Open a larger map",
    de: "Größere Karte öffnen",
  },

  formTitle: { cs: "Napište nám", en: "Write to us", de: "Schreiben Sie uns" },
  formLead: {
    cs: "Na e-maily odpovídáme obvykle do druhého dne. Když spěcháte, zavolejte.",
    en: "We usually answer emails by the next day. If it is urgent, call us.",
    de: "E-Mails beantworten wir meist bis zum nächsten Tag. Wenn es eilt, rufen Sie an.",
  },
  formMessageLabel: { cs: "Zpráva", en: "Message", de: "Nachricht" },
  formSubmit: { cs: "Odeslat", en: "Send", de: "Absenden" },

  billingTitle: { cs: "Fakturační údaje", en: "Billing details", de: "Rechnungsdaten" },
  billingOperator: { cs: "Provozovatel", en: "Operator", de: "Betreiber" },
  billingSeat: { cs: "Sídlo", en: "Registered address", de: "Sitz" },
  billingBank: { cs: "Bankovní účet", en: "Bank account", de: "Bankverbindung" },
  billingForest: { cs: "Lesní programy", en: "Forest programmes", de: "Waldprogramme" },
  idNo: { cs: "IČ", en: "ID No.", de: "IdNr." },
  idNoAssoc: { cs: "IČO", en: "ID No.", de: "IdNr." },
} as const satisfies Record<string, Line>;
