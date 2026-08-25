import type { Metadata } from "next";
import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { TERMS } from "@/content/legal";

export const metadata: Metadata = {
  title: "Obchodní podmínky",
  description:
    "Obchodní podmínky prodeje zboží v internetovém obchodě dynovysvet.cz — prodávající Josef Pipek, Nová Ves u Leštiny 5. Uzavření smlouvy, platba, doprava, odstoupení od smlouvy a reklamace.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
      {/* Jediná čitelná míra řádku. Právní text se nečte v mřížce. */}
      <article className="max-w-3xl py-8">
        <SectionHead plate="I" title={TERMS.title} />
        <p className="tabular mt-6 text-[0.78rem] uppercase tracking-[0.2em] text-ink-faint">
          {TERMS.updated}
        </p>

        {TERMS.articles.map((a) => (
          <section
            key={a.n || "hlavicka"}
            className="mt-12 border-t border-ink/15 pt-6 first-of-type:mt-10"
          >
            {a.title && (
              <h2 className="font-display letterpress flex gap-4 text-2xl font-semibold">
                <span className="tabular pt-[0.35rem] text-[0.8rem] text-pumpkin">
                  {a.n}
                </span>
                <span className="text-balance">{a.title}</span>
              </h2>
            )}

            <div
              className={`space-y-4 leading-relaxed text-ink-soft ${
                a.title ? "mt-4" : ""
              }`}
            >
              {a.paragraphs.map((p, k) => (
                <p key={`${k}-${p}`} className="text-pretty">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}

        <p className="mt-14 border-t border-ink/15 pt-6 text-[0.94rem] text-ink-faint">
          Souvisí:{" "}
          <Link
            href="/ochrana-soukromi"
            className="underline decoration-pumpkin underline-offset-4 hover:text-ink"
          >
            Pravidla ochrany soukromí
          </Link>
        </p>
      </article>
    </div>
  );
}
