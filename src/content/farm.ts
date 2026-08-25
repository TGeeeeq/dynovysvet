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

/** Zvířata mají jména a to je půlka kouzla toho místa. */
export const ANIMALS = [
  { name: "Black", kind: "kůň", note: "Starší z dvojice koní." },
  { name: "Natin", kind: "kůň", note: "Chodí vždycky kousek za Blackem." },
  { name: "Princezna", kind: "poník", note: "Nejmenší, a ví o tom." },
  { name: "Žofka", kind: "telátko", note: "Bydlí ve stodole." },
  { name: "Kirbinka", kind: "pes", note: "Canisterapeutka. Umí být hodně trpělivá." },
  { name: "Šumavanky", kind: "slepičky", note: "Pobíhají po zahradě." },
  { name: "kozičky", kind: "zakrslé kozy", note: "Berou si granule přímo z ruky." },
  { name: "ovečky", kind: "ovce", note: "" },
  { name: "prasátka", kind: "prasata", note: "" },
  { name: "králíci", kind: "velcí králíci", note: "Ve stodole vedle Žofky." },
] as const;

/** Co na statku je — z původního textu, jen rozdělené na položky. */
export const ATTRACTIONS = [
  {
    title: "Slámohrad a slámobazén",
    text: "Ve stodole stavíme každý rok hrad ze slaměných balíků. Vedle něj je slámobazén, ze kterého se děti nedají dostat ven.",
  },
  {
    title: "Výstava odrůd",
    text: "Ve dvoře a v zahradě máme vystavené druhy dýní, které pěstujeme. U každé je popiska s názvem a na co se hodí.",
  },
  {
    title: "Kombajn",
    text: "V zahradě stojí kombajn. Dá se na něj vylézt a sednout si za volant.",
  },
  {
    title: "Zvířata",
    text: "Kozičky, ovečky, koně Black a Natin, poník Princezna, telátko Žofka, prasátka a velcí králíci.",
  },
  {
    title: "Prodej dýní",
    text: "Dýně na dekoraci, na vaření i na vyřezávání na Halloween. Vybíráte přímo z regálů ve stodole.",
  },
  {
    title: "Přírodní hřiště",
    text: "Zahrada s dřevěnými atrakcemi, průlezy a probíhačkami mezi dýněmi.",
  },
] as const;

/** Praktické informace, které lidé hledají jako první. */
export const PRACTICAL = [
  { label: "Parkoviště", value: "Zdarma, cca 50 m od statku, značeno směrovkami." },
  { label: "Vlakem", value: "Zastávka Nová Ves u Leštiny je 200 m od statku. Pár metrů do kopce a jste tady." },
  { label: "Pes", value: "Vstup se psem povolen, vstupné 10 Kč." },
  { label: "Wi-Fi", value: "V celém areálu zdarma." },
  { label: "Platba na místě", value: "Hotově nebo QR platbou. Kartou na statku bohužel ne." },
  { label: "Toalety", value: "Dámské, pánské i bezbariérové, ve dvoře." },
] as const;

export const RULES = [
  "Vstup do areálu je na vlastní nebezpečí.",
  "Dítě pouze v doprovodu a za dohledu dospělé osoby.",
] as const;
