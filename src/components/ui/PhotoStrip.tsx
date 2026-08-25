import Image from "next/image";

export interface Photo {
  /** Základ názvu souboru v /public/foto, bez šířky a přípony. */
  base: string;
  alt: string;
  /** Popisek pod fotkou. Nepovinný — někde stačí sama fotka. */
  caption?: string;
  width: number;
  height: number;
}

/**
 * Pás fotek ze statku.
 *
 * Fotky jsou z různých let a různých přístrojů, proto všechny prošly
 * společným gradingem (`scripts/grade-photos.py`) — bez něj vedle sebe
 * vypadají jako náhodně posbírané snímky.
 *
 * Rámeček je jen tenká inkoustová linka a fotky jsou nepatrně pootočené,
 * jako by ležely na stole. Dokonalé zarovnání by z toho udělalo galerii
 * z šablony.
 */
export function PhotoStrip({
  photos,
  className,
}: {
  photos: readonly Photo[];
  className?: string;
}) {
  return (
    <ul
      className={`flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:gap-8 sm:px-8 ${className ?? ""}`}
    >
      {photos.map((p, i) => (
        <li
          key={p.base}
          className="w-[78vw] shrink-0 snap-start sm:w-[26rem] lg:w-[30rem]"
          style={{ rotate: `${(((i * 7) % 5) - 2) * 0.14}deg` }}
        >
          <figure>
            <Image
              src={`/foto/${p.base}-1600.webp`}
              alt={p.alt}
              width={p.width}
              height={p.height}
              sizes="(max-width: 640px) 78vw, 30rem"
              className="w-full border border-ink/20 object-cover"
              style={{ aspectRatio: "3 / 2" }}
            />
            {p.caption && (
              <figcaption className="mt-2.5 text-[0.86rem] leading-snug text-ink-faint">
                {p.caption}
              </figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
  );
}
