import type { PageProps } from "./types";
import { SectionHead } from "@/components/ui/SectionHead";
import { growingFor } from "@/content/localised";
import { SEO } from "@/content/seo";


/** Tabule I patří úvodu, další tři jednotlivým sekcím. */
const PLATES = ["I", "II", "III", "IV"] as const;

export function Growing({ locale }: PageProps) {
  const { intro, sections } = growingFor(locale);

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
      <section className="py-8">
        <SectionHead
          plate={PLATES[0]}
          title={SEO.growing[locale].title}
          lead={intro}
        />
      </section>

      {/* ── Tři sekce ze starého webu ───────────────────────────────────
          Nadpis vlevo, číslované řádky vpravo pod sebou, oddělené vlasovou
          linkou. Je to seznam zkušeností, ne sada karet — ať tak i vypadá. */}
      {sections.map((section, si) => (
        <section key={section.title} className="py-14">
          <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionHead plate={PLATES[si + 1]} title={section.title} />

            <ol>
              {section.items.map((item, i) => (
                <li
                  key={`${i}-${item}`}
                  className="flex gap-5 border-t border-ink/15 py-4 last:border-b last:border-ink/15"
                >
                  <span className="tabular pt-[0.3rem] text-[0.72rem] text-pumpkin">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-pretty leading-relaxed text-ink-soft">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}
    </div>
  );
}
