import type { PageProps } from "./types";
import { href } from "@/lib/i18n/routes";
import Link from "next/link";
import { SectionHead } from "@/components/ui/SectionHead";
import { legalFor } from "@/content/localised";
import { makeT } from "@/lib/i18n/dict";


export function Privacy({ locale }: PageProps) {
  const doc = legalFor(locale).privacy;
  const t = makeT(locale);

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
      {/* TODO: právní texty jsou převzaté z Webnode šablony a odkazují na slovenský zákon č. 18/2018; před spuštěním nechat zkontrolovat právníkem. */}
      <article className="max-w-3xl py-8">
        <SectionHead locale={locale} plate="I" title={doc.title} />
        <p className="tabular mt-6 text-[0.78rem] uppercase tracking-[0.2em] text-ink-faint">
          {doc.updated}
        </p>

        {doc.articles.map((a) => (
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
          {t("related")}:{" "}
          <Link
            href={href("terms", locale)}
            className="underline decoration-pumpkin underline-offset-4 hover:text-ink"
          >
            {t("navTerms")}
          </Link>
        </p>
      </article>
    </div>
  );
}
