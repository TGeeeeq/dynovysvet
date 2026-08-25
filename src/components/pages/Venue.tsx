import type { PageProps } from "./types";
import { SectionHead } from "@/components/ui/SectionHead";
import { TornEdge } from "@/components/ui/TornEdge";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { VENUE_PHOTOS } from "@/content/photos";
import { FARM } from "@/content/farm";


const SPACES = [
  {
    name: "Restaurace",
    text: "Vybavená, s kuchyňským a sociálním zázemím. Vytápěná, takže funguje celoročně.",
  },
  {
    name: "Uzavřený dvůr",
    text: "Prostorný a soukromý. Kolem něj toalety včetně bezbariérové.",
  },
  {
    name: "Stodola",
    text: "Krytý prostor i s patrem. V sezóně v ní stojí slámohrad.",
  },
  {
    name: "Zahrada",
    text: "Se stylovými dřevěnými a slaměnými atrakcemi. Pro oslavu s dětmi to bývá hlavní důvod, proč sem lidé jezdí.",
  },
] as const;

export function Venue({ locale }: PageProps) {
  return (
    <>
      <section className="mx-auto max-w-[88rem] px-5 pb-14 pt-12 sm:px-8">
        <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-pumpkin">
          Svatby · oslavy · firemní akce
        </p>
        <h1 className="font-display letterpress mt-5 max-w-4xl text-balance text-[clamp(2.4rem,7vw,5.4rem)] font-semibold">
          Statek si můžete pronajmout
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-xl leading-relaxed text-ink-soft">
          Nabízíme prostory Statku u Pipků k pořádání svateb, oslav a podobných
          soukromých či firemních akcí. Můžete využít vybavenou restauraci,
          uzavřený dvůr, stodolu i zahradu.
        </p>
      </section>

      <TornEdge fill="var(--color-paper-deep)" />

      <section className="bg-paper-deep">
        <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8">
          <SectionHead plate="I" title="Co je k dispozici" />
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {SPACES.map((s, i) => (
              <article key={s.name}>
                <p className="tabular text-[0.72rem] text-pumpkin">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <hr className="rule-hand my-3" />
                <h3 className="font-display text-2xl font-semibold">{s.name}</h3>
                <p className="mt-2 text-pretty leading-relaxed text-ink-soft">{s.text}</p>
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
            plate="II"
            title="Poptávka pořádání akce"
            lead="Napište nám, o jakou akci jde a jaký bude předběžný počet účastníků. Ozveme se co nejdřív zpátky."
            fields={{
              phone: true,
              date: { label: "Předběžný termín akce" },
              radio: { legend: "Mám zájem o", options: ["Konzultaci", "Cenovou nabídku"] },
              message: {
                label: "Zpráva",
                hint: "O jakou akci se jedná a kolik lidí přibližně přijede.",
              },
            }}
        submitLabel="Poptat"
      />

      <section className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8">
        <p className="tabular text-[0.88rem] text-ink-faint">
          Nebo rovnou zavolejte: {FARM.phoneHuman}
        </p>
      </section>
    </>
  );
}
