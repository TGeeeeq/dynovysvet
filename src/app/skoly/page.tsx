import type { Metadata } from "next";
import { SectionHead } from "@/components/ui/SectionHead";
import { TornEdge } from "@/components/ui/TornEdge";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { FOREST_PHOTOS } from "@/content/photos";
import { GourdPlate } from "@/components/illustrations/Gourd";
import { GOURD_BY_SLUG } from "@/lib/illustrations/gourds";
import { FARM } from "@/content/farm";

export const metadata: Metadata = {
  title: "Pro MŠ, ZŠ a skupiny dětí",
  description:
    "Dopolední programy pro mateřské školy, první stupeň ZŠ a skupiny dětí. Výlet do Dýňového světa na podzim a Příroda hrou na lesním hřišti na jaře.",
};

const PROGRAMS = [
  {
    plate: "I",
    name: "Výlet do „Dýňového světa“",
    when: "podzim · 20. 9. — 2. 11.",
    prices: [{ who: "dítě", price: "100 Kč" }, { who: "pedagogický doprovod", price: "zdarma" }],
    text: [
      "Na statku v Nové Vsi u Leštiny pěstujeme tykve různých druhů, tvarů a barev. Oranžové dýně na Halloween od nejmenších, vhodných na strašidla pro školky, po ty obrovské. K tomu druhy na vaření a drobné dekorativní tykvičky.",
      "Ve stodole máme prodej dýní formou výstavních regálů. U každé jsou popisky s názvem a možným využitím konkrétního druhu. Ve stodole také míváme telátko, prasátko a velké králíky.",
      "V zahradě jsou dřevěné a slaměné atrakce, slámohrad ze slaměných balíků a „slámobazén“. Mezi poskládanými dýněmi jsou různé probíhačky.",
    ],
  },
  {
    plate: "II",
    name: "Výlet do lesa — „Příroda hrou“",
    when: "jaro · polovina dubna — konec června",
    prices: [
      { who: "žák I. stupně ZŠ", price: "150 Kč" },
      { who: "dítě z MŠ", price: "120 Kč" },
      { who: "pedagogický doprovod", price: "zdarma" },
    ],
    text: [
      "Na „lesní hřiště“ a zpět ke statku vás sveze cestou mezi poli traktor-taxi.",
      "V lese najdete speciálně upravenou paseku s probíháním mezi stromy — „bludištěm“. V prostoru lesa jsou prvky z upravených smrkových klád, kde si děti užijí volný pohyb a zábavu v přírodě.",
      "Děti zažijí les všemi smysly, poznávají základní druhy stromů, jejich listy a plody. Program vychází z principů lesní pedagogiky.",
      "Každá školní skupina si na „lesní zahrádce“ vyzkouší zasadit svůj strom. Děti se tak podílejí na obnově lesa po kůrovcové kalamitě — společně vytvoříme nový les.",
      "Pro ZŠ je součástí opékání „hadů“. V případě nepřízně počasí se můžeme ohřát u ohýnku a je k dispozici teplý nápoj.",
    ],
  },
] as const;

const PRACTICAL = [
  ["Kdy přijíždíte", "Skupiny k nám přijíždějí v pracovní dny zhruba kolem deváté hodiny ranní. Návštěva trvá asi dvě hodiny, kolem jedenácté skupiny odjíždějí, aby stihly oběd. Delší pobyt jen po předchozí domluvě."],
  ["Autobus", "Pro autobusy máme připravené parkoviště cca 100 metrů od statku."],
  ["Svačina", "Některé školky svačí po cestě v autobuse, většina u nás na statku nebo přímo v lese."],
  ["Oblečení", "Přizpůsobte pobytu v přírodě. Jarní i podzimní rána bývají chladná a plná rosy v trávě, někdy s mrazíky. Ke konci října už to bývá na zimní oblečení."],
  ["Když je zima", "Na statku máme vytápěnou restauraci, kde se děti mohou ohřát. Zahrada ale nabízí dost aktivit, u kterých se zahřejí pohybem."],
  ["Toalety", "Ve dvoře dámské, pánské i bezbariérové s dostatečnou kapacitou. Toaleta je i na lesním hřišti."],
  ["Dýně pro každého", "Na podzim si můžete koupit pro každé dítě malou tykev na tvoření. Když nám dáte vědět předem, jsme na větší odběr připravení."],
  ["Wi-Fi", "V celém areálu zdarma."],
] as const;

const TESTIMONIALS = [
  {
    text: "Velice děkujeme za krásně zorganizovaný a připravený program pro děti. Děti si užily celý den venku, den plný her, hledání, sázení stromku, bludiště. Opékání hadů bylo pro děti dalším zážitkem. Celou radost završil taxi traktor, ze kterého jsme byli uneseni všichni. Děkujeme za krásně strávený školní výlet a určitě jsme nebyli naposledy.",
    by: "ZŠ Nuselská, Havlíčkův Brod",
  },
  {
    text: "Výlet se nám moc líbil, myslím, že pro děti to bylo něco nového a zajímavého. Sázení stromků, jízda na valníku i opékání těsta. I když to jsou děti z vesnice, tak to někteří vůbec neznají. Za nás paráda. Moc děkujeme.",
    by: "Příměstský tábor, Tělocvičná jednota Sokol Roveň",
  },
  {
    text: "Ještě jednou děkujeme. S programem jsme byli opravdu moc spokojeni.",
    by: "ZŠ Lánecká, Světlá nad Sázavou",
  },
] as const;

