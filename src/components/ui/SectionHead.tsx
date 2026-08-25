/**
 * Nadpis sekce. Číslo tabule vlevo v mono, titulek v display serifu.
 * Ta dvojice organického serifu a přesného mono je záměrná: emoce vs. fakta.
 */
export function SectionHead({
  plate,
  title,
  lead,
  className,
}: {
  /** Číslo „tabule" v almanachu, např. „III". */
  plate: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <header className={`max-w-2xl ${className ?? ""}`}>
      <p className="tabular text-[0.72rem] uppercase tracking-[0.34em] text-pumpkin">
        Tabule {plate}
      </p>
      <h2 className="font-display letterpress mt-3 text-balance text-4xl font-semibold sm:text-5xl">
        {title}
      </h2>
      {lead && (
        <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-soft">{lead}</p>
      )}
    </header>
  );
}
