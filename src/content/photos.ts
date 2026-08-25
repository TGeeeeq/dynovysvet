import type { Photo } from "@/components/ui/PhotoStrip";

/**
 * Fotky ze statku. Zdroj jsou snímky ze starého webu, prohnané společným
 * gradingem. Alt texty píšeme pořádně — na Webnode byly všechny prázdné.
 *
 * Až dorazí fotky od fotografa, vymění se tady soubory a alt texty
 * zůstanou; layout se kvůli tomu nemusí sahat.
 */

const W = 1920;
const H32 = 1271;
const H43 = 1440;

export const FARM_PHOTOS: readonly Photo[] = [
  {
    base: "dsc_0683",
    alt: "Hromada oranžových a bílých dýní opřená o cihlovou zeď statku, vedle stojí staré dřevěné kolo od vozu.",
    caption: "Dvůr statku na konci září.",
    width: W, height: H32,
  },
  {
    base: "img_20220930_135328_resized_20220930_020047533",
    alt: "Vysoká pyramida poskládaná z oranžových dýní, na jejím vrcholu vlaje česká vlajka.",
    caption: "Dýňová pyramida — staví se každý rok znovu.",
    width: W, height: H43,
  },
  {
    base: "dsc_0285",
    alt: "Zlatý retrívr sedí uprostřed pole plného oranžových dýní.",
    caption: "Pole těsně před sklizní.",
    width: W, height: H32,
  },
  {
    base: "dsc_0835-2",
    alt: "Výstavní regál ve stodole s dýněmi různých tvarů a barev, u každé je popiska.",
    caption: "Regály ve stodole. U každé odrůdy je napsáno, na co se hodí.",
    width: W, height: H32,
  },
  {
    base: "dsc_0630",
    alt: "Detail žlutého květu dýně mezi velkými zelenými listy.",
    caption: "Květ dýně. Z tohohle je za tři měsíce Hokaido.",
    width: W, height: H32,
  },
  {
    base: "img_20220930_135433_resized_20220930_020105510",
    alt: "Traktor táhne dva valníky naložené oranžovými dýněmi po poli.",
    caption: "Sklizeň se sváží po valnících.",
    width: W, height: H43,
  },
] as const;

/** Prostory statku — pro stránku o pronájmu. */
export const VENUE_PHOTOS: readonly Photo[] = [
  {
    base: "dsc_0850",
    alt: "Dlouhý dřevěný stůl v restauraci statku prostřený pro velkou společnost.",
    caption: "Restaurace prostřená na oslavu.",
    width: W, height: H32,
  },
  {
    base: "dsc_0301",
    alt: "Interiér restaurace statku s podzimní dekorací z dýní a šípkových větví na stole.",
    caption: "Podzimní výzdoba z toho, co roste za barákem.",
    width: W, height: H32,
  },
  {
    base: "dsc_0726",
    alt: "Stará hospodářská budova statku s cihlovým zdivem, obrostlá zelení, před ní posekaný trávník.",
    caption: "Zahrada u stodoly.",
    width: W, height: H32,
  },
] as const;

/** Lesní hřiště a školní výlety. */
export const FOREST_PHOTOS: readonly Photo[] = [
  {
    base: "img_7537",
    alt: "Děti přelézají a podlézají kmeny upravené do prolézačky na lesní pasece.",
    caption: "Prvky z upravených smrkových klád na pasece.",
    width: W, height: W,
  },
  {
    base: "img_7557",
    alt: "Skupina dětí v pestrých bundách stojí v kruhu kolem připraveného ohniště na louce.",
    caption: "Než se začnou opékat hadi.",
    width: W, height: W,
  },
  {
    base: "dsc_0256",
    alt: "Děti si hrají na dřevěných atrakcích v zahradě statku mezi vzrostlými stromy.",
    caption: "Přírodní hřiště v zahradě.",
    width: W, height: H32,
  },
  {
    base: "kozlik",
    alt: "Černobílé kůzle si bere krmení přímo z natažené dlaně.",
    caption: "Kozičky berou granule z ruky.",
    width: 1440, height: 1920,
  },
] as const;
