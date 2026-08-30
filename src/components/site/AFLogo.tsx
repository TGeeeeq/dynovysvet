type AFLogoProps = {
  size?: number;
  className?: string;
};

/* Antonín Figueroa — animated AF monogram inside a sacred-geometry vesica.
   Gold-on-sumi creator signature shared across his sites; rings orbit slowly
   (paused under prefers-reduced-motion). Self-contained dark disc so the
   gold/cream artwork stays legible on any footer — light or dark. Tahy jsou
   schválně silné: monogram se kreslí ve 30–40 px, kde by vlásková linka
   zmizela pod pixel.

   Pair with the af-spin / af-spin-rev keyframes in globals.css. */
export function AFLogo({ size = 40, className = "" }: AFLogoProps) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0">
        {/* sumi disc */}
        <circle cx="50" cy="50" r="50" fill="#0a0908" />
        {/* outer rotating dashed ring */}
        <g className="af-spin-slow">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#d4a45a" strokeOpacity="0.5" strokeWidth="1.6" strokeDasharray="3 6" />
        </g>
        {/* counter-rotating ring carrying a single orbiting mark */}
        <g className="af-spin-rev">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#d4a45a" strokeOpacity="0.6" strokeWidth="1.1" />
          <circle cx="50" cy="12" r="3" fill="#d4a45a" />
        </g>
        {/* vesica piscis */}
        <circle cx="40" cy="50" r="24" fill="none" stroke="#d4a45a" strokeOpacity="0.75" strokeWidth="1.3" />
        <circle cx="60" cy="50" r="24" fill="none" stroke="#d4a45a" strokeOpacity="0.75" strokeWidth="1.3" />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{
          fontSize: size * 0.42,
          fontWeight: 500,
          letterSpacing: "-0.04em",
          color: "#f1e9d8",
          fontFamily: "var(--font-display, Georgia, serif)",
        }}
      >
        <span style={{ color: "#d4a45a" }}>A</span>
        <span style={{ marginLeft: -size * 0.06 }}>F</span>
      </span>
    </span>
  );
}
