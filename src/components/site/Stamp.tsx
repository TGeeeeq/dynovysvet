/**
 * Razítko statku. Původní logo na Webnode je oskenované razítko, takže
 * tenhle motiv značku nevymýšlí — navazuje na ni. Vrací se na vstupence,
 * v patičce a jako přetisk „VYPRODÁNO".
 */
export function Stamp({
  size = 64,
  className,
  label = "Statek u Pipků",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  const id = `stamp-${label.replace(/\W+/g, "")}`;
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
      <defs>
        <path id={`${id}-arc`} d="M0 -34 A34 34 0 1 1 -0.1 -34" />
      </defs>
      {/* Dvojitý kroužek s mírně nestejnou tloušťkou — otisk razítka nikdy
          není dokonalý. */}
      <circle cx="0" cy="0" r="46" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="0" cy="0" r="41" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
      <text className="fill-current" style={{ fontSize: 8.4, letterSpacing: "0.22em" }}>
        <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
          STATEK U PIPKŮ · NOVÁ VES U LEŠTINY
        </textPath>
      </text>
      {/* Zjednodušená dýně uprostřed. */}
      <g transform="translate(0,4)">
        <ellipse cx="0" cy="0" rx="17" ry="13.5" stroke="currentColor" strokeWidth="2.2" />
        <path d="M-8.5 -11.6C-11 -6 -11 6 -8.5 11.6M0 -13.4V13.4M8.5 -11.6C11 -6 11 6 8.5 11.6"
              stroke="currentColor" strokeWidth="1.3" opacity="0.75" />
        <path d="M0 -13.4C0.6 -18 -1.4 -20 1.4 -23" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <path d="M-19 22 H19" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
      <text x="0" y="31" textAnchor="middle" className="fill-current"
            style={{ fontSize: 7.2, letterSpacing: "0.16em" }}>
        OD ROKU 2009
      </text>
    </svg>
  );
}
