import type { PageProps } from "./types";
import { SectionHead } from "@/components/ui/SectionHead";
import { TornEdge } from "@/components/ui/TornEdge";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { FOREST_PHOTOS } from "@/content/photos";
import { GourdPlate } from "@/components/illustrations/Gourd";
import { GOURD_BY_SLUG } from "@/lib/illustrations/gourds";
import { FARM } from "@/content/farm";
import {
  SCHOOLS,
  SCHOOL_PRACTICAL,
  SCHOOL_PROGRAMS,
  SCHOOL_TESTIMONIALS,
} from "@/content/copy/schools";
import { copyFor } from "@/content/copy/types";
import { makeT } from "@/lib/i18n/dict";

export function Schools({ locale }: PageProps) {
  const c = copyFor(SCHOOLS, locale);
  const t = makeT(locale);

  return (
    <>
      <section className="mx-auto max-w-[88rem] px-5 pb-12 pt-12 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-pumpkin">
              {c("kicker")}
            </p>
            <h1 className="font-display letterpress mt-5 text-balance text-[clamp(2.4rem,6.5vw,5rem)] font-semibold">
              {c("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-xl leading-relaxed text-ink-soft">
              {c("lead")}
            </p>
          </div>
          <div className="hidden justify-self-center lg:block">
            <GourdPlate gourd={GOURD_BY_SLUG.patison} size={300} seed={6} className="text-moss" />
          </div>
        </div>
      </section>

      <TornEdge fill="var(--color-paper-deep)" />

      {/* ── Programy ────────────────────────────────────────────────── */}
      <section className="bg-paper-deep">
        <div className="mx-auto max-w-[88rem] space-y-20 px-5 py-20 sm:px-8">
          {SCHOOL_PROGRAMS.map((p) => (
            <article key={p.plate} className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="tabular text-[0.72rem] uppercase tracking-[0.34em] text-pumpkin">
                  {c("programLabel")} {p.plate}
                </p>
                <h2 className="font-display letterpress mt-3 text-balance text-4xl font-semibold">
                  {p.name[locale]}
                </h2>
                <p className="tabular mt-3 text-[0.9rem] text-ink-faint">{p.when[locale]}</p>

                <dl className="mt-6 space-y-2">
                  {p.prices.map((x) => (
                    <div key={x.who.cs} className="flex items-baseline gap-4 border-b border-ink/12 pb-2">
                      <dt className="flex-1">{x.who[locale]}</dt>
                      <dd className="tabular text-lg">{x.price[locale]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="space-y-4 text-pretty leading-relaxed text-ink-soft">
                {p.text[locale].map((par) => <p key={par}>{par}</p>)}
              </div>
            </article>
          ))}
        </div>
        <TornEdge fill="var(--color-paper)" flip />
      </section>

      <section className="py-16">
        <PhotoStrip photos={FOREST_PHOTOS} className="mx-auto max-w-[88rem]" />
      </section>

      {/* ── Praktické informace ─────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <SectionHead
          plate="III"
          title={c("howTitle")}
          lead={c("howLead")}
        />
        <dl className="mt-12 grid gap-x-12 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {SCHOOL_PRACTICAL.map((x) => (
            <div key={x.label.cs} className="border-t border-ink/15 pt-3">
              <dt className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">
                {x.label[locale]}
              </dt>
              <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">
                {x.value[locale]}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 max-w-3xl border-l-2 border-wheat pl-5">
          <h3 className="font-display text-2xl font-semibold">{c("weatherTitle")}</h3>
          <p className="mt-3 text-pretty leading-relaxed text-ink-soft">{c("weather1")}</p>
          <p className="mt-3 text-pretty leading-relaxed text-ink-soft">{c("weather2")}</p>
        </div>
      </section>

      {/* ── Reference ───────────────────────────────────────────────── */}
      <section className="border-y-2 border-ink/12 bg-paper-bright py-20">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <h2 className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">
            {c("testimonialsTitle")}
          </h2>
          <ul className="mt-10 grid gap-10 lg:grid-cols-3">
            {SCHOOL_TESTIMONIALS.map((q) => (
              <li key={q.by}>
                <blockquote className="font-display text-pretty text-[1.28rem] leading-snug">
                  {q.text[locale]}
                </blockquote>
                <hr className="rule-hand my-4" />
                <p className="text-[0.84rem] uppercase tracking-[0.14em] text-pumpkin">{q.by}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Objednávka ──────────────────────────────────────────────── */}
      <InquiryForm
        kind="skola"
        locale={locale}
        plate="IV"
        title={c("formTitle")}
        lead={`${c("formLeadPrefix")} ${FARM.phoneHuman}.`}
        fields={{
          phone: true,
          date: { label: c("formDateLabel"), hint: c("formDateHint") },
          radio: {
            legend: c("formRadioLegend"),
            options: [c("formOption1"), c("formOption2"), c("formOption3")],
          },
          message: { label: c("formMessageLabel"), hint: c("formMessageHint") },
        }}
        submitLabel={t("formSend")}
      />

      <section className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8">
        <p className="max-w-2xl text-[0.86rem] leading-relaxed text-ink-faint">
          {c("operatorNote")
            .replace("{spolek}", FARM.spolek)
            .replace("{icoSpolek}", FARM.icoSpolek)
            .replace("{owner}", FARM.owner)
            .replace("{ico}", FARM.ico)}
        </p>
      </section>
    </>
  );
}
