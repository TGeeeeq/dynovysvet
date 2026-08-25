import Link from "next/link";
import { GOURDS } from "@/lib/illustrations/gourds";
import { GourdPlate } from "@/components/illustrations/Gourd";
import { TornEdge } from "@/components/ui/TornEdge";
import { SectionHead } from "@/components/ui/SectionHead";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { ANIMALS, ATTRACTIONS, FARM, PRACTICAL, RULES } from "@/content/farm";
import { FARM_PHOTOS } from "@/content/photos";
import { moodAt, nextPumpkinOpening } from "@/lib/season";

export default function HomePage() {
  const now = new Date();
  const mood = moodAt(now);
  const opening = nextPumpkinOpening(now);
  const season = opening.getUTCFullYear();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────
          Záměrně asymetrické. Vycentrovaný nadpis se dvěma tlačítky pod ním
          je nejrychlejší cesta k tomu, aby web vypadal jako každý druhý. */}
      <section className="relative overflow-clip">
        <div className="mx-auto grid max-w-[88rem] items-center gap-10 px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-pumpkin">
              Nová Ves u Leštiny · Vysočina
            </p>

            <h1 className="font-display letterpress mt-5 text-[clamp(3.2rem,11vw,8.5rem)] font-semibold">
              <span className="block">Dýňový</span>
              <span className="block pl-[0.08em] text-pumpkin">svět</span>
            </h1>

            <p className="mt-7 max-w-xl text-pretty text-xl leading-relaxed text-ink-soft">
              Pěstujeme dýně. Na podzim otevřeme dvůr, stodolu i zahradu a ukážeme
              vám, kolik jich vlastně existuje. Děti mezitím obsadí slámohrad.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/vstupenky"
                className="rounded-full bg-ink px-7 py-3.5 text-paper transition-colors hover:bg-ember"
              >
                {mood.ticketsOpen ? "Koupit vstupenky" : `Hlídat start sezóny ${season}`}
              </Link>
              <Link
                href="/dynovy-svet"
                className="border-b-2 border-ink/25 py-1 text-ink transition-colors hover:border-pumpkin hover:text-pumpkin"
              >
                Co u nás uvidíte
              </Link>
            </div>
          </div>

          {/* Hokaido jako první tabule almanachu. Sedí vedle nadpisu, ne pod
              ním — jinak zůstane uprostřed hero sekce prázdné místo. */}
          <div className="relative hidden justify-self-end lg:-mt-10 lg:block">
            <GourdPlate gourd={GOURDS[0]} size={430} seed={3} className="text-ink" />
            <figcaption className="absolute -bottom-4 left-4 max-w-56 border-l-2 border-pumpkin pl-3">
              <p className="font-display text-lg font-semibold">{GOURDS[0].name}</p>
              <p className="tabular text-[0.72rem] text-ink-faint">{GOURDS[0].latin}</p>
              <p className="mt-1 text-[0.86rem] text-ink-soft">{GOURDS[0].use}</p>
            </figcaption>
          </div>
        </div>

        <TornEdge fill="var(--color-paper-deep)" />
      </section>

      {/* ── Sezóna ───────────────────────────────────────────────────────
          Tři fakta, na která se lidé ptají první. Číslice v mono s tabulkovými
          ciframi, aby se při změně nekývaly. */}
      <section className="bg-paper-deep">
        <div className="mx-auto grid max-w-[88rem] gap-px overflow-hidden px-5 pb-4 pt-6 sm:px-8 sm:pb-8 md:grid-cols-3">
          {[
            { k: "Sezóna", v: "20. 9. — 2. 11.", n: `Ročník ${season}` },
            { k: "Otevřeno", v: "st–pá 14—18", n: "so–ne a svátky 10—18" },
            { k: "Vstupné", v: "120 / 100 Kč", n: "děti do 2 let zdarma · pes 10 Kč" },
          ].map((x) => (
            <div key={x.k} className="py-6 md:px-8 md:first:pl-0">
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-ink-faint">{x.k}</p>
              <p className="tabular mt-2 text-2xl font-medium text-ink">{x.v}</p>
              <p className="mt-1 text-[0.9rem] text-ink-soft">{x.n}</p>
            </div>
          ))}
        </div>
        <TornEdge fill="var(--color-paper)" flip />
      </section>

      {/* ── Co u nás je ──────────────────────────────────────────────────
          Nepravidelná mřížka: první položka je široká, ostatní se skládají
          kolem. Šest stejných karet v řadě je to, čemu se vyhýbáme. */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <SectionHead
          plate="I"
          title="Co se na statku dá dělat"
          lead="Nic z toho není atrakce postavená pro návštěvníky. Je to fungující statek, jen jsme na dva měsíce otevřeli vrata."
        />

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {ATTRACTIONS.map((a, i) => (
            <article
              key={a.title}
              className={i === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}
            >
              <p className="tabular text-[0.72rem] text-pumpkin">
                {String(i + 1).padStart(2, "0")}
              </p>
              <hr className="rule-hand my-3" />
              <h3
                className={`font-display font-semibold ${
                  i === 0 ? "text-3xl" : "text-2xl"
                }`}
              >
                {a.title}
              </h3>
              <p className="mt-2 text-pretty leading-relaxed text-ink-soft">{a.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Fotky ────────────────────────────────────────────────────────
          Po textové sekci potřebuje oko důkaz, že to místo doopravdy
          existuje. Fotky jsou z různých let a přístrojů, drží je pohromadě
          společný grading. */}
      <section className="border-t-2 border-ink/12 bg-paper-deep/40 py-16">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <p className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">
            Ze statku
          </p>
        </div>
        <PhotoStrip photos={FARM_PHOTOS} className="mt-8 mx-auto max-w-[88rem]" />
      </section>

      {/* ── Odrůdy ───────────────────────────────────────────────────────
          Herbář. Vodorovně scrollovatelný, protože tabulí přibývá s tím,
          co zrovna pěstují. */}
      <section className="border-y-2 border-ink/12 bg-paper-bright py-24">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <SectionHead
            plate="II"
            title="Odrůdy, které tu letos rostou"
            lead="Semena vozíme od švýcarského a německého dodavatele. Vlastní osivo nenabízíme — dýně se navzájem spráší a příští rok by z nich vyrostlo něco jiného."
          />
        </div>

        <ul className="mt-14 flex snap-x snap-mandatory gap-8 overflow-x-auto px-5 pb-6 sm:px-8 [scrollbar-width:thin]">
          {GOURDS.map((g, i) => (
            <li
              key={g.slug}
              className="w-60 shrink-0 snap-start"
              style={{ rotate: `${(i % 3) - 1 === 0 ? 0 : ((i % 3) - 1) * 0.5}deg` }}
            >
              <GourdPlate gourd={g} size={210} seed={i} className="text-ink" />
              <hr className="rule-hand my-3" />
              <h3 className="font-display text-xl font-semibold">{g.name}</h3>
              <p className="tabular text-[0.72rem] italic text-ink-faint">{g.latin}</p>
              <dl className="mt-2 space-y-0.5 text-[0.88rem] text-ink-soft">
                <div className="flex gap-2">
                  <dt className="text-ink-faint">Váha</dt>
                  <dd className="tabular">{g.weight}</dd>
                </div>
                <div>
                  <dt className="sr-only">Vhodná na</dt>
                  <dd>{g.use}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Zvířata ──────────────────────────────────────────────────────
          Jména jsou skutečná. Konkrétnost je nejsilnější důkaz, že tohle
          místo existuje. */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHead
            plate="III"
            title="Kdo tu bydlí"
            lead="Hospodářská zvířata typická pro český venkov. Většina se dá pohladit, kozičky si berou granule přímo z ruky."
          />
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {ANIMALS.map((a) => (
              <li key={a.name} className="border-l-2 border-ink/15 pl-4">
                <p className="font-display text-xl font-semibold">{a.name}</p>
                <p className="text-[0.78rem] uppercase tracking-[0.16em] text-pumpkin">
                  {a.kind}
                </p>
                {a.note && <p className="mt-1 text-[0.92rem] text-ink-soft">{a.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Praktické ────────────────────────────────────────────────────
          Definiční seznam, ne karty. Je to referenční informace, tak ať
          vypadá jako referenční informace. */}
      <section className="border-t-2 border-ink/12 bg-paper-deep/50">
        <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8">
          <SectionHead plate="IV" title="Než vyrazíte" />
          <dl className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRACTICAL.map((p) => (
              <div key={p.label} className="border-t border-ink/15 pt-3">
                <dt className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">
                  {p.label}
                </dt>
                <dd className="mt-1.5 leading-relaxed text-ink-soft">{p.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-10 space-y-1 text-[0.9rem] text-ink-faint">
            {RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Závěrečná výzva ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 text-center sm:px-8">
        <h2 className="font-display letterpress mx-auto max-w-3xl text-balance text-[clamp(2.2rem,6vw,4.2rem)] font-semibold">
          {mood.ticketsOpen
            ? "Vyberte si den a hodinu"
            : `Sezóna ${season} začíná 20. září`}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-ink-soft">
          {mood.ticketsOpen
            ? "Vstup je na konkrétní čas, aby se na statku nesešlo víc lidí, než unese. Vstupenku dostanete e-mailem jako QR kód."
            : "Nechte nám e-mail a dáme vám vědět v den, kdy se otevře prodej vstupenek. Nic jiného vám posílat nebudeme."}
        </p>
        <div className="mt-9">
          <Link
            href="/vstupenky"
            className="inline-block rounded-full bg-pumpkin px-8 py-4 text-lg text-paper-bright transition-colors hover:bg-ember"
          >
            {mood.ticketsOpen ? "Na vstupenky" : "Chci vědět o startu"}
          </Link>
        </div>
        <p className="tabular mt-8 text-[0.84rem] text-ink-faint">
          Nebo zavolejte: {FARM.phoneHuman}
        </p>
      </section>
    </>
  );
}
