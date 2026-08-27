# Dýňový svět — Statek u Pipků

Web pro sezónní akci na statku v Nové Vsi u Leštiny: prezentace ve třech
jazycích, prodej časovaných vstupenek s živou kapacitou, poptávkové
formuláře pro školy a pronájem prostor a administrace pro majitele.

Nahrazuje šablonový web na Webnode.

```
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4
Drizzle ORM · Neon Postgres · Comgate · Resend
```

## Rozjetí lokálně

```bash
pnpm install
cp .env.example .env.local     # a vyplnit
pnpm dev
```

Web funguje i **bez databáze** — sloty se pak počítají z plánu sezóny
a poptávky jen padají do logu. Hodí se to na práci s designem.

## Skripty

| Příkaz | Co dělá |
|---|---|
| `pnpm dev` | vývojový server |
| `pnpm build` | produkční build |
| `pnpm test` | testy (souběžnost rezervací, IBAN a SPAYD, zámek webu) |
| `pnpm db:generate` | vygeneruje migraci z Drizzle schématu |
| `pnpm db:push` | nahraje schéma do databáze |
| `python3 scripts/gen-gourds.py` | přegeneruje siluety tykví |
| `python3 scripts/grade-photos.py <soubory>` | grading fotek do `public/foto` |

## Jak to funguje uvnitř

### Vstupenky se nesmí přeprodat

Celý produkt stojí a padá s jednou hodinou v roce — s okamžikem, kdy se
otevře prodej. Ochrana proti přeprodání je proto na dvou úrovních:

```sql
UPDATE time_slots SET reserved = reserved + $qty
 WHERE id = $id AND reserved + $qty <= capacity
RETURNING capacity - reserved;
```

`UPDATE` po získání zámku řádku znovu vyhodnotí `WHERE`, takže je to
korektní i na `READ COMMITTED`. Nad tím je ještě `CHECK (reserved <=
capacity)` na úrovni schématu jako pojistka proti jakékoli budoucí cestě
v kódu.

**Rezervace se drží 15 minut.** Transakce se commituje *před* odchodem na
platební bránu — držet zámek řádku přes volání Comgate by při jedné pomalé
odpovědi zablokovalo celý slot všem ostatním.

Webhook je idempotentní přes unikátní index na ID transakce. Webhook, který
dorazí až po vypršení rezervace, zkusí rezervovat znovu; když neprojde, jde
objednávka do stavu `k_vraceni`. Nikdy se tiše nevezmou peníze bez místa.

### Tři jazyky, jazyk je v cestě

Čeština běží na kořeni (`/vstupenky`), angličtina a němčina mají prefix
i **vlastní přeložené slugy** (`/en/tickets`, `/de/eintrittskarten`).
Cookie by znamenala, že jedna adresa vrací tři různé obsahy — vyhledávač
by indexoval jen jednu a sdílený odkaz by se příteli otevřel jinak než
odesílateli.

- Registr adres: `src/lib/i18n/routes.ts`. **České slugy se nesmí měnit** —
  míří na ně přesměrování z Webnode a všechno, co kdo za pět let nasdílel.
- Stránky nejsou soubory v `app/`, ale komponenty v `src/components/pages/`;
  router je dohledává podle klíče (`src/components/pages/registry.ts`).
  Se složkami by přeložené adresy nešly udělat.
- Aplikace uvnitř zná jen tvar `/[locale]/…`; rozdíl proti kořenu zahlazuje
  přepisem `src/proxy.ts`. Přepis, ne přesměrování — návštěvník ani Google
  žádný skok neuvidí.
- Texty rámu (navigace, tlačítka, hlášky) jsou v `src/lib/i18n/dict.ts`,
  texty stránek v `src/content/copy/*.ts`, dlouhý obsah (recepty, pěstování,
  právní texty) v `src/content/*.{en,de}.ts`.
- `tests/content-parity.test.ts` hlídá, že se překlady nerozejdou se
  strukturou originálu — chybějící recept v němčině se jinak pozná pozdě.

### Živá kapacita bez zabití databáze

`/api/dostupnost` je cachovaný na CDN 10 s se `stale-while-revalidate`.
Dvacet tisíc lidí, kteří se ptají každých patnáct vteřin, tak znamená pár
dotazů do databáze za minutu, ne dvacet tisíc. Klient pollujeme s náhodným
rozptylem, jinak by se všichni zesynchronizovali do jedné vlny.

