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

/** Zdrojový záznam fotky: alt i popisek jsou ve všech třech jazycích. */
export interface PhotoSource {
  base: string;
  alt: Record<"cs" | "en" | "de", string>;
  caption?: Record<"cs" | "en" | "de", string>;
  width: number;
  height: number;
}

/**
 * Vodorovný pás fotek ze statku.
 *
 * Fotky jsou z různých let a různých přístrojů, proto všechny prošly
 * společným gradingem (`scripts/grade-photos.py`) — bez něj vedle sebe
 * vypadají jako náhodně posbírané snímky.
 *
 * Sází se ve dvou velikostech, které se střídají: pás stejně širokých
 * obdélníků je nejrychlejší cesta k tomu, aby galerie vypadala jako
 * karusel ze šablony.
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
      className={`flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:gap-8 sm:px-8 ${className ?? ""}`}
    >
      {photos.map((p, i) => {
        const wide = i % 3 === 0;
        return (
          <li
            key={p.base}
            className={`shrink-0 snap-start ${wide ? "w-[84vw] sm:w-[34rem] lg:w-[41rem]" : "w-[62vw] sm:w-[23rem] lg:w-[27rem]"}`}
          >
            <figure>
              <div className="frame" style={{ aspectRatio: wide ? "3 / 2" : "4 / 5" }}>
                <Image
                  src={`/foto/${p.base}-1600.webp`}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  sizes={wide ? "(max-width: 640px) 84vw, 41rem" : "(max-width: 640px) 62vw, 27rem"}
                />
              </div>
              {p.caption && (
                <figcaption className="mt-3 max-w-md text-[0.86rem] leading-snug text-ink-faint">
                  {p.caption}
                </figcaption>
              )}
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
