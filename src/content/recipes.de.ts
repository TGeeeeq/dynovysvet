/**
 * Deutsche Übersetzung von `recipes.ts`.
 *
 * Die `slug`-Werte sind sprachübergreifende Schlüssel — sie dürfen weder
 * übersetzt noch umsortiert werden. Dieses Array muss dieselbe Länge und
 * dieselbe Reihenfolge wie `RECIPES` haben, und jedes Rezept muss genauso
 * viele `ingredients`- und `steps`-Einträge enthalten wie die tschechische
 * Vorlage.
 *
 * Tschechische Küchenmaße sind in gängige metrische Einheiten umgerechnet
 * (dkg → g, dcl → ml, lžíce → EL, kávová lžička → TL). Temperaturen bleiben
 * in °C; es wird nichts in imperiale Einheiten umgerechnet.
 */

import type { Recipe } from "./recipes";

export const RECIPES_DE: Recipe[] = [
  {
    slug: "dynova-polevka",
    name: "Kürbissuppe",
    intro:
      "So kocht man Kürbissuppe in der Schweiz und in der Region Vysočina (Böhmisch-Mährische Höhe). Kürbissuppe ist sehr gut, wir denken, sie wird Sie angenehm überraschen.",
    ingredients: [
      "1 EL Öl oder Butter",
      "1 kleinere Zwiebel",
      "1/2 TL Curry",
      "500 g Kürbisfleisch",
      "1 - 2 Kartoffeln",
      "1 l Gemüsebrühe",
      "100 ml Sahne",
      "Salz, Pfeffer",
    ],
    steps: [
      "Die fein gehackte Zwiebel anbraten, den in Würfel geschnittenen Kürbis und die Kartoffeln dazugeben, leicht anbraten, mit der Brühe aufgießen und 20 - 30 Min. kochen. Pürieren, noch einmal aufkochen lassen, die Sahne dazugeben und gegebenenfalls mit Salz und Pfeffer abschmecken.",
    ],
  },
  {
    slug: "celerova-polevka",
    name: "Selleriesuppe",
    ingredients: [],
    steps: [
      "Nach Art der Kürbissuppe kochen wir unsere Lieblings-Selleriesuppe, die „Akceleračka“. Sie ersetzen einfach den Kürbis durch Sellerie.",
      "Guten Appetit!",
    ],
  },
  {
    slug: "kandovana-dyne",
    name: "Kandierter Kürbis",
    ingredients: [],
    steps: [
      "Rezept 1:",
      "2 kg in 1 x 1 cm große Würfel geschnittenen Kürbis mit 0,75 kg Zucker vermischen und bis zum nächsten Tag ruhen lassen. Am zweiten Tag Essenz + Sirup oder Saft und zwei TL Zitronensäure dazugeben, aufkochen, vom Herd nehmen und wieder ruhen lassen. Am dritten Tag abseihen. Den Saft als Sirup verwenden und den Kürbis trocknen.",
      "Rezept 2: Kürbis, 1 l Wasser, 1 kg Zucker. Den Kürbis kochen, bis er „glasig“ wird, dann bis zum nächsten Tag ruhen lassen. Abseihen und gut abtropfen lassen. Den Kürbis trocknen.",
    ],
  },
  {
    slug: "cuketova-polevka",
    name: "Zucchinisuppe",
    ingredients: [],
    steps: [
      "Im Fett die Zwiebel anbraten und zum Andicken mit Grieß bestäuben. Zu der Grießeinbrenne mit der Zwiebel die in Würfel geschnittene Zucchini geben. Mit Wasser aufgießen, Gemüsebrühe dazugeben, etwas pfeffern. Kochen lassen, nach ca. 15 Min. pürieren und nach Geschmack salzen. In die Suppe können wir geröstete Brot- oder Semmelwürfel geben.",
      "Eine ausgezeichnete Suppe, unsere Lieblingssuppe, ich empfehle sie.",
    ],
  },
  {
    slug: "plnene-cukety-ci-rondini",
    name: "Gefüllte Zucchini oder Rondini",
    ingredients: [],
    steps: [
      "Die Rondini schälen, halbieren und aus den Hälften das Kerngehäuse aushöhlen. Die so vorbereiteten Rondini füllen wir mit einer Fleischmischung. Bei Zucchini mischen wir das ausgehöhlte Innere unter die Fleischmischung (Zucchini ernten wir immer ganz jung und zart, so kann man sie ganz verzehren und sie hat keine großen harten Kerne). Es genügt zum Beispiel, nur eine Zwiebel anzubraten, darauf Hackfleisch anzubraten und Gewürze nach Geschmack dazuzugeben (Čubrica, Hackfleischgewürz und Ähnliches). Wenn die Rondini gefüllt sind, legen wir eine Tomatenscheibe und eine Käsescheibe darauf. Die Rondini setzen wir in eine gefettete Bratform oder in eine Auflaufform. (Genauso können Sie auch Zucchini zubereiten.)",
      "Rondini sind auch gut, wenn sie nur in der Pfanne angebraten werden (als Beilage) zu Fleisch. Da bestreue ich die geschnittenen Rondini nur mit Aromat, salze sie oder würze sie mit Grillgewürz für Gemüse.",
    ],
  },
  {
    slug: "grilovana-cuketa-rondini-dyne",
    name: "Gegrillte Zucchini, Rondini, Kürbis",
    ingredients: [],
    steps: [
      "Grillen Sie gern? Falls Sie es noch nicht probiert haben: Gegrillter Kürbis, Zucchini oder Rondini sind ausgezeichnet. Geschnitten muss man sie nur mit Aromat oder nur mit Salz bestreuen und dann einfach grillen. Schnell und ausgezeichnet.",
    ],
  },
  {
    slug: "cuketova-babovka",
    name: "Zucchini-Gugelhupf",
    intro:
      "Und noch ein süßes Zucchinirezept, das ich nicht auslassen darf. Ich backe ihn in der Zucchinisaison regelmäßig, und er ist wirklich ausgezeichnet.",
    ingredients: [
      "3 Eier",
      "200 g Zucker",
      "300 g griffiges Mehl",
      "400 g fein geriebene Zucchini",
      "1 TL Zimt",
      "2 EL Kakao",
      "200 ml Öl",
      "1 Päckchen Vanillezucker, 1 Päckchen Backpulver",
    ],
    steps: [],
  },
  {
    slug: "pernik-s-cuketou-jako-dech-nadychany-a-vlacny",
    name: "Lebkuchen mit Zucchini („federleicht“, luftig und saftig)",
    ingredients: [
      "130 g Roggenvollkornmehl",
      "260 g Weizenvollkornmehl",
      "oder statt der oben genannten 400 g glattes Mehl",
      "3/4 Tasse Öl",
      "3 Eier",
      "700 g fein geriebene Zucchini",
      "1 TL Natron",
      "1 Päckchen Lebkuchen-Backpulver",
      "2-3 EL Kakao",
      "eine Prise Salz",
      "Zitronenschale",
      "zusätzlich können 2 TL Lebkuchengewürz dazu",
    ],
    steps: [
      "Wir mischen die flüssigen Zutaten und die Zucchini, danach geben wir die trockenen dazu.",
    ],
  },
  {
    slug: "sladky-zapeceny-acorn-recept-z-texasu",
    name: "Süßer gebackener Acorn - ein Rezept aus Texas",
    ingredients: [],
    steps: [
      "Den Kürbis Table Ace oder einen beliebigen anderen Acorn halbieren und das Kerngehäuse aushöhlen, nicht schälen. Danach formen wir aus zerknüllter Alufolie Betten für die 2 „Schälchen“, die aus dem Kürbis entstehen. Den Kürbis bestreuen wir mit Rohrzucker (es kann auch Kristallzucker sein), weiter legen wir ein Stück Butter hinein und übergießen ihn mit Ahornsirup (statt Sirup nehme ich einen größeren TL Honig). Wir können ihn mit Zimt bestreuen (ich nehme Zimtzucker). Den so vorbereiteten Kürbis geben wir auf ein Blech und backen ihn ca. 30 - 40 Minuten. Den fertigen Kürbis servieren wir und löffeln ihn aus. Eine ideale Köstlichkeit für Liebhaber von Süßem, die von innen wärmt.",
    ],
  },
  {
    slug: "skvele-dynove-muffiny",
    name: "Großartige Kürbismuffins",
    intro:
      "ca. 12 große Muffins",
    ingredients: [
      "150 g weiche Butter",
      "150 g Rohrzucker",
      "2 Eier",
      "180 g Vollkornmehl",
      "150 g gemahlene Mandeln",
      "1 TL Backpulver",
      "1 Päckchen Vanillezucker",
      "1 TL gemahlener Zimt",
      "eine Prise gemahlener Ingwer",
      "80 g gehackte Datteln oder getrocknete Cranberrys",
      "230 g Kürbisfleisch",
      "Geriebene Orangenschale",
      "Butter zum Ausfetten der Förmchen, oder es genügen Papierförmchen für Muffins",
    ],
    steps: [
      "Heizen Sie den Backofen auf 180 Grad vor",
      "Rohes Kürbisfleisch fein gerieben. Die Backförmchen ausfetten.",
      "Butter mit Zucker schaumig schlagen und danach nach und nach die Eier unterschlagen. Geben Sie die übrigen Zutaten dazu - ohne den Kürbis - mischen, unter die Buttermasse rühren. Den geriebenen Kürbis dazugeben. Gießen Sie den Teig in die vorbereiteten Förmchen.",
      "Die Muffins im vorgeheizten Backofen auf mittlerer Schiene backen. Wir backen bei 180 Grad 25 bis 30 Minuten. Danach prüfen wir, ob sie durchgebacken sind. Wir nehmen die Muffins aus den Förmchen und bestäuben sie mit Puderzucker, oder wir lassen sie in den Papierförmchen und servieren sie bestäubt.",
    ],
  },
  {
    slug: "nezavarovany-kompot-z-dyne",
    name: "Nicht eingekochtes Kürbiskompott",
    ingredients: [],
    steps: [
      "Das kalte Kompott bereiten wir zu, indem wir 1,5 kg Kürbis in Würfel schneiden. Wir gießen 1,5 Liter Wasser darüber, pressen den Saft von zwei Zitronen aus und geben 1/2 TL Zitronensäure dazu. Den so eingelegten Kürbis lassen wir 3 - 12 Stunden ruhen. Danach kochen wir ihn mit 300 g Zucker ein, geben 4 Stück Gewürznelken und 1 Stück ganze Zimtstange dazu (gut funktioniert auch ein Beutel Glühweingewürz, in dem zusätzlich noch Sternanis ist). Ich habe etwa 20 Minuten sanft gekocht (bis die Gabel in den Kürbiswürfel eindringt und wir nicht mehr spüren, dass er hart ist, und der Kürbis zugleich nicht zerkocht sein soll). Das Kompott lassen wir auskühlen und servieren es. Es ist schmackhaft und erfrischend.",
    ],
  },
  {
    slug: "patizonovy-mozecek",
    name: "Patisson-„Hirn“",
    ingredients: [],
    steps: [
      "Im Fett braten wir die Zwiebel an, geben grob geriebenen Patisson dazu, salzen, pfeffern, gießen nach Bedarf mit Gemüsebrühe an und dünsten weich. Die Flüssigkeit lassen wir verdampfen und rühren ein Ei unter. Kurz rühren, und das „Patisson-Hirn“ ist fertig. Verfeinern können wir es während der Pilzsaison, indem wir den Patisson zusammen mit geschnittenen frischen Pilzen dünsten.",
    ],
  },
  {
    slug: "salat-z-topinambur",
    name: "Topinambursalat",
    intro:
      "Früher haben wir einige Jahre lang Topinambur angebaut. Ich gebe hier ein Rezept für einen sehr schmackhaften Topinambursalat an.",
    ingredients: [],
    steps: [
      "Die gewaschenen Topinambur schälen, einen Teil auf der groben und einen Teil auf der feinen Reibe reiben und sofort etwas Wasser mit Essig unterrühren (damit die Topinambur nicht braun werden). Danach bereiten wir eine Marinade aus Sahne, Salatgewürz (nach Geschmack), Salz und etwas durchgepresstem Knoblauch. In den Salat geben wir gehackte Walnüsse, übergießen ihn mit der Marinade und mischen ihn durch. Dieser Salat ist erfrischend und schmeckt großartig.",
    ],
  },
  {
    slug: "dynova-seminka-sladko-pikantni",
    name: "Kürbiskerne - süß/pikant",
    ingredients: [
      "Kerne von einem Kürbis",
      "5 EL Kristallzucker",
      "¼ TL Salz",
      "¼ TL gemahlener Kümmel",
      "¼ TL Zimt",
      "eine Prise Chilipulver",
      "etwas Öl",
      "(Sie können auch ¼ TL Ingwer dazugeben)",
    ],
    steps: [
      "Mischen Sie in einer Schüssel 3 EL Kristallzucker, ¼ TL Salz, ¼ TL gemahlenen Kümmel, ¼ TL Zimt und eine Prise Chilipulver. Erhitzen Sie in einer großen beschichteten Pfanne ca. 1½ EL Öl, werfen Sie die Kerne von einem Kürbis hinein, geben Sie 2 EL Kristallzucker dazu und rühren Sie etwa eine Minute, bis der Zucker zu schmelzen beginnt und die Kerne zu karamellisieren anfangen. Geben Sie sie dann in die Schüssel mit den Gewürzen und mischen Sie alles gründlich. Lassen Sie sie auskühlen.",
    ],
  },
  {
    slug: "dynova-seminka-slane-mlsani",
    name: "Kürbiskerne - salziges Naschwerk",
    intro:
      "Es kommt darauf an, was für Kerne Sie haben.",
    ingredients: [],
    steps: [
      "Wenn Sie Kerne vom Ölkürbis haben (eine schalenlose Sorte), haben Sie dunkelgrüne Kerne ohne holzige Schalen. Diese Kürbiskerne legen Sie 24 Stunden in eine Salzlake ein (Sie kochen Wasser mit Salz auf, ein Teil Salz und zwei Teile Wasser). Nach 24 Stunden nehmen Sie die Kerne heraus und lassen sie trocknen. Sie können sie verzehren.",
      "Wenn Sie Kürbiskerne von einem beliebigen anderen essbaren Kürbis haben, ist das Vorgehen mit dem Einlegen in die Salzlake dasselbe. Nach dem Herausnehmen aus der Lake und dem Trocknen rösten wir sie. Durch das Rösten wird die harte Schale der Kürbiskerne mürbe. Sie geben sie bei hoher Temperatur in den Backofen und passen auf. Es genügt, wenn die Kerne leicht rosa werden. (So ein Naschwerk ist dann reich an Ballaststoffen.)",
    ],
  },
  {
    slug: "pecena-dyne-typu-hokaido",
    name: "Gebackener Kürbis vom Typ Hokkaido",
    ingredients: [],
    steps: [
      "Hokkaido-Kürbis lässt sich in Scheiben samt Schale auf dem Blech backen. Die Autorin des Rezepts backt den Kürbis in Butter, ich habe es mit Öl versucht, es geht auch trocken auf Backpapier. Die Kürbisscheiben werden gesalzen, man kann sie mit verschiedenen Gewürzen bestreuen, zum Beispiel mit Rosmarin, manche streuen Kümmel darüber. Ich habe auch die Variante ohne Gewürze probiert. Schnell fertig, einfach und sehr gut (es eignet sich auch als Beilage zu Fleisch mit Soße). Ich empfehle es.",
    ],
  },
  {
    slug: "dynovy-kolac",
    name: "Kürbiskuchen",
    intro:
      "Ich empfehle ihn! Ein leichter Kuchen, nicht übersüßt, und der Teig ist mürbe. Einfache Zubereitung.",
    ingredients: [
      "400 g Kürbis",
      "3 Äpfel",
      "Zitronenschale",
      "Zimt",
      "Salz",
      "Mandeln",
      "150 g glattes Mehl",
      "90 g Butter",
      "1 TL Backpulver",
    ],
    steps: [
      "Kürbis und Äpfel schälen, in Stücke schneiden. Ganz wenig mit Wasser angießen, dünsten, nach Geschmack Zucker, Zitronensaft und Zimt dazugeben und zu einem dickeren Mus einkochen. Aus Mehl, Butter, einer Prise Salz, Backpulver und etwa 3 EL kaltem Wasser kneten wir einen Teig, den wir in eine gefettete und bemehlte Kuchenform drücken, geben das Kürbismus darauf, bestreuen es mit gebrühten, geschälten Mandeln und backen es im vorgeheizten Backofen.",
    ],
  },
  {
    slug: "dynovy-dzus",
    name: "Kürbissaft",
    intro:
      "Es hielten Leute bei uns an und wollten große Kürbisse für Kürbissaft. Da ließ es uns keine Ruhe und wir haben das Rezept auch ausprobiert. Mit dem erfrischenden Saft haben wir die ganze Familie versorgt, und den Besuchern hat er auch geschmeckt.",
    ingredients: [
      "6 kg Kürbis in großen Würfeln",
      "1 kg Zucker",
      "40 ml Zitronensaft",
      "3 EL Zitronensäure",
      "4 l Wasser",
    ],
    steps: [
      "Alles lassen wir im Topf bis zum nächsten Tag stehen und kochen es dann weich (ca. 30 Minuten). Die abgekühlte Mischung pürieren wir, vermischen sie mit 10 Litern abgekochtem Wasser und geben 1 Orangen-Ovocit (Fruchtsirup-Konzentrat) dazu (nach Geschmack vielleicht weniger). Umrühren, durch ein Sieb abseihen und in Flaschen füllen (wir lagern den Saft in einem Emailleeimer). Kühl aufbewahren (im Kühlschrank) - er hält ca. eine Woche, oder wir sterilisieren ihn (das haben wir nicht ausprobiert) 20 Minuten bei 80 C, und dann hält er angeblich sogar ein Jahr.",
    ],
  },
  {
    slug: "privarok",
    name: "„Prívarok“",
    intro:
      "Das Rezept stammt aus Ungarn - ausgezeichnet als Beilage zu Fleisch mit Soße (à la Naturschnitzel).",
    ingredients: [],
    steps: [
      "Die fein gehackte Zwiebel wird angebraten.",
      "Dazu kommt geriebener Kürbis (halb fein, halb grob), den wir vorher ausdrücken (je nach Kürbissorte - manche Kürbisse haben nicht so viel Wasser in sich, geeignet ist zum Beispiel der ungarische blaue Kürbis).",
      "Wir gießen mit Milch auf, in die edelsüßes Paprikapulver eingestreut ist. Wir lassen es etwa 10 Minuten dünsten (wir können es auch etwas mit Mehl andicken, nicht zu sehr).",
      "Wenn der Kürbis weich gedünstet ist (es darf nicht schwimmen, eher dick, von der Konsistenz eines Mus), geben wir gehackten Dill dazu und salzen nach Geschmack.",
    ],
  },
  {
    slug: "slany-dynovy-nakyp",
    name: "Herzhafter Kürbisauflauf",
    intro:
      "(ein ausgezeichnetes Gericht auch für die, die Kürbis nicht so mögen - er versteckt sich darin tadellos)",
    ingredients: [
      "3 Tassen geriebener Kürbis",
      "1 Tasse Mehl",
      "150 g geriebener Edamer",
      "1 große Zwiebel - fein gehackt",
      "150 g geräucherter Bauchspeck (oder eine andere Räucherware) - in kleine Würfel schneiden",
      "½ Päckchen Backpulver",
      "3 Eier",
      "3 Knoblauchzehen",
      "Salz, Pfeffer, Majoran, Schnittlauch, Petersilie",
    ],
    steps: [
      "Alles vermischen, in ein gefettetes und bemehltes Blech gießen und goldbraun backen. Wir können es warm und kalt verzehren.",
    ],
  },
  {
    slug: "dynova-marmelada-s-citrusy",
    name: "Kürbismarmelade mit Zitrusfrüchten",
    ingredients: [
      "2 kg Kürbis",
      "2 Orangen",
      "3 Zitronen",
      "1 l Wasser",
      "ein halber TL geriebener Ingwer",
      "1000 g Gelierzucker",
    ],
    steps: [
      "Den Kürbis schälen, entkernen und in Würfel schneiden. Zitronen und Orangen gut waschen und in Halbmonde schneiden. Alles ins Wasser geben, den Ingwer dazugeben und zusammen etwa 25 Minuten kochen. Dann die Zitrusschalen herausnehmen und die Mischung pürieren. Den Gelierzucker einrühren und 10 Minuten kochen. Heiß in saubere Gläser füllen, verschließen und auf den Kopf stellen.",
      "90 Minuten",
    ],
  },
  {
    slug: "dynova-buchta",
    name: "Kürbiskuchen vom Blech",
    intro:
      "Die Menge reicht für ein tiefes Blech (also für eine große Gesellschaft). Man kann ihn aus jedem Kürbis machen, am besten ist aber der Ölkürbis, weil wir seine Kerne statt Nüssen in den Teig geben können.",
    ingredients: [
      "500 g Kürbis",
      "150 g Kürbiskerne oder Nüsse",
      "die Schale einer Orange - gerieben",
      "3 Eier",
      "350 g Zucker",
      "300 ml Öl",
      "500 g Mehl",
      "1 Päckchen Backpulver",
      "1 Päckchen Vanillezucker",
      "1 TL Zimt",
      "½ TL Natron",
    ],
    steps: [
      "Das Kürbisfleisch pürieren wir mit dem Öl (man kann den Kürbis auch fein reiben) und vermischen es mit allem Übrigen. Wir gießen es in ein gefettetes und bemehltes Blech und backen es. Den fertigen Kuchen können wir mit Schokoladenglasur übergießen.",
    ],
  },
];