### Brána musí fungovat offline

Na statku je slabý signál. Vstupenkový token je podepsaný a ověřitelný
lokálně, bez dotazu na server.

### Administrace

`/admin`, česky, jednojazyčně — používá ji majitel. Přihlášení heslem
(scrypt z `node:crypto`, žádná další závislost), session je neuhodnutelný
token, v databázi z něj leží jen SHA-256. Neúspěšné pokusy se počítají
v databázi, ne v paměti procesu: na serverless je in-memory limit bezcenný,
protože každá instance počítá zvlášť.

Rozcestník je v `src/lib/admin/nav.ts` a je poskládaný podle toho, jak
o webu přemýšlí majitel — Prodej, Provoz, Obsah, Účet — ne podle tabulek.
Každá změna se zapisuje do `audit_log`.

Vizuálně navazuje na web (papír, inkoust, vlasové linky), ale je to pracovní
nástroj: hustší sazba, žádné ilustrace, čísla v tabulkových číslicích.

### Web zatím jen pro zvané

Než se web spustí, nemá ho vidět kdokoli, kdo trefí adresu — ale majitel ho
musí umět ukázat rodině, škole nebo tisku. Stačí na to jedna proměnná:

```bash
SITE_PASSWORD="nejake-sdilene-heslo"   # zamčeno
SITE_PASSWORD=""                       # otevřeno všem
```

- Zámek řeší `src/proxy.ts` (`gateCheck`) nad `src/lib/security/site-gate.ts`.
  Musí to být v proxy, ne v layoutu: veřejné stránky jsou statické, takže
  kontrola uvnitř Reactu by přišla až po tom, co je Vercel vydá z cache.
- Kdo heslo zadá na `/vstup`, dostane cookie s podepsaným tokenem (HS256,
  platnost měsíc). Heslo v cookie **není**. Podpisový klíč se odvozuje
  z hesla, takže **změna hesla okamžitě odhlásí všechny**.
- Zamčený web nevydá `sitemap.xml` a `robots.txt` zakazuje všechno; stránky
  navíc odcházejí s `X-Robots-Tag: noindex`. Nespuštěný web se nesmí dostat
  do indexu — z Googlu se pak dostává hůř, než se do něj dostal.
- Zámek se **netýká** administrace (`/admin` má vlastní přihlášení; dva zámky
  za sebou majiteli nepomůžou) ani `/api/cron/…`, které chrání `CRON_SECRET`.
- Vědomá hranice: `/foto` a `_next` jsou mimo matcher proxy, aby fotky mohly
  ležet v CDN cache. Kdo uhodne přesnou adresu obrázku, dosáhne na něj —
  na skryté *stránky* ne. Je to zámek proti náhodnému návštěvníkovi
  a proti indexaci, ne proti útočníkovi.
- Po spuštění webu proměnnou odeberte. Prázdná = otevřeno, takže se web
  nemůže zamknout tím, že se na ni zapomene.
- Zámek sám se čte za běhu, ale `robots.txt` a `sitemap.xml` vznikají při
  buildu — po zamčení i po odemčení tedy web **nasaďte znovu**, jinak
  zůstane v `robots.txt` stará odpověď.

### Bezpečnost

- Veřejné stránky mají CSP **bez nonce** — nonce se musí lišit request od
  requestu, což by celý statický web donutilo generovat se pokaždé znovu,
  a to je přesně to, co si v den otevření registrací nemůžeme dovolit.
  Veřejné stránky nikde nevykreslují cizí HTML, takže nonce nemá co chránit.
  Administrace, kde je v sázce přihlašovací cookie, dostává v `src/proxy.ts`
  ostré CSP **s nonce**; dynamická je tak jako tak.
- Hlavičky jsou v `next.config.ts`, ne ve `vercel.json` — nesmí zmizet jen
  proto, že se hosting přesune jinam.
- Texty z administrace se vykreslují **vždy jako text**, nikdy přes
  `dangerouslySetInnerHTML`. HTML se z formulářů nepřijímá.
- `/api/cron/uvolnit-rezervace` v produkci vyžaduje `CRON_SECRET`; bez něj
  vrací 503 místo toho, aby běžel otevřeně.
