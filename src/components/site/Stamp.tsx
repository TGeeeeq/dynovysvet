import { FARM } from "@/content/farm";

/**
 * Razítko statku — oskenovaný otisk gumového razítka se stavením.
 *
 * Obrázek je jen alfa maska (bílý papír = průhledno), takže se obarvuje
 * `currentColor` úplně stejně jako dřívější vektor: `text-ink/80` a spol.
 * na volajících místech fungují dál a otisk sedí na papíru, ne na bílém
 * čtverci.
 */
const FULL = "/logo/razitko.webp";
const CREST = "/logo/razitko-znak.webp";

export function Stamp({
  size = 64,
  className,
  label = FARM.name,
  /** Bez prstence s textem — pro malá použití, kde by se stejně nepřečetl. */
  bare = false,
}: {
  size?: number;
  className?: string;
  label?: string;
  bare?: boolean;
}) {
  const src = bare ? CREST : FULL;

  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-block bg-current ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
