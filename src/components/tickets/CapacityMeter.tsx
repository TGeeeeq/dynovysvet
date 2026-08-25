"use client";

import { useEffect, useRef, useState } from "react";
import { spotsLabel } from "@/content/copy/tickets";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dict";

/**
 * Ukazatel zbývající kapacity slotu.
 *
 * Plní se šrafurou, ne barvou — drží stejný jazyk jako tabule odrůd.
 * Když se místa tenčí, číslo přejde do `ember`. Žádné blikání ani červená:
 * urgence má být poctivá, ne vydíraná.
 *
 * Přesný počet ukazujeme jen tehdy, když už na něm záleží. Nad padesáti
 * volnými místy je „volno" pravdivější informace než číslo, které se
 * stejně během cachovacího okna změní.
 */
export function CapacityMeter({
  remaining,
  capacity,
  locale,
  className,
}: {
  remaining: number;
  capacity: number;
  locale: Locale;
  className?: string;
}) {
  const pct = capacity > 0 ? 1 - remaining / capacity : 1;
  const tight = remaining <= 20;
  const soldOut = remaining <= 0;
  const uid = useRef(`cap-${Math.random().toString(36).slice(2, 8)}`).current;

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        {soldOut ? (
          <span className="text-[0.82rem] uppercase tracking-[0.2em] text-ink-faint">
            {dict.soldOut[locale]}
          </span>
        ) : (
          <>
            <RollingNumber
              value={remaining}
              hidden={remaining > 50}
              className={`tabular text-[1.05rem] font-medium ${
                tight ? "text-ember" : "text-ink"
              }`}
            />
            <span className="text-[0.82rem] text-ink-faint">
              {remaining > 50 ? dict.free[locale] : spotsLabel(remaining, locale)}
            </span>
          </>
        )}
      </div>

      {/* Šrafovaný pruh: zaplněná část je vyšrafovaná, volná zůstává papír. */}
      <svg
        viewBox="0 0 120 6"
        preserveAspectRatio="none"
        className="mt-1.5 h-1.5 w-full text-ink"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={uid}
            patternUnits="userSpaceOnUse"
            width="3"
            height="3"
            patternTransform="rotate(-40)"
          >
            <line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" strokeWidth="1.1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="120" height="6" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
        <rect
          x="0"
          y="0"
          width={Math.max(0, Math.min(120, pct * 120))}
          height="6"
          fill={`url(#${uid})`}
          opacity={soldOut ? 0.75 : 0.55}
          style={{ transition: "width 600ms var(--ease-ink)" }}
        />
      </svg>
    </div>
  );
}

/**
 * Číslice se přetočí jako na mechanickém počítadle, když dorazí nový počet
 * z pollingu. Při `prefers-reduced-motion` se prostě přepíše.
 */
function RollingNumber({
  value,
  hidden,
  className,
}: {
  value: number;
  hidden?: boolean;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (value === shown) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(value);
      return;
    }
    setRolling(true);
    const t = setTimeout(() => {
      setShown(value);
      setRolling(false);
    }, 180);
    return () => clearTimeout(t);
  }, [value, shown]);

  if (hidden) return null;

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        transform: rolling ? "translateY(-0.35em)" : "none",
        opacity: rolling ? 0 : 1,
        transition: "transform 180ms var(--ease-drop), opacity 180ms linear",
      }}
    >
      {shown}
    </span>
  );
}
