import { VINE_CURLS, VINE_HEIGHT, VINE_LEAVES, VINE_STEM } from "@/lib/illustrations/vine";

/**
 * Úponek v levém marginu, který se kreslí, jak čtenář scrolluje.
 *
 * Celé je to CSS `animation-timeline: scroll()` — žádný posluchač scrollu,
 * žádný JavaScript na hlavním vlákně. Prohlížeč to počítá na kompozitoru,
 * takže i na slabém telefonu je to zdarma.
 *
 * Fallback pro prohlížeče bez scroll-driven animací: úponek je prostě
 * celý vykreslený. Nic nechybí, jen se nekreslí postupně.
 */
export function VineSpine({ className }: { className?: string }) {
  return (
    // Výška vychází z poměru stran úponku, ne z výšky stránky — roztáhnout
    // ho přes celý dokument by listy zdeformovalo. Dole se rozplyne maskou,
    // takže nekončí uříznutým pahýlem.
    <div
      className={className}
      aria-hidden="true"
      style={{
        height: `calc(var(--vine-w, 5rem) * ${(VINE_HEIGHT + 16) / 84})`,
        maskImage: "linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)",
      }}
    >
      <svg
        viewBox={`-42 -8 84 ${VINE_HEIGHT + 16}`}
        preserveAspectRatio="xMidYMin meet"
        className="vine block h-full w-full text-moss/65"
        fill="none"
      >
        <path
          d={VINE_STEM}
          className="vine-stem"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {VINE_CURLS.map((c, i) => (
          <path
            key={`c${i}`}
            d={c.d}
            className="vine-part"
            style={{ "--at": c.at } as React.CSSProperties}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.75"
          />
        ))}
        {VINE_LEAVES.map((l, i) => (
          <g
            key={`l${i}`}
            className="vine-part"
            style={{ "--at": l.at } as React.CSSProperties}
          >
            <path d={l.leaf} fill="var(--color-paper-deep)" stroke="currentColor" strokeWidth="1.6" />
            <path d={l.vein} stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
          </g>
        ))}
      </svg>
    </div>
  );
}
