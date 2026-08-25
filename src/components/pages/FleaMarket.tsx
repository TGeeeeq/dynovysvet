import type { PageProps } from "./types";
import { SectionHead } from "@/components/ui/SectionHead";
import { TornEdge } from "@/components/ui/TornEdge";
import { InquiryForm } from "@/components/ui/InquiryForm";
import {
  FLEA,
  FLEA_INCLUDED,
  FLEA_PRICES,
  FLEA_RULES,
} from "@/content/copy/fleaMarket";
import { copyFor } from "@/content/copy/types";

export function FleaMarket({ locale }: PageProps) {
  const c = copyFor(FLEA, locale);

  return (
    <>
      <section className="mx-auto max-w-[88rem] px-5 pb-14 pt-12 sm:px-8">
        <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-pumpkin">
          {c("kicker")}
        </p>
        <h1 className="font-display letterpress mt-5 max-w-4xl text-balance text-[clamp(2.4rem,7vw,5.4rem)] font-semibold">
          {c("title")}
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-xl leading-relaxed text-ink-soft">
          {c("lead")}
        </p>
        <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-ink-soft">
          {c("reuse")}
        </p>
        <p className="mt-6 max-w-2xl border-l-2 border-wheat pl-4 text-[0.95rem] text-ink-soft">
          {c("nextEdition")}
        </p>
      </section>

      <TornEdge fill="var(--color-paper-deep)" />

      <section className="bg-paper-deep">
        <div className="mx-auto grid max-w-[88rem] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <div>
            <h2 className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">{c("priceTitle")}</h2>
            <dl className="mt-5 space-y-3">
              {FLEA_PRICES.map((x) => (
                <div key={x.who.cs} className="flex flex-wrap items-baseline gap-x-4 border-b border-ink/12 pb-3">
                  <dt className="min-w-52 flex-1">
                    {x.who[locale]}
                    {x.note && (
                      <span className="ml-2 text-[0.8rem] text-ink-faint">{x.note[locale]}</span>
                    )}
                  </dt>
                  <dd className="tabular text-lg">{x.price[locale]}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">
              {c("includedTitle")}
            </h2>
            <ul className="mt-5 space-y-2 leading-relaxed text-ink-soft">
              {FLEA_INCLUDED[locale].map((x) => (
                <li key={x} className="border-b border-ink/12 pb-2">{x}</li>
              ))}
            </ul>
            <p className="mt-5 text-[0.9rem] text-ink-faint">
              {c("refreshments")}
            </p>
          </div>
        </div>
        <TornEdge fill="var(--color-paper)" flip />
      </section>

      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <SectionHead
          plate="I"
          title={c("rulesTitle")}
          lead={c("rulesLead")}
        />
        <ol className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {FLEA_RULES.map((r) => (
            <li key={r.n}>
              <p className="tabular text-[0.72rem] text-pumpkin">0{r.n}</p>
              <hr className="rule-hand my-3" />
              <h3 className="font-display text-2xl font-semibold">{r.title[locale]}</h3>
              <p className="mt-2 text-pretty leading-relaxed text-ink-soft">{r.text[locale]}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl text-[0.9rem] text-ink-faint">
          {c("rulesNote")}
        </p>
      </section>

      <InquiryForm
        kind="blesi_trh"
        locale={locale}
        plate="II"
        title={c("formTitle")}
        lead={c("formLead")}
        fields={{
          radio: {
            legend: c("formRadioLegend"),
            options: [c("formOption1"), c("formOption2"), c("formOption3")],
          },
          message: { label: c("formMessageLabel") },
        }}
        submitLabel={c("formSubmit")}
      />
    </>
  );
}
