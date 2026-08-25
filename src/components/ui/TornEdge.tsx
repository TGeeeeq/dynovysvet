import { TORN_HEIGHT, TORN_PATH, TORN_WIDTH } from "@/lib/illustrations/torn";

/**
 * Předěl mezi sekcemi. Nepravidelný natržený papír, ne generická vlnka —
 * ta „vlnka" je jeden z nejspolehlivějších signálů, že web je ze šablony.
 */
export function TornEdge({
  fill = "var(--color-paper)",
  flip = false,
  className,
}: {
  /** Barva plochy, KTERÁ pokračuje za předělem. */
  fill?: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${TORN_WIDTH} ${TORN_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block h-6 w-full sm:h-10 ${flip ? "rotate-180" : ""} ${className ?? ""}`}
    >
      <path d={TORN_PATH} fill={fill} />
    </svg>
  );
}
