# Dýňový svět — Statek u Pipků

Web pro sezónní akci na statku v Nové Vsi u Leštiny: prezentace, prodej
časovaných vstupenek s živou kapacitou, poptávkové formuláře pro školy
a pronájem prostor.

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
| `pnpm test` | testy (souběžnost rezervací, IBAN a SPAYD) |
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

### Živá kapacita bez zabití databáze

`/api/dostupnost` je cachovaný na CDN 10 s se `stale-while-revalidate`.
Dvacet tisíc lidí, kteří se ptají každých patnáct vteřin, tak znamená pár
dotazů do databáze za minutu, ne dvacet tisíc. Klient pollujeme s náhodným
rozptylem, jinak by se všichni zesynchronizovali do jedné vlny.

### Brána musí fungovat offline

Na statku je slabý signál. Vstupenkový token je podepsaný a ověřitelný
lokálně, bez dotazu na server.

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

Cron na uvolňování propadlých rezervací je v `vercel.json` a potřebuje
proměnnou `CRON_SECRET`.

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
- Administrace pro majitele
- E-shop s fyzickým zbožím
- Anglická mutace (staré `/en/*` se zatím přesměrovávají na češtinu)
