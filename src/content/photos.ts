import type { Photo, PhotoSource } from "@/components/ui/PhotoStrip";
import type { Locale } from "@/lib/i18n/config";

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

const FARM_SRC: readonly PhotoSource[] = [
  {
    base: "dsc_0683",
    alt: {
      cs: "Hromada oranžových a bílých dýní opřená o cihlovou zeď statku, vedle stojí staré dřevěné kolo od vozu.",
      en: "A heap of orange and white pumpkins piled against the brick wall of the farmhouse, an old wooden cartwheel beside them.",
      de: "Ein Haufen orangefarbener und weißer Kürbisse an der Ziegelwand des Hofes, daneben ein altes Holzwagenrad.",
    },
    caption: {
      cs: "Dvůr statku na konci září.",
      en: "The farmyard at the end of September.",
      de: "Der Hof Ende September.",
    },
    width: W, height: H32,
  },
  {
    base: "img_20220930_135328_resized_20220930_020047533",
    alt: {
      cs: "Vysoká pyramida poskládaná z oranžových dýní, na jejím vrcholu vlaje česká vlajka.",
      en: "A tall pyramid stacked from orange pumpkins with a Czech flag flying on top.",
      de: "Eine hohe Pyramide aus orangefarbenen Kürbissen, auf der Spitze weht die tschechische Fahne.",
    },
    caption: {
      cs: "Dýňová pyramida — staví se každý rok znovu.",
      en: "The pumpkin pyramid — built again every year.",
      de: "Die Kürbispyramide — jedes Jahr neu gebaut.",
    },
    width: W, height: H43,
  },
  {
    base: "dsc_0285",
    alt: {
      cs: "Zlatý retrívr sedí uprostřed pole plného oranžových dýní.",
      en: "A golden retriever sitting in the middle of a field full of orange pumpkins.",
      de: "Ein Golden Retriever sitzt mitten in einem Feld voller orangefarbener Kürbisse.",
    },
    caption: {
      cs: "Pole těsně před sklizní.",
      en: "The field just before harvest.",
      de: "Das Feld kurz vor der Ernte.",
    },
    width: W, height: H32,
  },
  {
    base: "dsc_0835-2",
    alt: {
      cs: "Výstavní regál ve stodole s dýněmi různých tvarů a barev, u každé je popiska.",
      en: "A display shelf in the barn holding pumpkins of every shape and colour, each with a label.",
      de: "Ein Ausstellungsregal in der Scheune mit Kürbissen in allen Formen und Farben, jeder mit einem Schild.",
    },
    caption: {
      cs: "Regály ve stodole. U každé odrůdy je napsáno, na co se hodí.",
      en: "The shelves in the barn. Every variety says what it is good for.",
      de: "Die Regale in der Scheune. Bei jeder Sorte steht, wofür sie sich eignet.",
    },
    width: W, height: H32,
  },
  {
    base: "dsc_0630",
    alt: {
      cs: "Detail žlutého květu dýně mezi velkými zelenými listy.",
      en: "A close-up of a yellow pumpkin flower among large green leaves.",
      de: "Nahaufnahme einer gelben Kürbisblüte zwischen großen grünen Blättern.",
    },
    caption: {
      cs: "Květ dýně. Z tohohle je za tři měsíce Hokaido.",
      en: "A pumpkin flower. Three months on, this is a Hokkaido.",
      de: "Eine Kürbisblüte. Drei Monate später ist daraus ein Hokkaido.",
    },
    width: W, height: H32,
  },
  {
    base: "dsc_0246",
    alt: {
      cs: "Dýňové pole až k lesu na obzoru, mezi zvadlými listy leží stovky oranžových dýní.",
      en: "A pumpkin field stretching to the forest on the horizon, hundreds of orange pumpkins lying among withered leaves.",
      de: "Ein Kürbisfeld bis zum Wald am Horizont, Hunderte orangefarbener Kürbisse zwischen welkem Laub.",
    },
    caption: {
      cs: "Pole nad statkem pár dní před sklizní.",
      en: "The field above the farm a few days before harvest.",
      de: "Das Feld über dem Hof, wenige Tage vor der Ernte.",
    },
    width: W, height: H32,
  },
  {
    base: "dsc_0628",
    alt: {
      cs: "Zelená pruhovaná dýně dozrává mezi velkými listy, nad ní rozkvetlý žlutý květ.",
      en: "A green striped pumpkin ripening among large leaves, a yellow flower open above it.",
      de: "Ein grün gestreifter Kürbis reift zwischen großen Blättern, darüber eine offene gelbe Blüte.",
    },
    caption: {
      cs: "Květ i plod na jedné rostlině — konec srpna.",
      en: "Flower and fruit on one plant — the end of August.",
      de: "Blüte und Frucht an einer Pflanze — Ende August.",
    },
    width: W, height: H32,
  },
  {
    base: "dsc_0272",
    alt: {
      cs: "Čtyři valníky plné oranžových dýní stojí na louce před statkem, vedle vzrostlý strom.",
      en: "Four trailers full of orange pumpkins standing on the meadow in front of the farm, a mature tree beside them.",
      de: "Vier mit orangefarbenen Kürbissen beladene Anhänger stehen auf der Wiese vor dem Hof, daneben ein alter Baum.",
    },
    caption: {
      cs: "Sklizeň čeká na vyložení.",
      en: "The harvest waiting to be unloaded.",
      de: "Die Ernte wartet aufs Abladen.",
    },
    width: W, height: H32,
  },
  {
    base: "img_20220930_135433_resized_20220930_020105510",
    alt: {
      cs: "Traktor táhne dva valníky naložené oranžovými dýněmi po poli.",
      en: "A tractor pulling two trailers loaded with orange pumpkins across the field.",
      de: "Ein Traktor zieht zwei mit orangefarbenen Kürbissen beladene Anhänger über das Feld.",
    },
    caption: {
      cs: "Sklizeň se sváží po valnících.",
      en: "The harvest comes in on trailers.",
      de: "Die Ernte wird auf Anhängern eingefahren.",
    },
    width: W, height: H43,
  },
] as const;

