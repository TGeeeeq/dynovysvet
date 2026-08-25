import type { Metadata } from "next";
import { SectionHead } from "@/components/ui/SectionHead";
import { RECIPES, type Recipe } from "@/content/recipes";
import { FARM } from "@/content/farm";

export const metadata: Metadata = {
  title: "Recepty z dýní, cuket a patizonů",
  description:
    "Vyzkoušené recepty ze Statku u Pipků: dýňová polévka, kandovaná dýně, dýňové muffiny, marmeláda i slaný nákyp. Postupy tak, jak je píšeme my, ne jak je opisuje internet.",
};

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
function recipeJsonLd(r: Recipe) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    ...(r.intro ? { description: r.intro } : {}),
    author: { "@type": "Organization", name: FARM.name },
    recipeCategory: "Z dýní",
    inLanguage: "cs-CZ",
    ...(r.ingredients.length ? { recipeIngredient: r.ingredients } : {}),
    ...(r.steps.length
      ? { recipeInstructions: r.steps.map((s) => ({ "@type": "HowToStep", text: s })) }
      : {}),
  };
}

export default function RecipesPage() {
  return (
    <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
      {/* ── Úvod a rejstřík ─────────────────────────────────────────────
          Receptů je dvaadvacet. Rejstřík nahoře je jediný způsob, jak se
          v nich dá na telefonu vyznat, aniž by se stránka rozpadla na
          dvaadvacet karet. */}
      <section className="py-8">
        <SectionHead
          plate="I"
          title="Recepty — vaříme nejen z dýní"
          lead="Naše oblíbené vyzkoušené recepty."
        />

        <nav aria-label="Rejstřík receptů" className="mt-12 border-t border-ink/15 pt-6">
          <ol className="grid gap-x-10 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {RECIPES.map((r, i) => (
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
        {RECIPES.map((r, i) => (
          <article
            key={r.slug}
            id={r.slug}
            className="scroll-mt-28 border-t border-ink/15 py-12 first:border-t-0 first:pt-0"
          >
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(recipeJsonLd(r)).replace(/</g, "\\u003c"),
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
                    Suroviny
                  </h3>
                  <hr className="rule-hand my-3" />
                  <ul className="space-y-1.5 text-[0.94rem] leading-relaxed text-ink-soft">
                    {r.ingredients.map((ing) => {
                      const [qty, rest] = splitQuantity(ing);
                      return (
                        <li key={ing}>
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
                    Postup
                  </h3>
                  <hr className="rule-hand my-3" />
                  <div className="max-w-3xl space-y-4 leading-relaxed text-ink-soft">
                    {r.steps.map((s) => (
                      <p key={s} className="text-pretty">
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
          title="Máte vlastní recept?"
          lead="Uvítáme, když nám pošlete další osvědčené dobré recepty na přípravu pokrmů z dýně. Rádi je vyzkoušíme a zveřejníme na našich stránkách."
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
          Recepty z dýní — TV pořad „Hrdina kuchyně“:{" "}
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
