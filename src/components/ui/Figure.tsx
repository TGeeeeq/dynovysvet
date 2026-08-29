import Image from "next/image";
import type { Photo } from "./PhotoStrip";

/**
 * Jedna fotka jako samostatný prvek stránky.
 *
 * Poměr stran určuje vždycky místo, kam se fotka sází — ne fotka sama.
 * Fotky ze statku jsou z různých let, poměrů a přístrojů; kdyby si každá
 * nesla svůj, rozpadla by se stránka na koláž.
 */
export function Figure({
  photo,
  ratio = "4 / 3",
  sizes = "(max-width: 1024px) 100vw, 50vw",
  priority = false,
  className,
  showCaption = true,
}: {
  photo: Photo;
  /** CSS `aspect-ratio`, např. `"16 / 9"`. */
  ratio?: string;
  sizes?: string;
  /** Jen pro fotku nad zlomem — víc `priority` obrázků si navzájem škodí. */
  priority?: boolean;
  className?: string;
  showCaption?: boolean;
}) {
  return (
    <figure className={className}>
      <div className="frame" style={{ aspectRatio: ratio }}>
        <Image
          src={`/foto/${photo.base}-1600.webp`}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          priority={priority}
        />
      </div>
      {showCaption && photo.caption && (
        <figcaption className="mt-3 text-[0.86rem] leading-snug text-ink-faint">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}