/** Prostory statku — pro stránku o pronájmu. */
const VENUE_SRC: readonly PhotoSource[] = [
  {
    base: "dsc_0850",
    alt: {
      cs: "Dlouhý dřevěný stůl v restauraci statku prostřený pro velkou společnost.",
      en: "A long wooden table in the farm restaurant, laid for a large party.",
      de: "Ein langer Holztisch im Hofrestaurant, für eine große Gesellschaft gedeckt.",
    },
    caption: {
      cs: "Restaurace prostřená na oslavu.",
      en: "The restaurant laid for a celebration.",
      de: "Das Restaurant für eine Feier gedeckt.",
    },
    width: W, height: H32,
  },
  {
    base: "dsc_0301",
    alt: {
      cs: "Interiér restaurace statku s podzimní dekorací z dýní a šípkových větví na stole.",
      en: "The farm restaurant with an autumn table decoration of pumpkins and rosehip branches.",
      de: "Das Hofrestaurant mit herbstlicher Tischdekoration aus Kürbissen und Hagebuttenzweigen.",
    },
    caption: {
      cs: "Podzimní výzdoba z toho, co roste za barákem.",
      en: "Autumn decoration made from whatever grows out the back.",
      de: "Herbstdeko aus dem, was hinter dem Haus wächst.",
    },
    width: W, height: H32,
  },
  {
    base: "dsc_0726",
    alt: {
      cs: "Stará hospodářská budova statku s cihlovým zdivem, obrostlá zelení, před ní posekaný trávník.",
      en: "An old brick farm building overgrown with greenery, a mown lawn in front of it.",
      de: "Ein altes Wirtschaftsgebäude aus Ziegeln, von Grün überwachsen, davor ein gemähter Rasen.",
    },
    caption: {
      cs: "Zahrada u stodoly.",
      en: "The garden beside the barn.",
      de: "Der Garten an der Scheune.",
    },
    width: W, height: H32,
  },
] as const;

