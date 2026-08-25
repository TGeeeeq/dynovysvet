import type { PageProps } from "./types";
import { SlotPicker, type DayView } from "@/components/tickets/SlotPicker";
import { SectionHead } from "@/components/ui/SectionHead";
import { GourdPlate } from "@/components/illustrations/Gourd";
import { GOURDS } from "@/lib/illustrations/gourds";
import { planSeason, SEASON_2026 } from "@/lib/tickets/schedule";
import { moodAt, nextPumpkinOpening } from "@/lib/season";
import { FARM } from "@/content/farm";
import { TICKETS } from "@/content/copy/tickets";
import { copyFor } from "@/content/copy/types";


/**
 * Zatím se sloty počítají z plánu sezóny. Jakmile poběží databáze, tahle
 * funkce se nahradí dotazem `availability()` — tvar dat je záměrně stejný,
 * aby výměna byla na jeden řádek.
 */
async function loadDays(): Promise<DayView[]> {
  return planSeason(SEASON_2026).map((d) => ({
    date: d.date,
    slots: d.slots.map((s) => ({
      id: `${d.date}-${s.startsAt.slice(11, 16)}`,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      capacity: s.capacity,
      reserved: 0,
    })),
  }));
}

export async function Tickets({ locale }: PageProps) {
  const now = new Date();
  const mood = moodAt(now);
  const season = nextPumpkinOpening(now).getUTCFullYear();
  const days = await loadDays();
  const c = copyFor(TICKETS, locale);

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
        <SectionHead
          locale={locale}
          plate="I"
          title={`${c("titlePrefix")} ${season}`}
          lead={c("lead")}
        />
        <GourdPlate
          gourd={GOURDS[2]}
          size={170}
          seed={5}
          className="hidden text-ink lg:block"
        />
      </div>

      {!mood.ticketsOpen && (
        <p className="mt-8 max-w-2xl border-l-2 border-wheat bg-paper-deep/60 py-3 pl-4 text-[0.96rem] text-ink-soft">
          {c("notOpenYet").replace("{season}", String(season))}
        </p>
      )}

      <div className="mt-14">
        <SlotPicker days={days} locale={locale} />
      </div>

      <section className="mt-24 grid gap-10 border-t-2 border-ink/12 pt-12 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [c("faq1Title"), c("faq1Text")],
          [c("faq2Title"), c("faq2Text")],
          [c("faq3Title"), c("faq3Text")],
          [c("faq4Title"), c("faq4Text")],
        ].map(([h, body]) => (
          <div key={h}>
            <h3 className="font-display text-lg font-semibold">{h}</h3>
            <p className="mt-2 text-[0.94rem] leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </section>

      <p className="tabular mt-12 text-[0.88rem] text-ink-faint">
        {c("callUs")} {FARM.phoneHuman}.
      </p>
    </div>
  );
}
