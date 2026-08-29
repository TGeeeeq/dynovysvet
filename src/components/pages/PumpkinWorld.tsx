import type { PageProps } from "./types";
import { href } from "@/lib/i18n/routes";
import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { TornEdge } from "@/components/ui/TornEdge";
import { Figure } from "@/components/ui/Figure";
import { VarietyIndex } from "@/components/ui/VarietyIndex";
import { photo } from "@/content/photos";
import { varietiesFor } from "@/content/varieties";
import { animalsFor, attractionsFor, FARM, practicalFor, rulesFor } from "@/content/farm";
import { TICKET_TYPES } from "@/lib/tickets/schedule";
import { nextPumpkinOpening } from "@/lib/season";
import { PUMPKIN_WORLD, PW_HOURS } from "@/content/copy/pumpkinWorld";
import { copyFor } from "@/content/copy/types";
import { makeT } from "@/lib/i18n/dict";


export function PumpkinWorld({ locale }: PageProps) {
  const c = copyFor(PUMPKIN_WORLD, locale);
  const t = makeT(locale);
  const attractions = attractionsFor(locale);
  const animals = animalsFor(locale);
  const practical = practicalFor(locale);
  const rules = rulesFor(locale);
  const season = nextPumpkinOpening(new Date()).getUTCFullYear();
  const varieties = varietiesFor(locale);
  const gate = photo("dsc_0683", locale);

  return (
    <>
      <section className="mx-auto max-w-[88rem] px-5 pb-14 pt-12 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-pumpkin">
              {c("kicker")} {season}
            </p>
            <h1 className="font-display letterpress mt-5 text-[clamp(2.8rem,8vw,6rem)] font-semibold">
              {c("title")}
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-xl leading-relaxed text-ink-soft">
              {c("lead")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={href("tickets", locale)}
                className="btn btn-solid"
              >
                {c("pickDate")}
              </Link>
              <Link
                href={href("schools", locale)}
                className="link-rule"
              >
                {c("schoolLink")}
              </Link>
            </div>
          </div>
          <Figure
            photo={gate}
            ratio="4 / 3"
            sizes="(max-width: 1024px) 100vw, 44vw"
            priority
            showCaption={false}
          />
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
              {c("hoursTitle")}
            </h2>
            <dl className="mt-5 space-y-3">
              {PW_HOURS.map((h) => (
                <div key={h.time + h.days.cs} className="flex flex-wrap items-baseline gap-x-4 border-b border-ink/12 pb-3">
                  <dt className="min-w-52 flex-1">
                    {h.days[locale]}
                    {h.note && (
                      <span className="ml-2 text-[0.8rem] text-ink-faint">({h.note[locale]})</span>
                    )}
                  </dt>
                  <dd className="tabular text-lg">{h.time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.9rem] text-ink-faint">
              {c("hoursClosed")}
            </p>
          </div>

          <div>
            <h2 className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">{c("priceTitle")}</h2>
            <dl className="mt-5 space-y-3">
              {TICKET_TYPES.map((tt) => (
                <div key={tt.code} className="flex flex-wrap items-baseline gap-x-4 border-b border-ink/12 pb-3">
                  <dt className="min-w-52 flex-1">
                    {tt.name[locale]}
                    {tt.note[locale] && (
                      <span className="ml-2 text-[0.8rem] text-ink-faint">{tt.note[locale]}</span>
                    )}
                  </dt>
                  <dd className="tabular text-lg">
                    {tt.price === 0 ? c("free") : `${tt.price} ${t("currency")}`}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.9rem] text-ink-faint">
              {c("cardNote")}
            </p>
          </div>
        </div>
        <TornEdge fill="var(--color-paper)" flip />
      </section>

      {/* ── Co tu je ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <SectionHead
          locale={locale}
          plate="I"
          title={c("whatTitle")}
          lead={c("whatLead")}
        />
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {attractions.map((a, i) => (
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
            locale={locale}
            plate="II"
            title={c("varietiesTitle")}
            lead={c("varietiesLead")}
          />
          <VarietyIndex
            varieties={varieties}
            labels={{ weight: t("weightLabel"), use: t("goodForLabel") }}
            className="mt-14"
          />
        </div>
      </section>

      {/* ── Zvířata ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHead
            locale={locale}
            plate="III"
            title={c("animalsTitle")}
            lead={c("animalsLead")}
          />
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {animals.map((a) => (
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
          <SectionHead locale={locale} plate="IV" title={c("beforeTitle")} />
          <dl className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {practical.map((p) => (
              <div key={p.label} className="border-t border-ink/15 pt-3">
                <dt className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">{p.label}</dt>
                <dd className="mt-1.5 leading-relaxed text-ink-soft">{p.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-10 space-y-1 text-[0.9rem] text-ink-faint">
            {rules.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-5 py-24 text-center sm:px-8">
        <h2 className="font-display letterpress mx-auto max-w-2xl text-balance text-[clamp(2rem,5vw,3.6rem)] font-semibold">
          {c("ctaTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-ink-soft">
          {c("ctaLead")}
        </p>
        <Link
          href={href("tickets", locale)}
          className="btn btn-pumpkin mt-8 text-lg"
        >
          {t("buyTickets")}
        </Link>
        <p className="tabular mt-6 text-[0.86rem] text-ink-faint">
          {c("preferPhone")} {FARM.phoneHuman}
        </p>
      </section>
    </>
  );
}