/** Lesní hřiště a školní výlety. */
const FOREST_SRC: readonly PhotoSource[] = [
  {
    base: "img_7537",
    alt: {
      cs: "Děti přelézají a podlézají kmeny upravené do prolézačky na lesní pasece.",
      en: "Children climbing over and under shaped tree trunks on a forest clearing.",
      de: "Kinder klettern über und unter bearbeitete Baumstämme auf einer Waldlichtung.",
    },
    caption: {
      cs: "Prvky z upravených smrkových klád na pasece.",
      en: "Structures made from shaped spruce logs on the clearing.",
      de: "Elemente aus bearbeiteten Fichtenstämmen auf der Lichtung.",
    },
    width: W, height: W,
  },
  {
    base: "img_7557",
    alt: {
      cs: "Skupina dětí v pestrých bundách stojí v kruhu kolem připraveného ohniště na louce.",
      en: "A group of children in bright jackets standing in a circle around a laid fire on the meadow.",
      de: "Eine Gruppe Kinder in bunten Jacken steht im Kreis um eine vorbereitete Feuerstelle auf der Wiese.",
    },
    caption: {
      cs: "Než se začnou opékat hadi.",
      en: "Just before the dough snakes go on the fire.",
      de: "Kurz bevor die Teigschlangen aufs Feuer kommen.",
    },
    width: W, height: W,
  },
  {
    base: "dsc_0256",
    alt: {
      cs: "Děti si hrají na dřevěných atrakcích v zahradě statku mezi vzrostlými stromy.",
      en: "Children playing on the wooden structures in the farm garden among mature trees.",
      de: "Kinder spielen an den Holzgeräten im Hofgarten zwischen alten Bäumen.",
    },
    caption: {
      cs: "Přírodní hřiště v zahradě.",
      en: "The natural playground in the garden.",
      de: "Der Naturspielplatz im Garten.",
    },
    width: W, height: H32,
  },
  {
    base: "kozlik",
    alt: {
      cs: "Černobílé kůzle si bere krmení přímo z natažené dlaně.",
      en: "A black-and-white kid goat taking feed straight from an outstretched palm.",
      de: "Ein schwarz-weißes Zicklein frisst Futter direkt aus der ausgestreckten Hand.",
    },
    caption: {
      cs: "Kozičky berou granule z ruky.",
      en: "The goats take pellets from your hand.",
      de: "Die Ziegen fressen die Pellets aus der Hand.",
    },
    width: 1440, height: 1920,
  },
] as const;

/**
 * Snímky, které se sázejí samostatně — hero, předěly, velké výřezy. Nejsou
 * v žádném pásu, protože fotka přes celou šířku a fotka v karuselu chtějí
 * každá jiný kompoziční prostor.
 */
const SOLO_SRC: readonly PhotoSource[] = [
  {
    base: "dsc_0278-0",
    alt: {
      cs: "Dýňové pole až k obzoru pod modrou oblohou s roztrhanými mraky, tisíce oranžových dýní.",
      en: "A pumpkin field reaching the horizon under a blue sky with broken cloud, thousands of orange pumpkins.",
      de: "Ein Kürbisfeld bis zum Horizont unter blauem Himmel mit aufgerissenen Wolken, Tausende orangefarbener Kürbisse.",
    },
    caption: {
      cs: "Pole u Nové Vsi na konci září.",
      en: "The field at Nová Ves at the end of September.",
      de: "Das Feld bei Nová Ves Ende September.",
    },
    width: W, height: H32,
  },
  {
    base: "img_20180921_175330",
    alt: {
      cs: "Tři pyramidy poskládané z dýní a slámy ve večerním slunci, před nimi stojí strakatý poník.",
      en: "Three pyramids built from pumpkins and straw in the evening sun, a piebald pony standing in front of them.",
      de: "Drei Pyramiden aus Kürbissen und Stroh in der Abendsonne, davor steht ein geschecktes Pony.",
    },
    caption: {
      cs: "Pyramidy se staví každý rok znovu. Poník na to dohlíží.",
      en: "The pyramids are built again every year. The pony supervises.",
      de: "Die Pyramiden werden jedes Jahr neu gebaut. Das Pony beaufsichtigt das.",
    },
    width: W, height: H43,
  },
] as const;

/**
 * Alt texty existují ve všech třech jazycích. Popisek toho, co je na fotce
 * vidět, je informace jako každá jiná — česká čtečka obrazovky nemá číst
 * anglickou větu a naopak.
 */
function localise(list: readonly PhotoSource[], locale: Locale): Photo[] {
  return list.map((p) => ({
    base: p.base,
    width: p.width,
    height: p.height,
    alt: p.alt[locale],
    caption: p.caption?.[locale],
  }));
}

export const farmPhotos = (locale: Locale) => localise(FARM_SRC, locale);
export const venuePhotos = (locale: Locale) => localise(VENUE_SRC, locale);
export const forestPhotos = (locale: Locale) => localise(FOREST_SRC, locale);

const ALL_SRC: readonly PhotoSource[] = [...FARM_SRC, ...VENUE_SRC, ...FOREST_SRC, ...SOLO_SRC];

/**
 * Jedna konkrétní fotka podle názvu souboru — pro místa, kam se sází ručně
 * vybraný snímek (hero, předěly sekcí), ne celý pás.
 *
 * Vyhazuje výjimku, ne `undefined`. Překlep v názvu souboru se má projevit
 * při buildu, ne dírou ve stránce na produkci.
 */
export function photo(base: string, locale: Locale): Photo {
  const src = ALL_SRC.find((p) => p.base === base);
  if (!src) throw new Error(`Fotka „${base}" v src/content/photos.ts není.`);
  return localise([src], locale)[0];
}