export default function SchoolsPage() {
  return (
    <>
      <section className="mx-auto max-w-[88rem] px-5 pb-12 pt-12 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-pumpkin">
              Dopolední programy
            </p>
            <h1 className="font-display letterpress mt-5 text-balance text-[clamp(2.4rem,6.5vw,5rem)] font-semibold">
              Pro školky, první stupeň a skupiny dětí
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-xl leading-relaxed text-ink-soft">
              Dva programy podle ročního období. Na podzim výstava dýní a zahrada
              se slámou, na jaře les upravený pro volnou hru. Obojí venku,
              obojí končí tak, aby se stihl oběd.
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
          {PROGRAMS.map((p) => (
            <article key={p.name} className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="tabular text-[0.72rem] uppercase tracking-[0.34em] text-pumpkin">
                  Program {p.plate}
                </p>
                <h2 className="font-display letterpress mt-3 text-balance text-4xl font-semibold">
                  {p.name}
                </h2>
                <p className="tabular mt-3 text-[0.9rem] text-ink-faint">{p.when}</p>

                <dl className="mt-6 space-y-2">
                  {p.prices.map((x) => (
                    <div key={x.who} className="flex items-baseline gap-4 border-b border-ink/12 pb-2">
                      <dt className="flex-1">{x.who}</dt>
                      <dd className="tabular text-lg">{x.price}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="space-y-4 text-pretty leading-relaxed text-ink-soft">
                {p.text.map((t) => <p key={t}>{t}</p>)}
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
          title="Jak to u nás chodí"
          lead="Většinu otázek dostáváme opakovaně, tak je tu rovnou zodpovídáme."
        />
        <dl className="mt-12 grid gap-x-12 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {PRACTICAL.map(([label, value]) => (
            <div key={label} className="border-t border-ink/15 pt-3">
              <dt className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">{label}</dt>
              <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 max-w-3xl border-l-2 border-wheat pl-5">
          <h3 className="font-display text-2xl font-semibold">Když se pokazí počasí</h3>
          <p className="mt-3 text-pretty leading-relaxed text-ink-soft">
            Výlet se dá bez dalšího odvolat. Vždycky si bereme telefon na
            organizátora a jednou až dvakrát za sezónu školky sami obvoláváme —
            když má pršet celý den, výlet by nebyl příjemný. Vaše rozhodnutí
            výlet zrušit respektujeme stejně.
          </p>
          <p className="mt-3 text-pretty leading-relaxed text-ink-soft">
            Když nepřeje jen část dopoledne, máme dost krytého prostoru: stodolu,
            patro ve stodole, zastřešený prostor u stodoly, restauraci a venkovní
            posezení. Na podzim se dá tou dobou zabavit vyřezáváním dýně.
          </p>
        </div>
      </section>

      {/* ── Reference ───────────────────────────────────────────────── */}
      <section className="border-y-2 border-ink/12 bg-paper-bright py-20">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <h2 className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">
            Co nám napsaly školy
          </h2>
          <ul className="mt-10 grid gap-10 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
              <li key={t.by}>
                <blockquote className="font-display text-pretty text-[1.28rem] leading-snug">
                  {t.text}
                </blockquote>
                <hr className="rule-hand my-4" />
                <p className="text-[0.84rem] uppercase tracking-[0.14em] text-pumpkin">{t.by}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Objednávka ──────────────────────────────────────────────── */}
      <InquiryForm
        kind="skola"
        plate="IV"
        title="Domluvit termín"
        lead={`Napište nám, o jaký program máte zájem a kolik dětí přijede. Ozveme se e-mailem nebo telefonicky. Rychlejší je zavolat na ${FARM.phoneHuman}.`}
        fields={{
          phone: true,
              date: { label: "Předběžný termín", hint: "Nemusí být závazný, upřesníme spolu." },
              radio: {
                legend: "O jaký program jde",
                options: ["Výlet do Dýňového světa", "Výlet do lesa – Příroda hrou", "Ještě nevím"],
              },
              message: {
                label: "Poznámka",
                hint: "Počet dětí, věk, jestli chcete malé dýně pro každého.",
              },
            }}
        submitLabel="Odeslat poptávku"
      />

      <section className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8">
        <p className="max-w-2xl text-[0.86rem] leading-relaxed text-ink-faint">
          Lesní programy provozuje {FARM.spolek}, IČO {FARM.icoSpolek}.
          Dýňový svět provozuje {FARM.owner}, IČ {FARM.ico}.
        </p>
      </section>
    </>
  );
}
