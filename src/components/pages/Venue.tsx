import type { PageProps } from "./types";
import { SectionHead } from "@/components/ui/SectionHead";
import { TornEdge } from "@/components/ui/TornEdge";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { VENUE_PHOTOS } from "@/content/photos";
import { FARM } from "@/content/farm";
import { VENUE, VENUE_SPACES } from "@/content/copy/venue";
import { copyFor } from "@/content/copy/types";

export function Venue({ locale }: PageProps) {
  const c = copyFor(VENUE, locale);

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
      </section>

      <TornEdge fill="var(--color-paper-deep)" />

      <section className="bg-paper-deep">
        <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8">
          <SectionHead plate="I" title={c("spacesTitle")} />
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {VENUE_SPACES.map((sp, i) => (
              <article key={sp.name.cs}>
                <p className="tabular text-[0.72rem] text-pumpkin">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <hr className="rule-hand my-3" />
                <h3 className="font-display text-2xl font-semibold">{sp.name[locale]}</h3>
                <p className="mt-2 text-pretty leading-relaxed text-ink-soft">{sp.text[locale]}</p>
              </article>
            ))}
          </div>
        </div>
        <TornEdge fill="var(--color-paper)" flip />
      </section>

      <section className="py-16">
        <PhotoStrip photos={VENUE_PHOTOS} className="mx-auto max-w-[88rem]" />
      </section>

      <InquiryForm
        kind="pronajem"
        locale={locale}
        plate="II"
        title={c("formTitle")}
        lead={c("formLead")}
        fields={{
          phone: true,
          date: { label: c("formDateLabel") },
          radio: { legend: c("formRadioLegend"), options: [c("formOption1"), c("formOption2")] },
          message: { label: c("formMessageLabel"), hint: c("formMessageHint") },
        }}
        submitLabel={c("formSubmit")}
      />

      <section className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8">
        <p className="tabular text-[0.88rem] text-ink-faint">
          {c("orCall")}: {FARM.phoneHuman}
        </p>
      </section>
    </>
  );
}
