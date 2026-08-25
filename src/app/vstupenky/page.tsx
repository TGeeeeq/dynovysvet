import type { Metadata } from "next";
import { SlotPicker, type DayView } from "@/components/tickets/SlotPicker";
import { SectionHead } from "@/components/ui/SectionHead";
import { GourdPlate } from "@/components/illustrations/Gourd";
import { GOURDS } from "@/lib/illustrations/gourds";
import { planSeason, SEASON_2026 } from "@/lib/tickets/schedule";
import { moodAt, nextPumpkinOpening } from "@/lib/season";
import { FARM } from "@/content/farm";

export const metadata: Metadata = {
  title: "Vstupenky",
  description:
    "Vstupenky do Dýňového světa na Statku u Pipků. Vyberte si den a hodinu příchodu, zaplaťte kartou a QR vstupenku dostanete e-mailem.",
};

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

export default async function TicketsPage() {
  const now = new Date();
  const mood = moodAt(now);
  const season = nextPumpkinOpening(now).getUTCFullYear();
  const days = await loadDays();

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
        <SectionHead
          plate="I"
          title={`Vstupenky do Dýňového světa ${season}`}
          lead="Vstup na konkrétní hodinu. Držíme tím počet lidí na statku tak, aby si všichni měli kde hrát a bylo na koho se dívat."
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
          Prodej vstupenek na sezónu {season} zatím neběží. Termíny níže jsou
          vypsané, ale nakupovat půjde až od začátku září — dáme vědět e-mailem
          i na Facebooku.
        </p>
      )}

      <div className="mt-14">
        <SlotPicker days={days} />
      </div>

      <section className="mt-24 grid gap-10 border-t-2 border-ink/12 pt-12 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Proč na čas", "Statek má svoji kapacitu. Když se v jednu chvíli sejde příliš lidí, nikdo si nic neužije."],
          ["Jak vstupenka vypadá", "Přijde e-mailem jako QR kód. U vstupu ho ukážete v telefonu, tisknout nemusíte."],
          ["Když nemůžete přijet", "Ozvěte se nám na telefon nebo e-mail a domluvíme se na jiném termínu."],
          ["Platba na místě", "Kartou na statku bohužel ne. Hotově nebo QR platbou z telefonu ano."],
        ].map(([h, t]) => (
          <div key={h}>
            <h3 className="font-display text-lg font-semibold">{h}</h3>
            <p className="mt-2 text-[0.94rem] leading-relaxed text-ink-soft">{t}</p>
          </div>
        ))}
      </section>

      <p className="tabular mt-12 text-[0.88rem] text-ink-faint">
        Nejde to, nebo si nejste jistí? Zavolejte na {FARM.phoneHuman}.
      </p>
    </div>
  );
}
