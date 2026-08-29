import type { PageProps } from "./types";
import { href } from "@/lib/i18n/routes";
import Link from "next/link";
import Image from "next/image";
import { PumpkinIntro } from "@/components/intro/PumpkinIntro";
import { SectionHead } from "@/components/ui/SectionHead";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { Figure } from "@/components/ui/Figure";
import { VarietyIndex } from "@/components/ui/VarietyIndex";
import { animalsFor, attractionsFor, FARM, practicalFor, rulesFor } from "@/content/farm";
import { farmPhotos, photo } from "@/content/photos";
import { varietiesFor } from "@/content/varieties";
import { moodAt, nextPumpkinOpening } from "@/lib/season";
import { HOME } from "@/content/copy/home";
import { copyFor } from "@/content/copy/types";
import { makeT } from "@/lib/i18n/dict";

export function Home({ locale }: PageProps) {
  const c = copyFor(HOME, locale);
  const t = makeT(locale);
  const attractions = attractionsFor(locale);
  const animals = animalsFor(locale);
  const practical = practicalFor(locale);
  const rules = rulesFor(locale);
  const varieties = varietiesFor(locale);
  const now = new Date();
  const mood = moodAt(now);
  const opening = nextPumpkinOpening(now);
  const season = opening.getUTCFullYear();

  const hero = photo("dsc_0278-0", locale);
  const pyramids = photo("img_20180921_175330", locale);
  const shelves = photo("dsc_0835-2", locale);

  return (
    <>
      <PumpkinIntro locale={locale} />

      {/* ── Hero ─────────────────────────────────────────────────────────
          Fotka přes celou šířku, ne kresba vedle nadpisu. Statek se prodává
          tím, jak vypadá — první, co má návštěvník vidět, je to místo.

          Snímek má prázdnou oblohu v horní části; text proto sedí dole,
          kde je pod ním masa dýní, a nadpis nikomu neleží přes tvář. */}
      <section className="relative isolate flex min-h-[32rem] items-end overflow-clip bg-night [height:clamp(32rem,84vh,52rem)]">
        <Image
          src={`/foto/${hero.base}-1600.webp`}
          alt={hero.alt}
          fill
          priority
          sizes="100vw"
          className="kenburns -z-10 object-cover object-[center_52%]"
        />
        {/* Scrim. Bez něj je bílý text na obloze čitelný jen za hezkého počasí. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(18_13_10/0.55)_0%,rgb(18_13_10/0.12)_32%,rgb(18_13_10/0.62)_74%,rgb(18_13_10/0.9)_100%)]"
        />

        <div className="mx-auto w-full max-w-[88rem] px-5 pb-14 pt-24 sm:px-8 sm:pb-20">
          <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-lantern">
            {c("kicker")}
          </p>

          <h1 className="font-display mt-5 max-w-4xl text-[clamp(3.4rem,12vw,9rem)] font-semibold text-paper-bright drop-shadow-[0_2px_30px_rgba(0,0,0,0.55)]">
            <span className="block">{c("titleTop")}</span>
            <span className="block pl-[0.08em] text-lantern">{c("titleBottom")}</span>
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-paper/85 sm:text-xl">
            {c("lead")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={href("tickets", locale)} className="btn btn-lantern">
              {mood.ticketsOpen
                ? t("buyTickets")
                : c("watchSeason").replace("{season}", String(season))}
            </Link>
            <Link href={href("pumpkinWorld", locale)} className="link-rule text-paper/90">
              {c("whatYouSee")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sezóna ───────────────────────────────────────────────────────
          Tři fakta, na která se lidé ptají první. Zůstávají ve tmě hned pod
          hero fotkou — světlo se rozsvítí až na papíře pod nimi. */}
      <section className="bg-night text-paper">
        <div className="mx-auto grid max-w-[88rem] px-5 sm:px-8 md:grid-cols-3">
          {[
            { k: c("statSeason"), v: "20. 9. — 2. 11.", n: `${c("statSeasonNote")} ${season}` },
            { k: c("statOpen"), v: c("statOpenValue"), n: c("statOpenNote") },
            { k: c("statPrice"), v: c("statPriceValue"), n: c("statPriceNote") },
          ].map((x) => (
            <div
              key={x.k}
              className="border-t border-paper/12 py-7 first:border-t-0 md:border-l md:border-t-0 md:px-9 md:first:border-l-0 md:first:pl-0"
            >
              <p className="text-[0.7rem] uppercase tracking-[0.3em] text-paper/45">{x.k}</p>
              <p className="tabular mt-2.5 text-2xl font-medium text-lantern">{x.v}</p>
              <p className="mt-1.5 text-[0.9rem] text-paper/65">{x.n}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Co u nás je ──────────────────────────────────────────────────
          Nepravidelná mřížka: první položka je široká, ostatní se skládají
          kolem. Šest stejných karet v řadě je to, čemu se vyhýbáme. */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <SectionHead locale={locale} plate="I" title={c("doTitle")} lead={c("doLead")} />
          <Figure
            photo={pyramids}
            ratio="3 / 2"
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="reveal"
          />
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {attractions.map((a, i) => (
            <article
              key={a.title}
              className={`reveal ${i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}`}
            >
              <p className="tabular text-[0.72rem] text-pumpkin">
                {String(i + 1).padStart(2, "0")}
              </p>
              <hr className="rule-hand my-3" />
              <h3
                className={`font-display font-semibold ${i === 0 ? "text-3xl" : "text-2xl"}`}
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
      <section className="border-y-2 border-ink/10 bg-paper-deep/45 pt-16 pb-10 lg:pt-20 lg:pb-14">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <p className="text-[0.74rem] uppercase tracking-[0.3em] text-ink-faint">
            {c("photosLabel")}
          </p>
        </div>
        <PhotoStrip photos={farmPhotos(locale)} className="mt-8 mx-auto max-w-[88rem]" />
      </section>

      {/* ── Odrůdy ───────────────────────────────────────────────────────
          Rejstřík, ne galerie. Fotku každé odrůdy zvlášť zatím nemáme a
          hromada dýní pod jménem konkrétní odrůdy by byla nepravda; až
          fotky dorazí, přepne se mřížka sama (`src/content/varieties.ts`). */}
      <section className="bg-paper-bright py-24 lg:py-32">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <SectionHead
              locale={locale}
              plate="II"
              title={c("varietiesTitle")}
              lead={c("varietiesLead")}
            />
            <Figure
              photo={shelves}
              ratio="16 / 10"
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="reveal"
            />
          </div>

          <VarietyIndex
            varieties={varieties}
            labels={{ weight: c("weight"), use: c("goodFor") }}
            className="mt-16 lg:mt-20"
          />
        </div>
      </section>

      {/* ── Zvířata ──────────────────────────────────────────────────────
          Jména jsou skutečná. Konkrétnost je nejsilnější důkaz, že tohle
          místo existuje. */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHead
            locale={locale}
            plate="III"
            title={c("animalsTitle")}
            lead={c("animalsLead")}
          />
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {animals.map((a) => (
              <li key={a.name} className="reveal border-l-2 border-ink/15 pl-4">
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
      <section className="border-t-2 border-ink/10 bg-paper-deep/50">
        <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 lg:py-24">
          <SectionHead locale={locale} plate="IV" title={c("beforeTitle")} />
          <dl className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {practical.map((p) => (
              <div key={p.label} className="border-t border-ink/15 pt-3">
                <dt className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">
                  {p.label}
                </dt>
                <dd className="mt-1.5 leading-relaxed text-ink-soft">{p.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-10 space-y-1 text-[0.9rem] text-ink-faint">
            {rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Závěrečná výzva ──────────────────────────────────────────────
          Zase noc. Web končí tam, kde začal — a poslední, co má návštěvník
          na obrazovce, je rozsvícené tlačítko. */}
      <section className="relative isolate overflow-clip bg-night text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_179_71/0.22),transparent)]"
        />
        <div className="mx-auto max-w-[88rem] px-5 py-28 text-center sm:px-8 lg:py-36">
          <h2 className="font-display mx-auto max-w-3xl text-balance text-[clamp(2.2rem,6vw,4.4rem)] font-semibold text-paper-bright">
            {mood.ticketsOpen
              ? c("ctaOpen")
              : `${c("ctaClosedPrefix")} ${season} ${c("ctaClosedSuffix")}`}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-paper/70">
            {mood.ticketsOpen ? c("ctaOpenLead") : c("ctaClosedLead")}
          </p>
          <div className="mt-10">
            <Link href={href("tickets", locale)} className="btn btn-lantern text-lg">
              {mood.ticketsOpen ? c("ctaButtonOpen") : c("ctaButtonClosed")}
            </Link>
          </div>
          <p className="tabular mt-9 text-[0.84rem] text-paper/45">
            {c("orCall")}: {FARM.phoneHuman}
          </p>
        </div>
      </section>
    </>
  );
}
