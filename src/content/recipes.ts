/**
 * Recepty přepsané ze starého webu (dynovysvet.cz/recepty-varime-z-dyni).
 * Text je majitelčin — schválně se nezkracuje ani „nevylepšuje“: je to
 * hlas statku a zároveň to nejlepší, co web má pro vyhledávače.
 */

export interface Recipe {
  /** Ze jména, bez diakritiky, oddělené pomlčkami. */
  slug: string;
  name: string;
  /** Úvodní věta autorky, pokud ji recept má. */
  intro?: string;
  /** Rozdělené položky; prázdné pole, když recept suroviny neuvádí. */
  ingredients: string[];
  /** Odstavce postupu. */
  steps: string[];
}

export const RECIPES: Recipe[] = [
  {
    slug: "dynova-polevka",
    name: "Dýňová polévka",
    intro:
      "Takhle se vaří dýňová polévka ve Švýcarsku a na Vysočině. Dýňová polévka je moc dobrá, myslíme si, že Vás mile překvapí.",
    ingredients: [
      "1 lžíce oleje nebo másla",
      "1 menší cibule",
      "1/2 kávové lžičky kari",
      "50 dkg dužiny z dýně",
      "1 - 2 brambory",
      "1 l zeleninového bujonu",
      "1dcl smetany",
      "sůl, pepř",
    ],
    steps: [
      "Na drobno nakrájenou cibuli osmahneme, přidáme na kostičky nakrájenou dýni a brambory, lehce osmahneme a zalijeme bujonem a vaříme 20- 30 min. Rozmixujeme, ještě jednou přivedeme k varu, přidáme smetanu, popřípadě dochutíme solí a pepřem.",
    ],
  },
  {
    slug: "celerova-polevka",
    name: "Celerová polévka",
    ingredients: [],
    steps: [
      "Na způsob dýňové polévky vaříme naší oblíbenou celerovou polévku \"Akceleračku\". Pouze nahradíte dýni celerem.",
      "Dobrou chuť!",
    ],
  },
  {
    slug: "kandovana-dyne",
    name: "Kandovaná dýně",
    ingredients: [],
    steps: [
      "Recept 1:",
      "2 kg dýně nakrájené na kostky 1 x 1 cm smícháme s 0,75 kg cukru a necháme odležet do druhého dne. Druhý den přidáme tresť + sirup či džus, dvě kávové lžičky kyseliny citronové, přivedeme k varu a odstavíme a opět necháme odležet. Třetí den scedíme. Šťávu použijeme jako sirup a dýní usušíme.",
      "Recept 2: Dýně, 1 l vody, 1 kg cukru. Povaříme dýni až \"zesklovatí\", poté necháme odležet do druhého dne. Přecedíme a necháme hodně okapat. Dýni usušíme.",
    ],
  },
  {
    slug: "cuketova-polevka",
    name: "Cuketová polévka",
    ingredients: [],
    steps: [
      "Na tuku osmahneme cibulku, zasypeme na zahuštění krupičkou. Na krupičnou jíšku s cibulkou přidáme na kostičky nakrájenou cuketu. Zalijeme vodou, přidáme zeleninový bujon, trochu opepříme. Necháme vařit, za cca 15 min. poté rozmixujeme a dle chuti osolíme. Do polévky si můžeme dát osmahnuté kostičky chleba nebo housky.",
      "Výborná polévka, naše oblíbená, doporučuji.",
    ],
  },
  {
    slug: "plnene-cukety-ci-rondini",
    name: "Plněné cukety či rondini",
    ingredients: [],
    steps: [
      "Rondini okrájíte, rozpůlíte a z půlek vydlabete jadřinec. Takto připravená rondini plníme masovou směsí. V případě cukety vydlabaný střed přimícháme k masové směsi (cukety sklízíme vždy mlaďoučké a křehké, tak se dá konzumovat celá a nemá velká tuhá semínka). Stačí třeba jen osmahnout cibulku, na ní osmahnout mleté maso, přidáme koření dle chuti (čubrica, koření na mletá masa, apod.). Když máme rondini naplněná, položíme na ně plátek rajčete a plátek sýra. Rondini poskládáme na tukem vymazaný pekáček nebo do zapékací misky. (Stejně tak můžete připravit i cuketu).",
      "Rondini jsou dobrá také jen osmahnutá na pánvi (jako příloha) k masu. To nakrájená rondini jen posypu Aromatem, osolím nebo okořením grilovacím kořením na zeleninu.",
    ],
  },
  {
    slug: "grilovana-cuketa-rondini-dyne",
    name: "Grilovaná cuketa, rondini, dýně",
    ingredients: [],
    steps: [
      "Máte rádi grilování? Pokud jste ještě nezkusili, výborná je grilovaná dýně, cuketa či rondiny. Nakrájené stačí jen posypat Aromatem nebo jen solí a pak už jen grilovat. Rychlé a výborné.",
    ],
  },
  {
    slug: "cuketova-babovka",
    name: "Cuketová bábovka",
    intro:
      "A ještě jeden sladký recept z cukety, který nesmím opomenout. Peču pravidelně v sezóně cuket a je opravdu výborná.",
    ingredients: [
      "3 vejce",
      "20 dkg cukru",
      "30 dkg polohrubé mouky",
      "40 dkg najemno nastrouhané cukety",
      "1 lžička skořice",
      "2 lžíce kakaa",
      "2 dcl oleje",
      "1 vanilkový cukr, 1 prášek do pečiva",
    ],
    steps: [],
  },
  {
    slug: "pernik-s-cuketou-jako-dech-nadychany-a-vlacny",
    name: "Perník s cuketou (\"jako dech\" nadýchaný a vláčný)",
    ingredients: [
      "13 dkg žitné mouky celozrnné",
      "26 dkg pšeničné mouky celozrnné",
      "nebo místo výše uvedených 40 dkg hladké mouky",
      "3/4 hrnku oleje",
      "3 vejce",
      "70 dkg jemně nastrouhané cukety",
      "1 lžička sody",
      "1 prášek do perníku",
      "2-3 lžíce kakaa",
      "špetka soli",
      "citronová kůra",
      "může být navíc 2 lžičky perníkového koření",
    ],
    steps: [
      "Smícháme tekuté suroviny a cuketu, potom přidáme sypké.",
    ],
  },
  {
    slug: "sladky-zapeceny-acorn-recept-z-texasu",
    name: "Sladký zapečený Acorn - recept z Texasu",
    ingredients: [],
    steps: [
      "Dýni Table Ace nebo jakýkoliv jiný Acorn rozřízneme přes na dvě poloviny a vydlabeme jadřinec, neokrajujeme. Poté zmačkáním alobalu vytvoříme lůžka pro 2 \"mističky\", které vzniknou z dýně. Dýni posypeme třtinovým cukrem (může být i krystal), dále vložíme kousek másla a polijeme javorovým sirupem (místo sirupu dávám větší lžičku medu). Můžeme posypat skořicí (dávám skořicový cukr). Takto připravenou dýni dáme na plech a pečeme cca 30 - 40 minut. Hotovou dýni servírujeme a vybíráme lžičkou. Ideální pochoutka pro milovníky sladkého, která zahřeje.",
    ],
  },
  {
    slug: "skvele-dynove-muffiny",
    name: "Skvělé dýňové muffiny",
    intro:
      "cca 12 velkých muffins",
    ingredients: [
      "150 g másla měkkého",
      "150 g třtinový cukr",
      "2 vejce",
      "180 g celozrnné mouky",
      "150g mletých mandlí",
      "1 lžička kypřícího prášku",
      "1 vanilkový cukr",
      "1 lžička mleté skořice",
      "špetka mletého zázvoru",
      "80 g nasekané datle nebo sušené brusinky",
      "230 g dýňová dužina",
      "Nastrouhaná kůra z pomeranče",
      "Máslo na vymazání formiček nebo stačí papírové formičky na muffins",
    ],
    steps: [
      "Předehřejte troubu na 180 stupňů",
      "Dýňová syrová dužina nastrouhaná najemno. Pečící formičky vytřít.",
      "Máslo s cukrem našlehat a poté postupně zašlehat vejce. Přidejte zbývající přísady - bez dýně - Mix, zamíchat do máslové směsi. Přidat strouhanou dýni. Nalijte těsto do připravených formiček.",
      "Muffiny péct v předehřáté troubě na středním roštu. Pečeme při 180 stupních 25 až 30minut. Poté vyzkoušíme, zda propečené. Maffiny vyndáme z formiček a pocukrujeme moučkovým cukrem nebo necháváme v papírových formičkách a podáváme pocukrované.",
    ],
  },
  {
    slug: "nezavarovany-kompot-z-dyne",
    name: "Nezavařovaný kompot z dýně",
    ingredients: [],
    steps: [
      "Studený kompot připravíme tak, že nakrájíme 1,5 kg dýně na kostky. Zalijeme 1,5 literm vody, vymačkáme šťávu ze dvou citrónů a přidáme 1/2 lžičky kyseliny citrónové. Takto naloženou dýni necháme 3 - 12 hodin odležet. Poté svaříme s 30 dkg curu, přidáme 4 kusy hřebíčku a 1 kus celé skořice (dobře funguje i sáček kořenící směsi na svařák, kde je ještě navíc badyán). Vařila jsem pozvolna zhruba 20 minut (až se vidlička vnoří do kostky dýně a necítíme, že je tvrdá, zároveň nemá být dýně rozvařená). Kompot necháme vychladit a podáváme. Je chutný a osvěžující.",
    ],
  },
  {
    slug: "patizonovy-mozecek",
    name: "Patizonový \"mozeček\"",
    ingredients: [],
    steps: [
      "Na tuku osmahneme cibulku, přidáme nahrubo nastrouhaný patizon, osolíme, opepříme, dle potřeby podlijeme zeleninovým bujonem a dusíme do měkka. Tekutinu vydusíme a vmícháme vajíčko. Krátce mícháme a \"patizonový mozeček\" je hotový. Vylepšit můžeme v průběhu houbařské sezony tím, že dusíme patizon společně s nakrájenými čerstvými houbami.",
    ],
  },
  {
    slug: "salat-z-topinambur",
    name: "Salát z topinambur",
    intro:
      "V minulosti jsme pěstovali několik let topinambury. Uvádím zde recept na velice chutný salát z topinambur.",
    ingredients: [],
    steps: [
      "Omyté topinambury okrájíme, nastrouháme část na hrubém a část na jemném struhadle a ihned vmícháme trochu vody s octem (to proto, aby topinambury nezhnědly). Poté si připravíme zálivku ze smetany, koření do salátu (dle chuti), sůl, trochu propasírovaného česneku. Do salátu přidáme nasekané vlašské ořechy a zalijeme zálivkou a promícháme. Tento salát je osvěžující a skvěle chutná.",
    ],
  },
  {
    slug: "dynova-seminka-sladko-pikantni",
    name: "Dýňová semínka - sladko/pikantní",
    ingredients: [
      "semínka z jedné dýně",
      "5 lžící krupicového cukru",
      "¼ lžičky soli",
      "¼ lžičky mletého kmínu",
      "¼ lžičky skořice",
      "špetka chilli koření",
      "trocha oleje",
      "(můžete přidat také ¼ lžičky zázvoru)",
    ],
    steps: [
      "V míse promíchejte 3 lžíce krupicového cukru, ¼ lžičky soli, ¼ lžičky mletého kmínu, ¼ lžičky skořice a špetku chilli koření. Ve velké pánvi s nepřilnavým povrchem rozpalte cca 1½ lžíce oleje, vhoďte do něj semínka z jedné dýně, přidejte 2 lžíce krupicového cukru a míchejte asi minutu, až se začne cukr rozpouštět a semínka karamelizovat. Pak je přesuňte do mísy s kořením a pořádně promíchejte. Nechte vychladit.",
    ],
  },
  {
    slug: "dynova-seminka-slane-mlsani",
    name: "Dýňová semínka - slané mlsání",
    intro:
      "Jde o to, jaká semínka máte.",
    ingredients: [],
    steps: [
      "Pokud máte semínka z dýně olejné (nahosemenná odrůda), máte tmavě zelená semínka bez dřevnatých slupek. Tato semena dýně namočíte na 24 hodin do slaného nálevu (svaříte vodu se solí, jeden díl soli a dva díly vody). Po 24 hodinách semínka vyjmete a necháte usušit. Můžete konzumovat.",
      "Pokud máte dýňová semena z jakékoli jiné jedlé dýně, postup s namočením do slaného nálevu je stejný. Po vyjmutí z nálevu a usušení pražíme. Pražením se stane tvrdá slupka dýňových semen křehkou. Dáte do trouby na vysokou teplotu a hlídáte. Stačí, když semínka lehce zrůžoví. (Takové mlsání je pak bohaté na vlákninu).",
    ],
  },
  {
    slug: "pecena-dyne-typu-hokaido",
    name: "Pečená dýně typu hokaido",
    ingredients: [],
    steps: [
      "Dýně Hokaido na plátky i se slupkou se dá péct na plech. Autorka receptu peče dýni na másle, já to zkusila na oleji, lze i na sucho na pečícím papíře. Plátky dýně se osolí, mohou se posypat různým kořením, například rozmarýnem, někdo sype kmínem. Zkusila jsem i variantu bez koření. Brzy hotové, jednoduché a moc dobré (je vhodné i jako příloha k masu se šťávou). Doporučuji.",
    ],
  },
  {
    slug: "dynovy-kolac",
    name: "Dýňový koláč",
    intro:
      "Doporučuji! Lehký koláč, není přeslazený a těsto je křehké. Jednoduchá příprava.",
    ingredients: [
      "400 g dýně",
      "3 jablka",
      "citronová kůra",
      "skořice",
      "sůl",
      "mandle",
      "150 g hladké mouky",
      "90 g másla",
      "1 lžička prášku do pečiva",
    ],
    steps: [
      "Dýni a jablka oloupeme, nakrájíme na kousky. Nepatrně podlijeme vodou, podusíme, podle chuti přidáme cukr, citronovou šťávu, skořici a uvaříme hustší kaši. Z mouky, másla, špetky soli, prášku do pečiva a asi 3 lžic studené vody uhněteme těsto, které naplníme do vymazané a vysypané koláčové formy, přidáme dýňovou kaši, posypeme spařenými oloupanými mandlemi a ve vyhřáté troubě upečeme.",
    ],
  },
  {
    slug: "dynovy-dzus",
    name: "Dýňový džus",
    intro:
      "Zastavovali se u nás lidé a chtěli velké dýně na dýňový džus. Nedalo nám to a vyzkoušeli jsme recept také. Osvěžujícím džusem jsme zásobili celou rodina a návštěvám také chutnal.",
    ingredients: [
      "6 kg dýně na velké kostky",
      "1 kg cukru",
      "4 cl citronové šťávy",
      "3 lžíce kyseliny citronové",
      "4 l vody",
    ],
    steps: [
      "Vše necháme stát v hrnci do dalšího dne a pak vaříme do změknutí (cca 30 minut). Vychladlou směs rozmixujeme, smícháme s 10 litry převařené vody a přidáme 1 pomerančový ovocit (podle chuti možná méně). Zamícháme, přecedíme přes sítko a plníme do lahví (my skladujeme džus ve smaltovaném kbelíku). Uchováme v chladu (chladničce) - vydrží cca týden nebo sterilizujeme (to jsme nezkoušeli) 20 minut na 80 C a pak prý vydrží i rok.",
    ],
  },
  {
    slug: "privarok",
    name: "\"Prívarok\"",
    intro:
      "Recept pochází z Maďarska - výborné jako příloha k masu se šťávou (ala přírodní řízky).",
    ingredients: [],
    steps: [
      "Najemno nakrájená cibulka se osmahne.",
      "Přidá se nastrouhaná dýně (půl najemno, půl nahrubo), která se před tím vyždíme (dle typu dýně - některé dýně v sobě tolik vody nemají - například vhodná maďarská modrá tykev).",
      "Zalijeme mlékem zasypaným červenou sladkou paprikou. Necháme zhruba 10 minut dusit (můžeme i trochu zahustit moukou, ne moc).",
      "Když je dýně udušená ( nesmí to plavat, spíše husté, konzistence kaše), přidáme nasekaný kopr a dle chuti osolíme.",
    ],
  },
  {
    slug: "slany-dynovy-nakyp",
    name: "Slaný dýňový nákyp",
    intro:
      "(výborné jídlo i pro ty, kteří dýni moc nemusí - bezvadně se schová)",
    ingredients: [
      "3 hrnky nastrouhané dýně",
      "1 hrnek mouky",
      "150 g strouhaného eidamu",
      "1 velká cibule - nadrobno nakrájená",
      "150 g uzeného bůčku (nebo nějaké uzeniny) - nakrájet na drobné kostičky",
      "½ prášku do pečiva",
      "3 vejce",
      "3 stroužky česneku",
      "sůl, pepř, majoránka, pažitka, petržel",
    ],
    steps: [
      "Vše smícháme, vlijeme do vymazaného a vysypaného plechu a pečeme dozlatova. Můžeme konzumovat teplé i za studena.",
    ],
  },
  {
    slug: "dynova-marmelada-s-citrusy",
    name: "Dýňová marmeláda s citrusy",
    ingredients: [
      "2 kg dýně",
      "2 pomeranče",
      "3 citróny",
      "1 l vody",
      "půl lžičky strouhaného zázvoru",
      "1000 g želírovacího cukru",
    ],
    steps: [
      "Dýni oloupeme, zbavíme jader a nakrájíme na kostičky. Citrony i pomeranče dobře omyjeme a nakrájíme je na půlměsíčky. Vše vložíme do vody, přidáme zázvor a společně vaříme zhruba 25 minut. Pak vyjmeme citrusové slupky a směs rozmixujeme. Přisypeme želírovací cukr a 10 minut vaříme. Plníme za horka do čistých skleniček, uzavřeme a otočíme dnem vzhůru.",
      "90 minut",
    ],
  },
  {
    slug: "dynova-buchta",
    name: "Dýňová buchta",
    intro:
      "Množství na jeden hluboký plech (tedy pro velkou společnost). Lze udělat z jakékoliv dýně, ale nejlepší je dýně olejná, protože můžeme její semena použít do těsta místo ořechů.",
    ingredients: [
      "500 g dýně",
      "150 g dýňových semen nebo ořechů",
      "kůra z jednoho pomeranče - nastrouhaná",
      "3 vejce",
      "350 g cukru",
      "3 dl oleje",
      "500 kg mouky",
      "1 prášek do pečiva",
      "1 vanilkový cukr",
      "1 lžička skořice",
      "½ lžičky jedlé sody",
    ],
    steps: [
      "Dužninu dýně rozmixujeme s olejem ( je možné také dýni najemno nastrouhat) a smícháme se vším ostatním. Nalijeme do vymaštěného a vysypaného plechu a pečeme. Upečené můžeme polít čokoládovou polevou.",
    ],
  },
];
