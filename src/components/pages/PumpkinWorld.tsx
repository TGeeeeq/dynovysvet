import type { PageProps } from "./types";
import { href } from "@/lib/i18n/routes";
import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { TornEdge } from "@/components/ui/TornEdge";
import { GourdPlate } from "@/components/illustrations/Gourd";
import { GOURD_BY_SLUG, GOURDS } from "@/lib/illustrations/gourds";
import { ANIMALS, ATTRACTIONS, FARM, PRACTICAL, RULES } from "@/content/farm";
import { TICKET_TYPES } from "@/lib/tickets/schedule";
import { nextPumpkinOpening } from "@/lib/season";


const HOURS = [
  { days: "středa – pátek", time: "14:00 — 18:00" },
  { days: "sobota, neděle", time: "10:00 — 18:00" },
  { days: "27. — 29. 10. a svátek 28. 10.", time: "10:00 — 18:00", note: "podzimní prázdniny" },
];

export function PumpkinWorld({ locale }: PageProps) {
  const season = nextPumpkinOpening(new Date()).getUTCFullYear();

  return (
    <>
      <section className="mx-auto max-w-[88rem] px-5 pb-14 pt-12 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-pumpkin">
              20. září — 2. listopadu {season}
            </p>
            <h1 className="font-display letterpress mt-5 text-[clamp(2.8rem,8vw,6rem)] font-semibold">
              Dýňový svět
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-xl leading-relaxed text-ink-soft">
              Na podzim otevřeme dvůr, stodolu i zahradu. Ve stodole stojí regály
              plné odrůd, které tu za rok vyrostly — u každé je popiska, na co se
              hodí. Venku slámohrad, slámobazén a děti, které se odmítají vrátit
              do auta.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={href("tickets", locale)}
                className="rounded-full bg-ink px-7 py-3.5 text-paper transition-colors hover:bg-ember"
              >
                Vybrat termín
              </Link>
              <Link
                href={href("schools", locale)}
                className="border-b-2 border-ink/25 py-1 transition-colors hover:border-pumpkin hover:text-pumpkin"
              >
                Jedete se školkou nebo školou?
              </Link>
            </div>
          </div>
          <div className="hidden justify-self-center lg:block">
            <GourdPlate gourd={GOURD_BY_SLUG.muskatova} size={360} seed={2} className="text-ink" />
          </div>
        </div>
      </section>

      <TornEdge fill="var(--color-paper-deep)" />

      {/* ── Otevírací doba a vstupné ─────────────────────────────────────
          Dvě věci, kvůli kterým sem lidé chodí nejčastěji. Proto hned
          nahoře a v mono, aby se daly přečíst na jeden pohled. */}
      <section className="bg-paper-deep">
        <div className="mx-auto grid max-w-[88rem] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <div>
            <h2 className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">
              Otevírací doba
            </h2>
            <dl className="mt-5 space-y-3">
              {HOURS.map((h) => (
                <div key={h.days} className="flex flex-wrap items-baseline gap-x-4 border-b border-ink/12 pb-3">
                  <dt className="min-w-52 flex-1">
                    {h.days}
                    {h.note && (
                      <span className="ml-2 text-[0.8rem] text-ink-faint">({h.note})</span>
                    )}
                  </dt>
                  <dd className="tabular text-lg">{h.time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.9rem] text-ink-faint">
              V pondělí a v úterý je zavřeno.
            </p>
          </div>

          <div>
            <h2 className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">Vstupné</h2>
            <dl className="mt-5 space-y-3">
              {TICKET_TYPES.map((t) => (
                <div key={t.code} className="flex flex-wrap items-baseline gap-x-4 border-b border-ink/12 pb-3">
                  <dt className="min-w-52 flex-1">
                    {t.name}
                    {t.note && <span className="ml-2 text-[0.8rem] text-ink-faint">{t.note}</span>}
                  </dt>
                  <dd className="tabular text-lg">
                    {t.price === 0 ? "zdarma" : `${t.price} Kč`}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.9rem] text-ink-faint">
              Na statku nejde platit kartou. Hotově nebo QR platbou z telefonu ano —
              online koupené vstupenky se platí kartou.
            </p>
          </div>
        </div>
        <TornEdge fill="var(--color-paper)" flip />
      </section>

      {/* ── Co tu je ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <SectionHead
          plate="I"
          title="Co tu na vás čeká"
          lead="Statek funguje celý rok. Na dva měsíce k němu jen přibude výstava a otevřou se vrata."
        />
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {ATTRACTIONS.map((a, i) => (
            <article key={a.title} className={i === 0 ? "sm:col-span-2" : undefined}>
              <p className="tabular text-[0.72rem] text-pumpkin">{String(i + 1).padStart(2, "0")}</p>
              <hr className="rule-hand my-3" />
              <h3 className={`font-display font-semibold ${i === 0 ? "text-3xl" : "text-2xl"}`}>
                {a.title}
              </h3>
              <p className="mt-2 text-pretty leading-relaxed text-ink-soft">{a.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Odrůdy ──────────────────────────────────────────────────── */}
      <section className="border-y-2 border-ink/12 bg-paper-bright py-24">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <SectionHead
            plate="II"
            title="Odrůdy vystavené ve stodole"
            lead="U každé je popiska s názvem a s tím, na co se hodí. Většinu si můžete rovnou koupit s sebou."
          />
        </div>
        <ul className="mt-14 flex snap-x snap-mandatory gap-8 overflow-x-auto px-5 pb-6 sm:px-8">
          {GOURDS.map((g, i) => (
            <li key={g.slug} className="w-56 shrink-0 snap-start">
              <GourdPlate gourd={g} size={196} seed={i + 4} className="text-ink" />
              <hr className="rule-hand my-3" />
              <h3 className="font-display text-lg font-semibold">{g.name}</h3>
              <p className="tabular text-[0.7rem] italic text-ink-faint">{g.latin}</p>
              <p className="tabular mt-1 text-[0.82rem] text-ink-soft">{g.weight}</p>
              <p className="text-[0.86rem] text-ink-soft">{g.use}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Zvířata ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHead
            plate="III"
            title="Zvířata"
            lead="Hospodářská zvířata typická pro český venkov. Kozičky si berou granule přímo z ruky."
          />
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {ANIMALS.map((a) => (
              <li key={a.name} className="border-l-2 border-ink/15 pl-4">
                <p className="font-display text-xl font-semibold">{a.name}</p>
                <p className="text-[0.78rem] uppercase tracking-[0.16em] text-pumpkin">{a.kind}</p>
                {a.note && <p className="mt-1 text-[0.92rem] text-ink-soft">{a.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Praktické ───────────────────────────────────────────────── */}
      <section className="border-t-2 border-ink/12 bg-paper-deep/50">
        <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8">
          <SectionHead plate="IV" title="Než vyrazíte" />
          <dl className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRACTICAL.map((p) => (
              <div key={p.label} className="border-t border-ink/15 pt-3">
                <dt className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">{p.label}</dt>
                <dd className="mt-1.5 leading-relaxed text-ink-soft">{p.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-10 space-y-1 text-[0.9rem] text-ink-faint">
            {RULES.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-5 py-24 text-center sm:px-8">
        <h2 className="font-display letterpress mx-auto max-w-2xl text-balance text-[clamp(2rem,5vw,3.6rem)] font-semibold">
          Vstup je na konkrétní hodinu
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-ink-soft">
          Držíme tím počet lidí na statku tak, aby si všichni měli kde hrát.
          Uvnitř pak můžete zůstat, jak dlouho chcete.
        </p>
        <Link
          href={href("tickets", locale)}
          className="mt-8 inline-block rounded-full bg-pumpkin px-8 py-4 text-lg text-paper-bright transition-colors hover:bg-ember"
        >
          Koupit vstupenky
        </Link>
        <p className="tabular mt-6 text-[0.86rem] text-ink-faint">
          Raději po telefonu? {FARM.phoneHuman}
        </p>
      </section>
    </>
  );
}
