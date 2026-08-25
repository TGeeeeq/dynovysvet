import type { Gourd } from "@/lib/illustrations/gourds";

/**
 * Rytinová tykev. Kresba je čistě linková — žádné plné výplně, objem dělá
 * šrafura ve třech hustotách, přesně jako ve starých semenářských katalozích.
 *
 * Světlo přichází vždy zprava shora. Na tom se nesmí u žádné odrůdy slevit,
 * jinak se rodina ilustrací rozpadne na sadu nesouvisejících obrázků.
 *
 * `seed` posouvá úhel šrafury a náklon stopky, takže dvě dýně vedle sebe
 * nikdy nevypadají obtisknuté ze stejného štočku.
 */
export function GourdPlate({
  gourd,
  size = 210,
  seed = 0,
  className,
  title,
}: {
  gourd: Gourd;
  size?: number;
  seed?: number;
  className?: string;
  /** Vlastní popis pro čtečky. Výchozí je název odrůdy. */
  title?: string;
}) {
  const uid = `${gourd.slug}-${seed}`;
  const angle = -42 + ((seed * 7) % 15);
  const lean = ((seed * 13) % 7) - 3;
  const stemY = gourd.capY !== null ? gourd.capY - 16 : gourd.wellY;

  return (
    <svg
      viewBox="-72 -86 144 158"
      width={size}
      height={(size * 158) / 144}
      className={className}
      role="img"
      aria-label={title ?? `${gourd.name} — rytinová ilustrace`}
      fill="none"
    >
      <defs>
        {[
          ["a", 6.4, 0.62],
          ["b", 3.6, 0.6],
          ["c", 2.2, 0.58],
        ].map(([k, step, w]) => (
          <pattern
            key={k as string}
            id={`${uid}-${k}`}
            patternUnits="userSpaceOnUse"
            width={step as number}
            height={step as number}
            patternTransform={`rotate(${angle})`}
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={step as number}
              stroke="currentColor"
              strokeWidth={w as number}
            />
          </pattern>
        ))}
        <clipPath id={`${uid}-clip`}>
          <path d={gourd.outline} />
        </clipPath>
      </defs>

      {/* Stopka. Kreslí se první, tělo ji pak překryje v místě nasazení —
          jinak by jen visela nad dýní. */}
      <g stroke="currentColor" strokeLinecap="round">
        <path
          d={`M${lean - 2.6} ${stemY + 2}C${lean - 4} ${stemY - 9} ${lean + 3} ${
            stemY - 13
          } ${lean + 1.2} ${stemY - 20}`}
          strokeWidth="2.3"
        />
        <path
          d={`M${lean + 2.6} ${stemY + 2}C${lean + 4.4} ${stemY - 8} ${lean + 7} ${
            stemY - 12
          } ${lean + 5.4} ${stemY - 18}`}
          strokeWidth="1"
          opacity="0.65"
        />
      </g>

      {/* Turbán nese druhý, menší plod. */}
      {gourd.cap && (
        <g transform={`translate(0,${gourd.capY})`}>
          <path d={gourd.cap} fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.4" />
          <g stroke="currentColor" strokeWidth="0.68" opacity="0.45">
            {gourd.capRibs?.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </g>
      )}

      <g clipPath={`url(#${uid}-clip)`}>
        <path d={gourd.outline} fill="var(--color-paper)" />
        <path d={gourd.shadeMid} fill={`url(#${uid}-a)`} opacity="0.5" />
        <path d={gourd.shade} fill={`url(#${uid}-b)`} opacity="0.5" />
        <path d={gourd.shadeDeep} fill={`url(#${uid}-c)`} opacity="0.5" />
        <g stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" opacity="0.42">
          {gourd.ribs.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>

      {/* Jamka, do níž stopka dosedá. */}
      <ellipse
        cx={lean * 0.4}
        cy={gourd.wellY}
        rx={gourd.wellR * 0.46}
        ry={gourd.wellR * 0.15}
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.45"
      />

      {/* Obrys naposledy a nejsilnější — tak to dělá rytina. */}
      <path d={gourd.outline} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
