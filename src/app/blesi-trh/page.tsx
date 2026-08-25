import type { Metadata } from "next";
import { SectionHead } from "@/components/ui/SectionHead";
import { TornEdge } from "@/components/ui/TornEdge";
import { InquiryForm } from "@/components/ui/InquiryForm";

export const metadata: Metadata = {
  title: "Dětský bleší trh",
  description:
    "Bleší trh a SWAP pro děti na Statku u Pipků. Děti prodávají hračky, knížky a oblečení, které už nepotřebují. Vstupné 80 Kč, prodejní místo 3 × 3 m za 80 Kč.",
};

const RULES = [
  {
    n: "1",
    title: "Registrace a zajištění místa",
    text: "Pro zajištění prodejního místa vyplňte rezervační formulář níže. Zájem o prodej je třeba nahlásit předem, abyste si zajistili místo 3 × 3 m.",
  },
  {
    n: "2",
    title: "Prodejní místo a vybavení",
    text: "„Základna 3 × 3 m“ slouží jako prodejní místo i jako místo na odpočinek. Vezměte si deku nebo malý stoleček, křesílko či lehátko. Stanoviště jsou venku v zahradě na slunném místě — hodí se opalovací krém, pokrývka hlavy nebo malé zastínění. Jinde v areálu je během odpoledne dost stínu.",
  },
  {
    n: "3",
    title: "Co nabízet",
    text: "Prosíme, nabízejte jen čisté a nepoškozené věci, které byste sami rádi dostali nebo koupili. Zachovejme společně kvalitu a úroveň prodeje.",
  },
  {
    n: "4",
    title: "Příjezd a instalace",
    text: "Příjezd a instalace probíhá z parkoviště podle pokynů personálu. K místu je možné zajet osobním vozidlem od 13:00 do 13:45, odjezd vozidla od prodejního místa je nutný do 14:00.",
  },
] as const;

export default function FleaMarketPage() {
  return (
    <>
      <section className="mx-auto max-w-[88rem] px-5 pb-14 pt-12 sm:px-8">
        <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-pumpkin">
          Bleší trh · SWAP · rodinný víkend
        </p>
        <h1 className="font-display letterpress mt-5 max-w-4xl text-balance text-[clamp(2.4rem,7vw,5.4rem)] font-semibold">
          Dětský bleší trh
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-xl leading-relaxed text-ink-soft">
          Děti mohou s pomocí rodičů prodávat své hračky, hry, knížky, oblečení
          i sportovní potřeby, které už nepotřebují. Můžete prodávat, kupovat,
          nebo se jen přijít podívat.
        </p>
        <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-ink-soft">
          Celá akce stojí na myšlence reuse — věcem dáváme druhý život.
          Nevyhazujeme, co už nepotřebujeme, ale posouváme dál, aby udělaly
          radost někomu dalšímu. Děti navíc získávají zkušenost s hodnotou věcí
          a základy finanční gramotnosti.
        </p>
        <p className="mt-6 max-w-2xl border-l-2 border-wheat pl-4 text-[0.95rem] text-ink-soft">
          I. ročník proběhl 28.—29. června 2025. Termín dalšího ročníku zatím
          není vypsaný — nechte nám e-mail ve formuláři níže a dáme vám vědět.
        </p>
      </section>

      <TornEdge fill="var(--color-paper-deep)" />

      <section className="bg-paper-deep">
        <div className="mx-auto grid max-w-[88rem] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <div>
            <h2 className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">Vstupné</h2>
            <dl className="mt-5 space-y-3">
              {[
                ["Vstupné 1 den / 1 osoba", "80 Kč", "projížďka traktorem-taxi v ceně"],
                ["Prodejní místo „základna 3 × 3 m“ / 1 den", "80 Kč", ""],
                ["Dítě do 2 let", "zdarma", ""],
              ].map(([who, price, note]) => (
                <div key={who} className="flex flex-wrap items-baseline gap-x-4 border-b border-ink/12 pb-3">
                  <dt className="min-w-52 flex-1">
                    {who}
                    {note && <span className="ml-2 text-[0.8rem] text-ink-faint">{note}</span>}
                  </dt>
                  <dd className="tabular text-lg">{price}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">
              Co je v ceně vstupného
            </h2>
            <ul className="mt-5 space-y-2 leading-relaxed text-ink-soft">
              {[
                "Stodola a zahrada statku",
                "Přírodní hřiště se slámohradem a slámobazénem",
                "Dřevěné atrakce",
                "Zvířátka",
                "Projížďka traktorem-taxi pro malé i velké",
              ].map((x) => (
                <li key={x} className="border-b border-ink/12 pb-2">{x}</li>
              ))}
            </ul>
            <p className="mt-5 text-[0.9rem] text-ink-faint">
              Občerstvení otevřeno. Parkování zdarma.
            </p>
          </div>
        </div>
        <TornEdge fill="var(--color-paper)" flip />
      </section>

      <section className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <SectionHead
          plate="I"
          title="Pravidla pro prodávající"
          lead="Prodej je určený pro nepodnikající, soukromé prodávající. Stánkaři jen po předchozí domluvě s organizátorem."
        />
        <ol className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {RULES.map((r) => (
            <li key={r.n}>
              <p className="tabular text-[0.72rem] text-pumpkin">0{r.n}</p>
              <hr className="rule-hand my-3" />
              <h3 className="font-display text-2xl font-semibold">{r.title}</h3>
              <p className="mt-2 text-pretty leading-relaxed text-ink-soft">{r.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl text-[0.9rem] text-ink-faint">
          Organizátor si vyhrazuje právo vyloučit prodávajícího v případě prodeje
          nevhodného zboží.
        </p>
      </section>

      <InquiryForm
              kind="blesi_trh"
              plate="II"
              title="Chci vědět o dalším ročníku"
              lead="Jakmile vypíšeme termín, ozveme se e-mailem. Nic jiného vám posílat nebudeme."
              fields={{
                radio: {
                  legend: "Mám zájem",
                  options: [
                    "Přijít jako návštěvník",
                    "Přijet prodávat",
                    "Jen mě informujte o dalších akcích na statku",
                  ],
                },
                message: { label: "Poznámka nebo dotaz" },
              }}
        submitLabel="Odeslat"
      />
    </>
  );
}
