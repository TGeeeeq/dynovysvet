import type { PageProps } from "./types";
import { SectionHead } from "@/components/ui/SectionHead";
import { type Recipe } from "@/content/recipes";
import { recipesFor } from "@/content/localised";
import { makeT } from "@/lib/i18n/dict";
import { HTML_LANG, type Locale } from "@/lib/i18n/config";
import { FARM } from "@/content/farm";


/**
 * Odděluje úvodní množství od názvu suroviny, aby číslice mohly jít do mono
 * s tabulkovými ciframi a seznam surovin se opticky srovnal do sloupce.
 * Když řádek žádným množstvím nezačíná (např. „sůl, pepř“), vrací jen text.
 */
function splitQuantity(item: string): [string | null, string] {
  const m = item.match(
    /^((?:\d+[\d.,/ –-]*|[¼½¾⅓⅔])\s*(?:kg|dkg|g|dl|cl|ml|l|ks|hrnky|hrnek|hrnku)?)\s+(.+)$/,
  );
  if (!m) return [null, item];
  return [m[1].trim(), m[2]];
}

/** Strukturovaná data pro každý recept zvlášť — Google je čte po jednom. */
function recipeJsonLd(r: Recipe, locale: Locale, category: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    ...(r.intro ? { description: r.intro } : {}),
    author: { "@type": "Organization", name: FARM.name },
    recipeCategory: category,
    inLanguage: HTML_LANG[locale],
    ...(r.ingredients.length ? { recipeIngredient: r.ingredients } : {}),
    ...(r.steps.length
      ? { recipeInstructions: r.steps.map((s) => ({ "@type": "HowToStep", text: s })) }
      : {}),
  };
}

export function Recipes({ locale }: PageProps) {
  const recipes = recipesFor(locale);
  const t = makeT(locale);

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
      {/* ── Úvod a rejstřík ─────────────────────────────────────────────
          Receptů je dvaadvacet. Rejstřík nahoře je jediný způsob, jak se
          v nich dá na telefonu vyznat, aniž by se stránka rozpadla na
          dvaadvacet karet. */}
      <section className="py-8">
        <SectionHead
          plate="I"
          title={t("recipesTitle")}
          lead={t("recipesLead")}
        />

        <nav aria-label={t("recipesIndex")} className="mt-12 border-t border-ink/15 pt-6">
          <ol className="grid gap-x-10 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r, i) => (
              <li key={r.slug} className="flex gap-3">
                <span className="tabular pt-[0.15rem] text-[0.72rem] text-pumpkin">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <a
                  href={`#${r.slug}`}
                  className="border-b border-transparent leading-snug text-ink-soft transition-colors hover:border-pumpkin hover:text-pumpkin"
                >
                  {r.name}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {/* ── Recepty ─────────────────────────────────────────────────────
          Suroviny vlevo v úzkém sloupci, postup vpravo jako souvislý text.
          Žádné rámečky — dělí je jen vlasová linka a vzduch. */}
      <section className="py-16">
        {recipes.map((r, i) => (
          <article
            key={r.slug}
            id={r.slug}
            className="scroll-mt-28 border-t border-ink/15 py-12 first:border-t-0 first:pt-0"
          >
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(recipeJsonLd(r, locale, t("recipeCategory"))).replace(/</g, "\\u003c"),
              }}
            />

            <p className="tabular text-[0.72rem] text-pumpkin">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className="font-display letterpress mt-2 text-balance text-3xl font-semibold sm:text-4xl">
              {r.name}
            </h2>

            {r.intro && (
              <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft">
                {r.intro}
              </p>
            )}

            <div className="mt-8 grid gap-x-14 gap-y-8 lg:grid-cols-[17rem_1fr]">
              {r.ingredients.length > 0 ? (
                <div>
                  <h3 className="text-[0.72rem] uppercase tracking-[0.28em] text-ink-faint">
                    {t("ingredients")}
                  </h3>
                  <hr className="rule-hand my-3" />
                  <ul className="space-y-1.5 text-[0.94rem] leading-relaxed text-ink-soft">
                    {r.ingredients.map((ing, k) => {
                      const [qty, rest] = splitQuantity(ing);
                      return (
                        <li key={`${k}-${ing}`}>
                          {qty && <span className="tabular mr-2 text-ink">{qty}</span>}
                          {rest}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div aria-hidden className="hidden lg:block" />
              )}

              {r.steps.length > 0 && (
                <div>
                  <h3 className="text-[0.72rem] uppercase tracking-[0.28em] text-ink-faint">
                    {t("method")}
                  </h3>
                  <hr className="rule-hand my-3" />
                  <div className="max-w-3xl space-y-4 leading-relaxed text-ink-soft">
                    {r.steps.map((s, k) => (
                      <p key={`${k}-${s}`} className="text-pretty">
                        {s}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* ── Výzva a odkaz na pořad ──────────────────────────────────── */}
      <section className="border-t-2 border-ink/12 py-20">
        <SectionHead
          plate="II"
          title={t("ownRecipeTitle")}
          lead={t("ownRecipeLead")}
        />
        <p className="mt-8">
          <a
            href={`mailto:${FARM.email}`}
            className="border-b-2 border-ink/25 py-1 text-ink transition-colors hover:border-pumpkin hover:text-pumpkin"
          >
            {FARM.email}
          </a>
        </p>
        <p className="mt-10 max-w-2xl text-[0.94rem] text-ink-faint">
          {t("tvShow")}:{" "}
          <a
            href="https://fresh.iprima.cz/hrdina-kuchyne-dyne-zde-najdete-recepty-z-12-dilu"
            rel="noreferrer noopener"
            target="_blank"
            className="underline decoration-pumpkin underline-offset-4 hover:text-ink"
          >
            fresh.iprima.cz
          </a>
        </p>
      </section>
    </div>
  );
}
