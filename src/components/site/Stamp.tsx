import { FARM } from "@/content/farm";

/**
 * Razítko statku.
 *
 * Původní logo na Webnode je oskenované gumové razítko se dřevorytovým
 * stavením — ne s dýní. Tenhle komponent ho překresluje do vektoru, aby
 * značka zůstala ta samá: kdo statek zná, musí ji poznat.
 *
 * Linky jsou záměrně nepravidelné. Otisk razítka nikdy nevyjde dvakrát
 * stejně a dokonalá geometrie by z toho udělala firemní logo.
 */
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
  const uid = `stamp-${bare ? "b" : "f"}`;

  return (
    <svg
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={label}
      fill="none"
    >
      {!bare && (
        <defs>
          {/* Dvě dráhy: horní text čte zleva doprava po vnějším oblouku,
              spodní se musí obrátit, jinak by stál na hlavě. */}
          <path id={`${uid}-top`} d="M-38 0 A38 38 0 0 1 38 0" />
          <path id={`${uid}-bottom`} d="M-36 0 A36 36 0 0 0 36 0" />
        </defs>
      )}

      {!bare && (
        <>
          <circle cx="0" cy="0" r="47" stroke="currentColor" strokeWidth="2.4" />
          <circle cx="0" cy="0" r="42.5" stroke="currentColor" strokeWidth="0.8" opacity="0.65" />
          <text className="fill-current" style={{ fontSize: 7.6, letterSpacing: "0.13em" }}>
            <textPath href={`#${uid}-top`} startOffset="50%" textAnchor="middle">
              STATEK U PIPKŮ
            </textPath>
          </text>
          <text className="fill-current" style={{ fontSize: 6.2, letterSpacing: "0.11em" }}>
            <textPath href={`#${uid}-bottom`} startOffset="50%" textAnchor="middle">
              NOVÁ VES U LEŠTINY
            </textPath>
          </text>
        </>
      )}

      {/* Stavení. Plné plochy, žádné obrysy — dřevoryt se řeže, nekreslí. */}
      <g className="fill-current" transform="translate(0,2)">
        {/* Střecha s přesahem, hřeben mírně mimo osu. */}
        <path d="M0.5 -25.2 L25.8 -1.4 L23.4 0.6 L0.2 -21.4 L-22.6 0.4 L-25.4 -1.6 Z" />
        {/* Komín na pravé straně hřebene. */}
        <path d="M12.4 -13.6 L12.2 -19.4 L17.2 -19.2 L17.4 -8.9 L14.2 -11.8 Z" />
        {/* Štít s podkrovními okny. */}
        <path d="M0.2 -19.6 L19.6 -1.8 L-17.4 -1.6 Z" />
        <g className="fill-paper">
          <path d="M-1.2 -13.9 L2.4 -13.7 L2.6 -10.4 L-1.4 -10.6 Z" />
          <path d="M-8.4 -8.2 L-3.6 -8.0 L-3.4 -4.4 L-8.6 -4.6 Z" />
          <path d="M3.8 -8.1 L8.7 -8.3 L8.9 -4.5 L3.6 -4.3 Z" />
          <path d="M-0.6 -7.4 L1.2 -7.3 L1.3 -4.6 L-0.7 -4.7 Z" />
        </g>
        {/* Podezdívka pod štítem. */}
        <path d="M-20.6 -1.9 L20.8 -2.1 L21.2 0.9 L-21.0 1.1 Z" />
        {/* Přízemí s podloubím vlevo. */}
        <path d="M-19.4 1.0 L19.6 0.8 L19.4 15.6 L-19.6 15.8 Z" />
        <g className="fill-paper">
          {/* Podloubí. */}
          <path d="M-17.4 3.2 L-11.6 3.0 L-11.4 13.6 L-17.6 13.8 Z" />
          {/* Dvě okna a dveře. */}
          <path d="M-8.2 4.0 L-1.8 3.8 L-1.6 11.2 L-8.4 11.4 Z" />
          <path d="M1.8 3.9 L8.4 3.7 L8.6 11.1 L1.6 11.3 Z" />
          <path d="M12.2 3.6 L16.4 3.5 L16.6 13.8 L12.0 13.9 Z" />
        </g>
        {/* Terén. Nerovný, jinak by stavení stálo na pravítku. */}
        <path d="M-24.6 15.4 C-14 14.2 -2 16.4 8.4 15.2 C14.8 14.5 20.2 15.9 24.8 15.1 L24.4 18.4 C19.4 19.2 13.6 17.8 7.6 18.5 C-2.4 19.6 -13.8 17.6 -24.2 18.7 Z" />
      </g>
    </svg>
  );
}