- Chybová hláška u přihlášení je vždy stejná, ať účet neexistuje, má špatné
  heslo, nebo je zamčený. I ověření hesla u neexistujícího účtu spálí
  srovnatelný čas — jinak by délka odpovědi prozradila platné e-maily.

## Designový systém

Vizuální jazyk „Rytý herbář" — staré semenářské katalogy a herbáře.
Ilustrace nejsou náhražka za chybějící fotky, jsou to ony samy.

**Pravidlo, na kterém to celé stojí: oranžová není nikdy velká výplň.**
Je to inkoust na papíře — linky, značky, drobná sazba. Velké plochy jsou
papír nebo noc.

- Barevné tokeny a písma: `src/app/globals.css`, `src/lib/design/fonts.ts`
- Tykve: `scripts/gen-gourds.py` → `src/lib/illustrations/gourds.ts`.
  Tělo je rotační plocha, žebra jsou poledníky rovnoměrné po délce — proto
  se u okraje samy zahušťují a tvar čte trojrozměrně. **Needitovat ručně**,
  je to generovaný soubor.
- Razítko (`src/components/site/Stamp.tsx`) překresluje skutečné gumové
  razítko statku. Není to nová značka, je to ta stávající.
- Všechny animace respektují `prefers-reduced-motion`.

Písma (Fraunces, Instrument Sans, JetBrains Mono) jsou ověřená na plnou
českou diakritiku přes `latin-ext`. Při výměně písma to ověřte znovu —
spousta jinak pěkných fontů nemá `ě ř ů ď ť ň`.

## Nasazení

Produkce běží na Vercelu z větve `main`, každý pull request dostane preview.

Napojení na Vercel se dělá jednou ručně: **Import Project → vybrat repozitář
→ vyplnit proměnné z `.env.example`**. Region nastavte na `fra1` (Frankfurt),
kvůli latenci k databázi.

### Uvolňování propadlých rezervací

Endpoint `/api/cron/uvolnit-rezervace` existuje a vyžaduje `CRON_SECRET`, ale
**plánovač v `vercel.json` je dočasně vypnutý**: účet je zatím na plánu Hobby,
kde Vercel dovolí cron jen jednou denně, a minutový by nasazení odmítl.

Nevadí to, protože úklid neběží jen z cronu. `/api/dostupnost` volá při každém
projití `sweepExpiredHolds()` — endpoint je cachovaný na deset vteřin, takže
i při náporu se uklidí řádově šestkrát za minutu, a to přesně v době, kdy na
tom záleží. Mimo sezónu se nikdo neptá, ale tam ani žádné rezervace nevznikají.

Po přechodu na Pro vraťte do `vercel.json`:

```json
"crons": [{ "path": "/api/cron/uvolnit-rezervace", "schedule": "* * * * *" }]
```

Úklid „při čtení" nechte být i pak — je to pojistka pro případ, že plánovač
tiše přestane chodit, a stojí jeden dotaz za dvacet vteřin.

První přihlášení do administrace: nastavte `ADMIN_BOOTSTRAP_EMAIL`
a `ADMIN_BOOTSTRAP_PASSWORD`, přihlaste se a **hned si heslo změňte**
(aplikace si o to sama řekne). Pak obě proměnné z prostředí smažte.

### Přechod domény z Webnode

1. Pár dní předem snížit TTL na `A`/`CNAME` záznamech na 300 s.
2. **Neměnit nameservery**, jen `A`/`CNAME`. Zachovat `MX`, `SPF`, `DKIM`
   a `_dmarc` — ztráta e-mailu v sezóně je horší než ztráta webu.
3. Přesměrování ze všech starých Webnode adres jsou v `next.config.ts`.
4. Po přepnutí znovu odeslat sitemapu v Search Console a zkontrolovat
   odkazy na Kudy z nudy, Google Business Profile a Facebooku.
5. Webnode nechat měsíc jako zálohu.

## Co ještě není hotové

- Pokladna a napojení na Comgate
- `/brana` — offline skenování vstupenek u vstupu
- E-shop s fyzickým zbožím
- Uživatelské účty s historií objednávek (zatím nákup bez registrace)
- Nahrávání fotek z administrace (zatím se cesta zadává ručně)
- Dárkové poukazy a sběr e-mailů mimo sezónu
