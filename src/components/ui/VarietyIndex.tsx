import Image from "next/image";
import type { LocalisedVariety } from "@/content/varieties";

/**
 * Rejstřík odrůd.
 *
 * Dokud nemáme fotku každé odrůdy zvlášť, je to sazba: číslo, jméno,
 * latinský název, hmotnost, použití. Vypadá to jako stránka z katalogu,
 * protože to stránka z katalogu je — a je to poctivé.
 *
 * Jakmile se v `src/content/varieties.ts` u odrůd objeví `photo`, přepne se
 * ten záznam sám na fotografickou kartu. Není kvůli tomu potřeba sahat na
 * layout ani na stránky, které rejstřík používají.
 */
export function VarietyIndex({
  varieties,
  labels,
  className,
}: {
  varieties: readonly LocalisedVariety[];
  labels: { weight: string; use: string };
  className?: string;
}) {
  return (
    <ol
      className={`grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 ${className ?? ""}`}
    >
      {varieties.map((v, i) => (
        <li key={v.slug} className="reveal border-t-2 border-ink/15 pt-4">
          {v.photo && (
            <div className="frame mb-4" style={{ aspectRatio: "4 / 3" }}>
              <Image
                src={`/foto/${v.photo}-1000.webp`}
                alt={v.name}
                width={1600}
                height={1200}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              />
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="tabular text-[0.72rem] text-pumpkin">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-2xl font-semibold">{v.name}</h3>
          </div>

          <p className="tabular mt-1 text-[0.74rem] italic text-ink-faint">{v.latin}</p>

          <dl className="mt-3 space-y-1 text-[0.92rem]">
            <div className="flex gap-3">
              <dt className="min-w-[6.5rem] text-[0.74rem] uppercase tracking-[0.16em] text-ink-faint">
                {labels.weight}
              </dt>
              <dd className="tabular text-ink-soft">{v.weight}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="min-w-[6.5rem] text-[0.74rem] uppercase tracking-[0.16em] text-ink-faint">
                {labels.use}
              </dt>
              <dd className="text-ink-soft">{v.use}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
