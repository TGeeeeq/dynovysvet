/**
 * Rady k pěstování a skladování dýní ze starého webu
 * (dynovysvet.cz/rady-a-tipy-na-pestovani-dyni). Přepsáno beze změn —
 * jsou to zkušenosti z konkrétní zahrady, ne obecná příručka.
 */

export interface GrowingSection {
  title: string;
  items: string[];
}

/** Věta, kterou stránka začíná. */
export const GROWING_INTRO =
  "Semena dovážíme od švýcarského a německého dodavatele, u kterých se nám osvědčila kvalita osiva.";

export const GROWING: GrowingSection[] = [
  {
    title: "Pěstování dýní",
    items: [
      "Rostliny můžete předpěstovat - vyhnete se většímu zaplevelení.",
      "Sazenice do země dáváme až po zmrzlých (to je na konci května). Semena by tedy mělo stačit dát do sadbovačů přibližně ve druhé polovině dubna.",
      "U výsevu přímo do země je však menší nebezpečí zaschnutí rostliny.",
      "Důsledně likvidujte kolem mladých rostlin plevel.",
      "Dodržujte mezi jednotlivými rostlinami vzdálenost zhruba 1 x 2 m.",
      "Sazenice je vhodné přihnojit.",
      "Pokud chcete pěstovat určitý druh dýně na semeno, neměla by být v okruhu 800 m jiná dýně. Dýně se spráší a další rok Vám může vyrůst něco jiného.",
    ],
  },
  {
    title: "Uskladnění dýní",
    items: [
      "máme dobrou zkušenost s uskladněním dýní od chvíle sklizně - do prostoru se stále stejnou teplotou",
      "přes zimu nám nejdéle vydrží na světle a v suchu při teplotě do 15 °C",
      "dobré výsledky máme také při skladování v bytě na oknech, zde pouze u dýní postupně sesychá dužina uvnitř, ale to se projeví až při dlouhodobém skladování, například v květnu až červnu příštího roku",
      "doba uskladnění závisí také na druhu dýně",
    ],
  },
  {
    title: "Tipy na prodloužení \"životnosti\" vydlabané dýně na Halloween",
    items: [
      "dýni vystavit venku v chladu",
      "vysušit dýni například kuchyňskou papírovou utěrkou",
      "ošetřit vnitřek dýně octem nebo kyselinou citronovou (zabrání plesnivění)",
      "vystříkat lakem na vlasy",
      "vymazat dýni vazelínou (má zabránit plísni a zcvrkávání)",
    ],
  },
];
