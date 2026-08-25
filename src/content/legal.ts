/**
 * Právní texty přepsané ze starého webu (obchodní podmínky a pravidla
 * ochrany soukromí). Text zůstal, jak byl, se dvěma nutnými úpravami:
 * seznam zpracovatelů odpovídá dnešní infrastruktuře (Webnode už web
 * neprovozuje) a doplnila se e-mailová adresa místo prázdného zástupce.
 */

export interface LegalArticle {
  /** Číslo článku; prázdné u úvodní hlavičky dokumentu. */
  n: string;
  /** Nadpis článku; prázdný u úvodní hlavičky dokumentu. */
  title: string;
  paragraphs: string[];
}

export interface LegalDoc {
  title: string;
  /** Datum platnosti tak, jak je uvedeno v dokumentu. */
  updated: string;
  articles: LegalArticle[];
}

export const TERMS: LegalDoc = {
  title: "Obchodní podmínky",
  updated: "V Nové Vsi u Leštiny 27.08. 2020",
  articles: [
    {
      n: "",
      title: "",
      paragraphs: [
        "obchodní společnosti: Josef Pipek",
        "se sídlem: Nová Ves u Leštiny 5, 582 82 Nová Ves u Leštiny",
        "identifikační číslo: 459 04 472",
        "Podnikatel zapsán v evidenci zemědělského podnikatele dne 28. 4. 2009, Městský úřad Havlíčkův Brod.Č. jednací: ZU/53/2009/Mu",
        "pro prodej zboží prostřednictvím on-line obchodu umístěného na internetové adrese www.dynovysvet.cz.",
      ],
    },
    {
      n: "1",
      title: "Úvodní ustanovení",
      paragraphs: [
        "1.1. Tyto obchodní podmínky (dále jen „obchodní podmínky“) podnikající fyzické osoby Josef Pipek, se sídlem v Nové Vsi u Leštiny č.p. 5, 58282, identifikační číslo: 459 04 472, zapsané v obchodním rejstříku vedeném v evidenci zemědělského podnikatele dne 28. 4. 2009, Městský úřad Havlíčkův Brod.Č. jednací: ZU/53/2009/Mu (dále jen „prodávající“) upravují v souladu s ustanovením § 1751 odst. 1 zákona č. 89/2012 Sb., občanský zákoník, ve znění pozdějších předpisů (dále jen „občanský zákoník“) vzájemná práva a povinnosti smluvních stran vzniklé v souvislosti nebo na základě kupní smlouvy (dále jen „kupní smlouva“) uzavírané mezi prodávajícím a jinou fyzickou osobou (dále jen „kupující“) prostřednictvím internetového obchodu prodávajícího. Internetový obchod je prodávajícím provozován na webové stránce umístěné na internetové adrese www.dynovysvet.cz (dále jen „webová stránka“), a to prostřednictvím rozhraní webové stránky (dále jen „webové rozhraní obchodu“).",
        "1.2. Obchodní podmínky se nevztahují na případy, kdy osoba, která má v úmyslu nakoupit zboží od prodávajícího, je právnickou osobou či osobou, jež jedná při objednávání zboží v rámci své podnikatelské činnosti nebo v rámci svého samostatného výkonu povolání.",
        "1.3. Ustanovení odchylná od obchodních podmínek je možné sjednat v kupní smlouvě. Odchylná ujednání v kupní smlouvě mají přednost před ustanoveními obchodních podmínek.",
        "1.4. Ustanovení obchodních podmínek jsou nedílnou součástí kupní smlouvy. Kupní smlouva a obchodní podmínky jsou vyhotoveny v českém jazyce. Kupní smlouvu lze uzavřít v českém jazyce.",
        "1.5. Znění obchodních podmínek může prodávající měnit či doplňovat. Tímto ustanovením nejsou dotčena práva a povinnosti vzniklá po dobu účinnosti předchozího znění obchodních podmínek.",
      ],
    },
    {
      n: "2",
      title: "Uživatelský účet",
      paragraphs: [
        "2.1. Na základě registrace kupujícího provedené na webové stránce může kupující přistupovat do svého uživatelského rozhraní. Ze svého uživatelského rozhraní může kupující provádět objednávání zboží (dále jen „uživatelský účet“). V případě, že to webové rozhraní obchodu umožňuje, může kupující provádět objednávání zboží též bez registrace přímo z webového rozhraní obchodu.",
        "2.2. Při registraci na webové stránce a při objednávání zboží je kupující povinen uvádět správně a pravdivě všechny údaje. Údaje uvedené v uživatelském účtu je kupující při jakékoliv jejich změně povinen aktualizovat. Údaje uvedené kupujícím v uživatelském účtu a při objednávání zboží jsou prodávajícím považovány za správné.",
        "2.3. Přístup k uživatelskému účtu je zabezpečen uživatelským jménem a heslem. Kupující je povinen zachovávat mlčenlivost ohledně informací nezbytných k přístupu do jeho uživatelského účtu.",
        "2.4. Kupující není oprávněn umožnit využívání uživatelského účtu třetím osobám.",
        "2.5. Prodávající může zrušit uživatelský účet, a to zejména v případě, kdy kupující svůj uživatelský účet déle než [časové období] nevyužívá, či v případě, kdy kupující poruší své povinnosti z kupní smlouvy (včetně obchodních podmínek).",
        "2.6. Kupující bere na vědomí, že uživatelský účet nemusí být dostupný nepřetržitě, a to zejména s ohledem na nutnou údržbu hardwarového a softwarového vybavení prodávajícího, popř. nutnou údržbu hardwarového a softwarového vybavení třetích osob.",
      ],
    },
    {
      n: "3",
      title: "Uzavření kupní smlouvy",
      paragraphs: [
        "3.1. Veškerá prezentace zboží umístěná ve webovém rozhraní obchodu je informativního charakteru a prodávající není povinen uzavřít kupní smlouvu ohledně tohoto zboží. Ustanovení § 1732 odst. 2 občanského zákoníku se nepoužije.",
        "3.2. Webové rozhraní obchodu obsahuje informace o zboží, a to včetně uvedení cen jednotlivého zboží a nákladů za navrácení zboží, jestliže toto zboží ze své podstaty nemůže být navráceno obvyklou poštovní cestou. Ceny zboží jsou uvedeny včetně daně z přidané hodnoty a všech souvisejících poplatků. Ceny zboží zůstávají v platnosti po dobu, kdy jsou zobrazovány ve webovém rozhraní obchodu. Tímto ustanovením není omezena možnost prodávajícího uzavřít kupní smlouvu za individuálně sjednaných podmínek.",
        "3.3. Webové rozhraní obchodu obsahuje také informace o nákladech spojených s balením a dodáním zboží. Informace o nákladech spojených s balením a dodáním zboží uvedené ve webovém rozhraní obchodu platí pouze v případech, kdy je zboží doručováno v rámci území České republiky.",
        "3.4. Pro objednání zboží vyplní kupující objednávkový formulář ve webovém rozhraní obchodu. Objednávkový formulář obsahuje zejména informace o:",
        "3.4.1. objednávaném zboží (objednávané zboží „vloží“ kupující do elektronického nákupního košíku webového rozhraní obchodu),",
        "3.4.2. způsobu úhrady kupní ceny zboží, údaje o požadovaném způsobu doručení objednávaného zboží a",
        "3.4.3. informace o nákladech spojených s dodáním zboží (dále společně jen jako „objednávka“).",
        "3.5. Před zasláním objednávky prodávajícímu je kupujícímu umožněno zkontrolovat a měnit údaje, které do objednávky kupující vložil, a to i s ohledem na možnost kupujícího zjišťovat a opravovat chyby vzniklé při zadávání dat do objednávky. Objednávku odešle kupující prodávajícímu kliknutím na tlačítko „Dokončit objednávku“. Údaje uvedené v objednávce jsou prodávajícím považovány za správné. Prodávající neprodleně po obdržení objednávky toto obdržení kupujícímu potvrdí elektronickou poštou, a to na adresu elektronické pošty kupujícího uvedenou v uživatelském účtu či v objednávce (dále jen „elektronická adresa kupujícího“).",
        "3.6. Prodávající je vždy oprávněn v závislosti na charakteru objednávky (množství zboží, výše kupní ceny, předpokládané náklady na dopravu) požádat kupujícího o dodatečné potvrzení objednávky (například písemně či telefonicky).",
        "3.7. Smluvní vztah mezi prodávajícím a kupujícím vzniká doručením přijetí objednávky (akceptací), jež je prodávajícím zasláno kupujícímu elektronickou poštou, a to na adresu elektronické pošty kupujícího.",
        "3.8. Kupující souhlasí s použitím komunikačních prostředků na dálku při uzavírání kupní smlouvy. Náklady vzniklé kupujícímu při použití komunikačních prostředků na dálku v souvislosti s uzavřením kupní smlouvy (náklady na internetové připojení, náklady na telefonní hovory) si hradí kupující sám, přičemž tyto náklady se neliší od základní sazby.",
      ],
    },
    {
      n: "4",
      title: "Cena zboží a platební podmínky",
      paragraphs: [
        "4.1. Cenu zboží a případné náklady spojené s dodáním zboží dle kupní smlouvy může kupující uhradit prodávajícímu následujícími způsoby:",
        "- v hotovosti v provozovně prodávajícího na adrese: Nová Ves u Leštiny 5, 58282;",
        "- bezhotovostně platební kartou v provozovně prodávajícího na adrese: Nová Ves u Leštiny 5, 58282;",
        "- v hotovosti na dobírku v místě určeném kupujícím v objednávce;",
        "- bezhotovostně převodem na účet prodávajícího č. 2667118524/0600, vedený u společnosti Moneta Money Bank (dále jen „účet prodávajícího“);",
        "4.2. Společně s kupní cenou je kupující povinen zaplatit prodávajícímu také náklady spojené s balením a dodáním zboží ve smluvené výši. Není-li uvedeno výslovně jinak, rozumí se dále kupní cenou i náklady spojené s dodáním zboží.",
        "4.3. Prodávající nepožaduje od kupujícího zálohu či jinou obdobnou platbu. Tímto není dotčeno ustanovení čl. 4.6 obchodních podmínek ohledně povinnosti uhradit kupní cenu zboží předem.",
        "4.4. V případě platby v hotovosti či v případě platby na dobírku je kupní cena splatná při převzetí zboží. V případě bezhotovostní platby je kupní cena splatná do 7 dnů od uzavření kupní smlouvy.",
        "4.5. V případě bezhotovostní platby je kupující povinen uhrazovat kupní cenu zboží společně s uvedením variabilního symbolu platby. V případě bezhotovostní platby je závazek kupujícího uhradit kupní cenu splněn okamžikem připsání příslušné částky na účet prodávajícího.",
        "4.6. Prodávající je oprávněn, zejména v případě, že ze strany kupujícího nedojde k dodatečnému potvrzení objednávky (čl. 3.6), požadovat uhrazení celé kupní ceny ještě před odesláním zboží kupujícímu. Ustanovení § 2119 odst. 1 občanského zákoníku se nepoužije.",
        "4.7. Případné slevy z ceny zboží poskytnuté prodávajícím kupujícímu nelze vzájemně kombinovat.",
        "4.8. Je-li to v obchodním styku obvyklé nebo je-li tak stanoveno obecně závaznými právními předpisy, vystaví prodávající ohledně plateb prováděných na základě kupní smlouvy kupujícímu daňový doklad – fakturu. Prodávající je plátcem daně z přidané hodnoty. Daňový doklad / fakturu vystaví prodávající kupujícímu po uhrazení ceny zboží a zašle jej spolu s objednaným zbožím nebo předá osobně při nákupu v provozovně nebo jej zašle v elektronické podobě na elektronickou adresu kupujícího.",
        "4.9. Podle zákona o evidenci tržeb je prodávající povinen vystavit kupujícímu účtenku. Zároveň je povinen zaevidovat přijatou tržbu u správce daně online; v případě technického výpadku pak nejpozději do 48 hodin.",
      ],
    },
    {
      n: "5",
      title: "Odstoupení od kupní smlouvy",
      paragraphs: [
        "5.1. Kupující bere na vědomí, že dle ustanovení § 1837 občanského zákoníku, nelze mimo jiné odstoupit od kupní smlouvy o dodávce zboží, které bylo upraveno podle přání kupujícího nebo pro jeho osobu, od kupní smlouvy o dodávce zboží, které podléhá rychlé zkáze, jakož i zboží, které bylo po dodání nenávratně smíseno s jiným zbožím, od kupní smlouvy o dodávce zboží v uzavřeném obalu, které spotřebitel z obalu vyňal a z hygienických důvodů jej není možné vrátit a od kupní smlouvy o dodávce zvukové nebo obrazové nahrávky nebo počítačového programu, pokud porušil jejich původní obal.",
        "5.2. Nejedná-li se o případ uvedený v čl. 5.1 obchodních podmínek či o jiný případ, kdy nelze od kupní smlouvy odstoupit, má kupující v souladu s ustanovením § 1829 odst. 1 občanského zákoníku právo od kupní smlouvy odstoupit, a to do čtrnácti (14) dnů od převzetí zboží, přičemž v případě, že předmětem kupní smlouvy je několik druhů zboží nebo dodání několika částí, běží tato lhůta ode dne převzetí poslední dodávky zboží. Odstoupení od kupní smlouvy musí být prodávajícímu odesláno ve lhůtě uvedené v předchozí větě. Pro odstoupení od kupní smlouvy může kupující využit vzorový formulář poskytovaný prodávajícím, jenž tvoří přílohu obchodních podmínek. Odstoupení od kupní smlouvy může kupující zasílat mimo jiné na adresu provozovny prodávajícího či na adresu elektronické pošty prodávajícího pipkovinovaves@seznam.cz.",
        "5.3. V případě odstoupení od kupní smlouvy dle čl. 5.2 obchodních podmínek se kupní smlouva od počátku ruší. Zboží musí být kupujícím prodávajícímu vráceno do čtrnácti (14) dnů od doručení odstoupení od kupní smlouvy prodávajícímu. Odstoupí-li kupující od kupní smlouvy, nese kupující náklady spojené s navrácením zboží prodávajícímu, a to i v tom případě, kdy zboží nemůže být vráceno pro svou povahu obvyklou poštovní cestou.",
        "5.4. V případě odstoupení od kupní smlouvy dle čl. 5.2 obchodních podmínek vrátí prodávající peněžní prostředky přijaté od kupujícího do čtrnácti (14) dnů od odstoupení od kupní smlouvy kupujícím, a to stejným způsobem, jakým je prodávající od kupujícího přijal. Prodávající je taktéž oprávněn vrátit plnění poskytnuté kupujícím již při vrácení zboží kupujícím či jiným způsobem, pokud s tím kupující bude souhlasit a nevzniknou tím kupujícímu další náklady. Odstoupí-li kupující od kupní smlouvy, prodávající není povinen vrátit přijaté peněžní prostředky kupujícímu dříve, než mu kupující zboží vrátí nebo prokáže, že zboží prodávajícímu odeslal.",
        "5.5. Nárok na úhradu škody vzniklé na zboží je prodávající oprávněn jednostranně započíst proti nároku kupujícího na vrácení kupní ceny.",
        "5.6. V případech, kdy má kupující v souladu s ustanovením § 1829 odst. 1 občanského zákoníku právo od kupní smlouvy odstoupit, je prodávající také oprávněn kdykoliv od kupní smlouvy odstoupit, a to až do doby převzetí zboží kupujícím. V takovém případě vrátí prodávající kupujícímu kupní cenu bez zbytečného odkladu, a to bezhotovostně na účet určený kupujícím.",
        "5.7. Je-li společně se zbožím poskytnut kupujícímu dárek, je darovací smlouva mezi prodávajícím a kupujícím uzavřena s rozvazovací podmínkou, že dojde-li k odstoupení od kupní smlouvy kupujícím, pozbývá darovací smlouva ohledně takového dárku účinnosti a kupující je povinen spolu se zbožím prodávajícímu vrátit i poskytnutý dárek.",
      ],
    },
    {
      n: "6",
      title: "Přeprava a dodání zboží",
      paragraphs: [
        "6.1. V případě, že je způsob dopravy smluven na základě zvláštního požadavku kupujícího, nese kupující riziko a případné dodatečné náklady spojené s tímto způsobem dopravy.",
        "6.2. Je-li prodávající podle kupní smlouvy povinen dodat zboží na místo určené kupujícím v objednávce, je kupující povinen převzít zboží při dodání.",
        "6.3. V případě, že je z důvodů na straně kupujícího nutno zboží doručovat opakovaně nebo jiným způsobem, než bylo uvedeno v objednávce, je kupující povinen uhradit náklady spojené s opakovaným doručováním zboží, resp. náklady spojené s jiným způsobem doručení.",
        "6.4. Při převzetí zboží od přepravce je kupující povinen zkontrolovat neporušenost obalů zboží a v případě jakýchkoliv závad toto neprodleně oznámit přepravci. V případě shledání porušení obalu svědčícího o neoprávněném vniknutí do zásilky nemusí kupující zásilku od přepravce převzít.",
        "6.5. Další práva a povinnosti stran při přepravě zboží mohou upravit zvláštní dodací podmínky prodávajícího, jsou-li prodávajícím vydány.",
      ],
    },
    {
      n: "7",
      title: "Práva z vadného plnění",
      paragraphs: [
        "7.1. Práva a povinnosti smluvních stran ohledně práv z vadného plnění se řídí příslušnými obecně závaznými právními předpisy (zejména ustanoveními § 1914 až 1925, § 2099 až 2117 a § 2161 až 2174 občanského zákoníku a zákonem č. 634/1992 Sb., o ochraně spotřebitele, ve znění pozdějších předpisů).",
        "7.2. Prodávající odpovídá kupujícímu, že zboží při převzetí nemá vady. Zejména prodávající odpovídá kupujícímu, že v době, kdy kupující zboží převzal:",
        "7.2.1. má zboží vlastnosti, které si strany ujednaly, a chybí-li ujednání, má takové vlastnosti, které prodávající nebo výrobce popsal nebo které kupující očekával s ohledem na povahu zboží a na základě reklamy jimi prováděné,",
        "7.2.2. se zboží hodí k účelu, který pro jeho použití prodávající uvádí nebo ke kterému se zboží tohoto druhu obvykle používá,",
        "7.2.3. zboží odpovídá jakostí nebo provedením smluvenému vzorku nebo předloze, byla-li jakost nebo provedení určeno podle smluveného vzorku nebo předlohy,",
        "7.2.4. je zboží v odpovídajícím množství, míře nebo hmotnosti a",
        "7.2.5. zboží vyhovuje požadavkům právních předpisů.",
        "7.3. Ustanovení uvedená v čl. 7.2 obchodních podmínek se nepoužijí u zboží prodávaného za nižší cenu na vadu, pro kterou byla nižší cena ujednána, na opotřebení zboží způsobené jeho obvyklým užíváním, u použitého zboží na vadu odpovídající míře používání nebo opotřebení, kterou zboží mělo při převzetí kupujícím, nebo vyplývá-li to z povahy zboží.",
        "7.4. Projeví-li se vada v průběhu šesti měsíců od převzetí, má se za to, že zboží bylo vadné již při převzetí. Kupující je oprávněn uplatnit právo z vady, která se vyskytne u spotřebního zboží v době dvaceti čtyř měsíců od převzetí.",
        "7.5. Práva z vadného plnění uplatňuje kupující u prodávajícího na adrese jeho provozovny, v níž je přijetí reklamace možné s ohledem na sortiment prodávaného zboží, případně i v sídle nebo místě podnikání.",
        "7.6. Další práva a povinnosti stran související s odpovědností prodávajícího za vady může upravit reklamační řád prodávajícího.",
      ],
    },
    {
      n: "8",
      title: "Další práva a povinnosti smluvních stran",
      paragraphs: [
        "8.1. Kupující nabývá vlastnictví ke zboží zaplacením celé kupní ceny zboží.",
        "8.2. Prodávající není ve vztahu ke kupujícímu vázán žádnými kodexy chování ve smyslu ustanovení § 1826 odst. 1 písm. e) občanského zákoníku.",
        "8.3. Vyřizování stížností spotřebitelů zajišťuje prodávající prostřednictvím elektronické adresy pipkovinovaves@seznam.cz. Informaci o vyřízení stížnosti kupujícího zašle prodávající na elektronickou adresu kupujícího.",
        "8.4. K mimosoudnímu řešení spotřebitelských sporů z kupní smlouvy je příslušná Česká obchodní inspekce, se sídlem Štěpánská 567/15, 120 00 Praha 2, IČ: 000 20 869, internetová adresa: https://adr.coi.cz/cs. Platformu pro řešení sporů on-line nacházející se na internetové adrese https://ec.europa.eu/consumers/odr je možné využít při řešení sporů mezi prodávajícím a kupujícím z kupní smlouvy.",
        "8.5. Evropské spotřebitelské centrum Česká republika, se sídlem Štěpánská 567/15, 120 00 Praha 2, internetová adresa: https://www.evropskyspotrebitel.cz je kontaktním místem podle Nařízení Evropského parlamentu a Rady (EU) č. 524/2013 ze dne 21. května 2013 o řešení spotřebitelských sporů on-line a o změně nařízení (ES) č. 2006/2004 a směrnice 2009/22/ES (nařízení o řešení spotřebitelských sporů on-line).",
        "8.6. Prodávající je oprávněn k prodeji zboží na základě živnostenského oprávnění. Živnostenskou kontrolu provádí v rámci své působnosti příslušný živnostenský úřad. Dozor nad oblastí ochrany osobních údajů vykonává Úřad pro ochranu osobních údajů. Česká obchodní inspekce vykonává ve vymezeném rozsahu mimo jiné dozor nad dodržováním zákona č. 634/1992 Sb., o ochraně spotřebitele, ve znění pozdějších předpisů.",
        "8.7. Kupující tímto přebírá na sebe nebezpečí změny okolností ve smyslu § 1765 odst. 2 občanského zákoníku.",
      ],
    },
    {
      n: "9",
      title: "Ochrana osobních údajů",
      paragraphs: [
        "9.1. 9.1. Svou informační povinnost vůči kupujícímu ve smyslu čl. 13 Nařízení Evropského parlamentu a Rady 2016/679 o ochraně fyzických osob v souvislosti se zpracováním osobních údajů a o volném pohybu těchto údajů a o zrušení směrnice 95/46/ES (obecné nařízení o ochraně osobních údajů) (dále jen „nařízení GDPR“) související se zpracováním osobních údajů kupujícího pro účely plnění kupní smlouvy, pro účely jednání o této smlouvě a pro účely plnění veřejnoprávních povinností prodávajícího plní prodávající prostřednictvím zvláštního dokumentu.",
      ],
    },
    {
      n: "10",
      title: "Zasílání obchodních sdělení a ukládání cookies",
      paragraphs: [
        "10.1. Kupující souhlasí se zasíláním informací souvisejících se zbožím, službami nebo podnikem prodávajícího na elektronickou adresu kupujícího a dále souhlasí se zasíláním obchodních sdělení prodávajícím na elektronickou adresu kupujícího. Svou informační povinnost vůči kupujícímu ve smyslu čl. 13 nařízení GDPR související se zpracováním osobních údajů kupujícího pro účely zasílání obchodních sdělení plní prodávající prostřednictvím zvláštního dokumentu",
        "10.2. Kupující souhlasí s ukládáním tzv. cookies na jeho počítač. V případě, že je nákup na webové stránce možné provést a závazky prodávajícího z kupní smlouvy plnit, aniž by docházelo k ukládání tzv. cookies na počítač kupujícího, může kupující souhlas podle předchozí věty kdykoliv odvolat.",
      ],
    },
    {
      n: "11",
      title: "Doručování",
      paragraphs: [
        "11.1. Kupujícímu může být doručováno na elektronickou adresu kupujícího.",
      ],
    },
    {
      n: "12",
      title: "Závěrečná ustanovení",
      paragraphs: [
        "12.1. Pokud vztah založený kupní smlouvou obsahuje mezinárodní (zahraniční) prvek, pak strany sjednávají, že vztah se řídí českým právem.",
        "12.2. Volbou práva dle čl. 12.1 obchodních podmínek není spotřebitel zbaven ochrany, kterou mu poskytují ustanovení právního řádu, od nichž se nelze smluvně odchýlit, a jež by se v případě neexistence volby práva jinak použila dle ustanovení čl. 6 odst. 1 Nařízení Evropského parlamentu a Rady (ES) č. 593/2008 ze dne 17. června 2008 o právu rozhodném pro smluvní závazkové vztahy (Řím I).",
        "12.3. Je-li některé ustanovení obchodních podmínek neplatné nebo neúčinné, nebo se takovým stane, namísto neplatných ustanovení nastoupí ustanovení, jehož smysl se neplatnému ustanovení co nejvíce přibližuje. Neplatností nebo neúčinností jednoho ustanovení není dotčena platnost ostatních ustanovení.",
        "12.4. Kupní smlouva včetně obchodních podmínek je archivována prodávajícím v elektronické podobě a není přístupná.",
        "12.5. Kontaktní údaje prodávajícího: adresa pro doručování: Nová Ves u Leštiny 5, 582 82, adresa elektronické pošty: pipkovinovaves@seznam.cz.",
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  title: "Pravidla ochrany soukromí",
  updated: "Tato Pravidla vstupují v platnost 27.08. 2020",
  articles: [
    {
      n: "",
      title: "",
      paragraphs: [
        "Provozovatel e-shopu Josef Pipek na stránkách www.dynovysvet.cz IČO 459 04 472 sídlo Nová Ves u Leštiny 5, 58282 zpracovává osobní údaje poskytnuté Kupujícím za účelem plnění a dodatečného potvrzení Obchodních podmínek, za účelem zpracování elektronické objednávky, realizace dodávky, zúčtování plateb a nezbytné komunikaci mezi smluvními stranami po dobu vyžadovanou podle zvláštních právních předpisů.",
      ],
    },
    {
      n: "1",
      title: "Základní ustanovení",
      paragraphs: [
        "1.Správcem osobních údajů podle paragrafu 5 písm. o) Zákona č. 18/2018 O ochraně osobních údajů ve znění pozdějších předpisů (dále jen „Zákon“) je Josef Pipek IČO 459 04 472 se sídlem Nová Ves u Leštiny 5, 582 82 (dále jen „Správce“);",
        "2. Kontaktní údaje správce jsou: e-mail: pipkovinovaves@seznam.cz, tel.: 776815332;",
        "3. Osobními údaji se rozumí všechny informace identifikující fyzickou nebo právnickou osobu.",
      ],
    },
    {
      n: "2",
      title: "Zdroje zpracovávaných osobních údajů",
      paragraphs: [
        "1. Správce zpracovává osobní údaje, které mu se souhlasem poskytl kupující a které správce získal na základě plnění Kupní smlouvy a zpracování elektronické objednávky v internetovém obchodě www.dynovysvet.cz.;",
        "2. Správce zpracovává jen identifikační a kontaktní údaje kupujícího nezbytné pro plnění Kupní smlouvy;",
        "3. Správce zpracovává osobní údaje za účelem dodávky, zúčtování plateb a k nezbytné komunikaci mezi smluvními stranami po dobu vyžadovanou podle zvláštních právních předpisů. Osobní údaje nebudou zveřejňované a nebude docházet k přenosu do dalších zemí.",
      ],
    },
    {
      n: "3",
      title: "Účel zpracování osobních údajů",
      paragraphs: [
        "Správce zpracovává osobní údaje kupujícího z následujících důvodů:",
        "1. Za účelem registrace na webové stránce www.dynovysvet.cz podle paragrafu 13 odst. 1 písm. a) Zákona č. 18/2018 O ochraně osobních údajů;",
        "2. Za účelem vyřízení elektronické objednávky kupujícího (jméno, adresa, e-mail, telefonní číslo);",
        "3. Za účelem plnění práv a povinností vyplývajících ze smluvního vztahu mezi kupujícím a Správcem;",
        "4. Poskytnutí osobních údajů je nezbytným požadavkem pro plnění kupní smlouvy. Bez poskytnutí osobních údajů nelze smlouvu uzavřít.",
      ],
    },
    {
      n: "4",
      title: "Doba uchovávání osobních údajů",
      paragraphs: [
        "1. Správce uchovává osobní údaje po dobu nezbytnou k výkonu práv a povinností vyplývajících ze smluvního vztahu mezi kupujícím a Správcem a po dobu 3 let od ukončení smluvního vztahu;",
        "2. Po uplynutí doby uchovávání osobních údajů je Správce povinen údaje smazat.",
      ],
    },
    {
      n: "5",
      title: "Příjemci a zpracovatelé osobních údajů",
      paragraphs: [
        "Třetí stranou, která přijímá osobní údaje kupujícího, jsou subdodavatelé Správce. Služby těchto subdodavatelů bezpodmínečně souvisí s úspěšným plněním kupní smlouvy a elektronické objednávky mezi správcem a kupujícím.",
        "Subdodavateli správce jsou:",
        "Vercel Inc. (provoz webu)",
        "Neon Inc. (databáze)",
        "Comgate a.s. (platební brána)",
        "Resend (odesílání e-mailů)",
        "Česká pošta s.p. (doručování zásilek)",
        "Google Analytics (měření návštěvnosti)",
      ],
    },
    {
      n: "6",
      title: "Práva kupujícího",
      paragraphs: [
        "Podle podmínek stanovených v Zákoně má kupující právo:",
        "1. Na přístup ke svým osobním údajům;",
        "2. Na opravu osobních údajů;",
        "3. Na vymazání osobních údajů;",
        "4. Vznést námitku proti zpracování;",
        "5. Na přenositelnost údajů;",
        "6. Odvolat souhlas se zpracováním osobních údajů písemně nebo elektronicky na e-mailové adrese: pipkovinovaves@seznam.cz;",
        "7. Podat stížnost na Úřad pro ochranu osobních údajů v případě, že se domnívá, že došlo k porušení jeho práva na ochranu osobních údajů.",
      ],
    },
    {
      n: "7",
      title: "Zabezpečení osobních údajů",
      paragraphs: [
        "1. Správce prohlašuje, že přijal všechna vhodná technická a organizační opatření nutná k zabezpečení osobních údajů kupujícího;",
        "2. Správce přijal technická opatření k zabezpečení datových úložišť osobních údajů, zejména zabezpečení přístupu k počítači heslem, používání antivirového programu a pravidelnou údržbu počítačů.",
      ],
    },
    {
      n: "8",
      title: "Závěrečná ustanovení",
      paragraphs: [
        "1. Odesláním elektronické objednávky na webové stránce www.dynovysvet.cz potvrzuje kupující, že byl obeznámený s podmínkami ochrany osobních údajů a že je v celém rozsahu přijímá;",
        "2. S těmito pravidly souhlasí kupující zaškrtnutím políčka v objednávce;",
        "3. Správce je oprávněný tato Pravidla kdykoliv změnit. Novou verzi Pravidel je povinný zveřejnit na své webové stránce.",
      ],
    },
  ],
};

export const LEGAL = { terms: TERMS, privacy: PRIVACY } as const;
