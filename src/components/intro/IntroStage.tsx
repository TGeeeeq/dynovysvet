"use client";

import { useEffect, useRef } from "react";
import {
  BODY,
  CUTS,
  LOBE_LIGHT,
  LOBE_PATHS,
  RIB_DEPTH,
  RIB_PATHS,
  RIM,
  SKIN_LINES,
  STEM,
  STEM_CUT,
  STEM_LINES,
  VIEW_BOX,
} from "./pumpkin-art";
import type { Locale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/dict";

/** Kolik pixelů tahu musí návštěvník ujet, než je dýně celá vyřezaná. */
const DRAG_TO_FINISH = 1500;
/** Tah se stisknutým tlačítkem řeže rychleji — je to vědomé gesto. */
const PRESSED_BOOST = 1.7;
/** Po téhle době bez pohybu se dýně dořeže sama. Nikdo nesmí uváznout. */
const IDLE_MS = 1500;
/** Rychlost samovyřezávání jako podíl celku za sekundu. */
const AUTO_RATE = 0.5;
/** Jak dlouho svítí hotová dýně, než překryv odjede. */
const HOLD_MS = 1300;
/** Délka odchodu překryvu; musí sedět s CSS transition. */
const LEAVE_MS = 900;

type Phase = "carving" | "lit" | "leaving";

interface CutEls {
  hole: SVGPathElement;
  ember: SVGPathElement;
  spill: SVGPathElement;
  trace: SVGPathElement;
  len: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Uvítací animace: návštěvník tahem myši nebo prstem vyřeže dýni.
 *
 * Postup řezu je jedno číslo 0–1. Tah ho posouvá, řezy si z něj berou svůj
 * úsek (oči, nos, pusa). Když se řez uzavře, díra se otevře a zevnitř se
 * rozsvítí svíčka.
 *
 * Animace běží imperativně přes `requestAnimationFrame` a zapisuje rovnou do
 * DOM. Přes React state by to znamenalo překreslit celý strom šedesátkrát za
 * sekundu kvůli jedné hodnotě `stroke-dashoffset`.
 *
 * Nikdo tu nesmí uváznout: kdo netáhne, tomu se dýně po `IDLE_MS` dořeže
 * sama, a „Přeskočit" je první prvek v pořadí tabulátoru.
 */
export function IntroStage({ locale }: { locale: Locale }) {
  const t = makeT(locale);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const knifeRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const sparkRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    // Třídu nasadil inline skript ještě před vykreslením. Když tam není,
    // intro se nemá hrát (opakovaná návštěva nebo prefers-reduced-motion).
    if (!root || !svg || document.documentElement.dataset.intro !== "open") return;

    const cuts: CutEls[] = [];
    for (const c of CUTS) {
      const hole = svg.querySelector<SVGPathElement>(`[data-hole="${c.id}"]`);
      const ember = svg.querySelector<SVGPathElement>(`[data-ember="${c.id}"]`);
      const spill = svg.querySelector<SVGPathElement>(`[data-spill="${c.id}"]`);
      const trace = svg.querySelector<SVGPathElement>(`[data-trace="${c.id}"]`);
      if (!hole || !ember || !spill || !trace) return;
      cuts.push({ hole, ember, spill, trace, len: trace.getTotalLength() });
    }

    const progress = { v: 0 };
    let last: { x: number; y: number } | null = null;
    let lastMove = performance.now();
    let phase: Phase = "carving";
    let raf = 0;
    let holdTimer = 0;
    let leaveTimer = 0;

    const spark = sparkRef.current;
    const knife = knifeRef.current;

    function apply(prog: number) {
      root!.style.setProperty("--carve", prog.toFixed(3));

      let activeIdx = -1;
      let activeP = 0;

      for (let i = 0; i < CUTS.length; i++) {
        const c = CUTS[i];
        const el = cuts[i];
        const p = clamp01((prog - c.from) / (c.to - c.from));
        if (p > 0 && p < 1 && activeIdx === -1) {
          activeIdx = i;
          activeP = p;
        }
        el.trace.style.strokeDashoffset = String(1 - p);
        // Díra se otevře až ve chvíli, kdy se řez uzavře — do té doby je to
        // jen naříznutá slupka, ne otvor.
        const open = clamp01((p - 0.82) / 0.18);
        el.hole.style.opacity = String(open);
        el.ember.style.opacity = String(open);
        el.spill.style.opacity = String(open * 0.85);
        // Čerstvý řez ještě žhne, hotový zůstane jen jako tenký rub.
        el.trace.style.opacity = String(0.3 + 0.7 * (1 - open));
      }

      if (spark) {
        if (activeIdx >= 0) {
          const el = cuts[activeIdx];
          const pt = el.trace.getPointAtLength(activeP * el.len);
          spark.setAttribute("cx", String(pt.x));
          spark.setAttribute("cy", String(pt.y));
          spark.style.opacity = "1";
        } else {
          spark.style.opacity = "0";
        }
      }
    }

    function leave() {
      if (phase === "leaving") return;
      phase = "leaving";
      root!.dataset.phase = "leaving";
      try {
        sessionStorage.setItem("dvs-intro", "1");
      } catch {
        /* private mode — intro se pak přehraje znovu, což nikomu neublíží */
      }
      leaveTimer = window.setTimeout(() => {
        document.documentElement.dataset.intro = "done";
      }, LEAVE_MS);
    }

    function finish() {
      if (phase !== "carving") return;
      phase = "lit";
      root!.dataset.phase = "lit";
      holdTimer = window.setTimeout(leave, HOLD_MS);
    }

    let prevFrame = performance.now();

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      // Strop na dt: po přepnutí panelu zpátky by jinak jeden snímek
      // dořezal celou dýni najednou.
      const dt = Math.min(0.064, (now - prevFrame) / 1000);
      prevFrame = now;
      if (phase !== "carving") return;
      // Kdo netáhne, tomu se dýně dořeže sama.
      if (now - lastMove > IDLE_MS) progress.v = Math.min(1, progress.v + AUTO_RATE * dt);
      apply(progress.v);
      if (progress.v >= 1) finish();
    }

    function onMove(e: PointerEvent) {
      if (phase !== "carving") return;
      const x = e.clientX;
      const y = e.clientY;
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const boost = e.buttons > 0 ? PRESSED_BOOST : 1;
        progress.v = Math.min(1, progress.v + (dist * boost) / DRAG_TO_FINISH);
        if (knife && dist > 1.5) {
          knife.style.setProperty("--angle", `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`);
        }
      }
      last = { x, y };
      lastMove = performance.now();
      if (knife && e.pointerType !== "touch") {
        knife.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        knife.style.opacity = "1";
      }
      root!.dataset.started = "1";
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") leave();
    }

    function onUp() {
      // Po rozsvícení stačí kliknout a jde se na web.
      if (phase === "lit") leave();
    }

    apply(0);
    raf = requestAnimationFrame(tick);
    // Překryv zakrývá celý web, ale nedělá zbytek stránky inertním. Aby se
    // člověk, který jede tabulátorem, nedostal do navigace schované za ním,
    // dostane fokus rovnou „Přeskočit".
    skipRef.current?.focus({ preventScroll: true });
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(holdTimer);
      window.clearTimeout(leaveTimer);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
      // Pozor: tady se `data-intro` nepřepíná. Ve vývojovém StrictMode se
      // efekt odmountuje hned po prvním mountu a intro by nikdy neproběhlo.
    };
  }, []);

  const skip = () => {
    const root = rootRef.current;
    if (!root) return;
    root.dataset.phase = "leaving";
    try {
      sessionStorage.setItem("dvs-intro", "1");
    } catch {
      /* nevadí */
    }
    window.setTimeout(() => {
      document.documentElement.dataset.intro = "done";
    }, LEAVE_MS);
  };

  return (
    <div
      ref={rootRef}
      className="pumpkin-intro"
      role="dialog"
      aria-modal="true"
      aria-label={t("introLabel")}
      data-phase="carving"
    >
      <button ref={skipRef} type="button" onClick={skip} className="dv-skip">
        {t("introSkip")}
      </button>

      <div className="dv-stage">
        <svg ref={svgRef} viewBox={VIEW_BOX} className="dv-pumpkin" aria-hidden="true">
          <defs>
            {/* Slupka. Světlo přichází zleva shora a na opačné straně přechází
                do skoro černé — bez toho spádu je z dýně oranžová koule. */}
            <radialGradient id="dv-skin" cx="31%" cy="22%" r="82%">
              <stop offset="0%" stopColor="#ffb851" />
              <stop offset="20%" stopColor="#f4842a" />
              <stop offset="46%" stopColor="#d55a12" />
              <stop offset="72%" stopColor="#9a370b" />
              <stop offset="100%" stopColor="#3f1404" />
            </radialGradient>

            {/* Nazelenalý nádech pod stopkou. Skoro každá dýně ho má a je to
                jedna z mála věcí, po kterých oko pozná ovoce od plastu. */}
            <radialGradient id="dv-blush" cx="50%" cy="8%" r="46%">
              <stop offset="0%" stopColor="#8f8a2e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8f8a2e" stopOpacity="0" />
            </radialGradient>

            {/* Ztmavení k obrysu. Objem, ne barevný přechod. */}
            <radialGradient id="dv-edge" cx="38%" cy="30%" r="70%">
              <stop offset="46%" stopColor="#230b03" stopOpacity="0" />
              <stop offset="80%" stopColor="#230b03" stopOpacity="0.44" />
              <stop offset="100%" stopColor="#0f0502" stopOpacity="0.9" />
            </radialGradient>

            {/* Stopka je dřevo, ne stonek: hnědozelená, matná. */}
            <linearGradient id="dv-stem" x1="0.05" y1="1" x2="0.95" y2="0.1">
              <stop offset="0%" stopColor="#1b170a" />
              <stop offset="30%" stopColor="#3b3418" />
              <stop offset="66%" stopColor="#5d5330" />
              <stop offset="100%" stopColor="#7d7048" />
            </linearGradient>

            <radialGradient id="dv-ember" cx="50%" cy="72%" r="74%">
              <stop offset="0%" stopColor="#fff8e2" />
              <stop offset="28%" stopColor="#ffd47e" />
              <stop offset="60%" stopColor="#ff9526" />
              <stop offset="100%" stopColor="#bd4604" stopOpacity="0.28" />
            </radialGradient>

            <radialGradient id="dv-halo" cx="50%" cy="52%" r="50%">
              <stop offset="0%" stopColor="#ffab3d" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ff8a1e" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="dv-blade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff1cd" />
              <stop offset="100%" stopColor="#ffb347" />
            </linearGradient>

            <filter id="dv-tiny" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
            <filter id="dv-soft" x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur stdDeviation="13" />
            </filter>
            <filter id="dv-wide" x="-90%" y="-90%" width="280%" height="280%">
              <feGaussianBlur stdDeviation="26" />
            </filter>
            <filter id="dv-bloom" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="24" />
            </filter>
            <filter id="dv-cutglow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
            {/* Zrno slupky. Turbulence je levnější než bitmapová textura a
                nepřidává webu ani kilobajt. */}
            {/* `feComposite operator="in"` ořízne šum tvarem, na který je filtr
                nasazený. Bez toho vyplní celý obdélník filtru a v pozadí je
                kolem dýně vidět jeho hrana. */}
            <filter id="dv-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="7" result="n" />
              <feColorMatrix in="n" type="saturate" values="0" result="g" />
              <feComposite in="g" in2="SourceGraphic" operator="in" />
            </filter>

            <clipPath id="dv-clip">
              <path d={BODY} />
            </clipPath>
          </defs>

          {/* Záře za dýní. Roste s tím, kolik je vyřezáno — nerozsvícená dýně
              nemá kolem sebe co rozsvítit. */}
          <ellipse
            className="dv-flame dv-halo"
            cx="300"
            cy="382"
            rx="272"
            ry="212"
            fill="url(#dv-halo)"
            filter="url(#dv-bloom)"
          />

          <ellipse cx="300" cy="562" rx="196" ry="24" fill="#000" opacity="0.62" filter="url(#dv-soft)" />

          <g className="dv-body">
            {/* Stopka. Kreslí se první — tělo ji pak dole překryje, takže
                vyrůstá z prohlubně a neleží na dýni. */}
            <path d={STEM} fill="url(#dv-stem)" />
            {STEM_LINES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#191507" strokeWidth="2.2" opacity="0.38" />
            ))}
            <ellipse
              cx={STEM_CUT.cx}
              cy={STEM_CUT.cy}
              rx={STEM_CUT.rx}
              ry={STEM_CUT.ry}
              fill="#6f6640"
              transform={`rotate(${STEM_CUT.rotate} ${STEM_CUT.cx} ${STEM_CUT.cy})`}
            />
            <path d={STEM} fill="none" stroke="#191a08" strokeWidth="2.4" opacity="0.5" />

            <path d={BODY} fill="url(#dv-skin)" />

            <g clipPath="url(#dv-clip)">
              {SKIN_LINES.map((d, i) => (
                <path key={`s${i}`} d={d} fill="none" stroke="#4f1a04" strokeWidth="1.5" opacity="0.06" />
              ))}

              {/* Laloky. Nejdřív jejich světlá temena, pak tmavé rýhy mezi
                  nimi — v tomhle pořadí, aby rýha zůstala rýhou. */}
              {LOBE_PATHS.map((d, i) => (
                <path
                  key={`l${i}`}
                  d={d}
                  fill="none"
                  stroke="#ffd79b"
                  strokeWidth="66"
                  opacity={LOBE_LIGHT[i]}
                  filter="url(#dv-wide)"
                />
              ))}

              {RIB_PATHS.map((d, i) => (
                <g key={`r${i}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke="#3a1103"
                    strokeWidth="34"
                    opacity={RIB_DEPTH[i]}
                    filter="url(#dv-soft)"
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke="#2a0b02"
                    strokeWidth="4"
                    opacity="0.42"
                    filter="url(#dv-tiny)"
                  />
                </g>
              ))}

              {/* Prohlubeň kolem stopky a nazelenalý nádech pod ní. */}
              <ellipse cx="300" cy="238" rx="100" ry="34" fill="#2d0d02" opacity="0.5" filter="url(#dv-soft)" />
              <path d={BODY} fill="url(#dv-blush)" />

              {/* Odlesk. Jeden, měkký, vlevo nahoře — dva by si odporovaly. */}
              <ellipse
                cx="206"
                cy="300"
                rx="84"
                ry="48"
                fill="#ffe4b4"
                opacity="0.32"
                filter="url(#dv-soft)"
                transform="rotate(-20 206 300)"
              />

              {/* Odražené světlo na pravé hraně. Odděluje dýni od tmy za ní. */}
              <path d={RIM} fill="none" stroke="#ffcf92" strokeWidth="11" opacity="0.34" filter="url(#dv-soft)" />

              {/* Zastínění u dna — dýně na něčem leží. */}
              <ellipse cx="300" cy="580" rx="240" ry="76" fill="#1c0802" opacity="0.55" filter="url(#dv-wide)" />

              <path d={BODY} fill="url(#dv-edge)" />

              <path
                d={BODY}
                fill="#000"
                filter="url(#dv-grain)"
                opacity="0.14"
                style={{ mixBlendMode: "multiply" }}
              />
            </g>

            <path d={BODY} fill="none" stroke="#3d1404" strokeWidth="2.5" opacity="0.4" />

            {/* Kontaktní stín pod stopkou. Bez něj stopka na dýni leží,
                místo aby z ní vyrůstala. */}
            <ellipse cx="298" cy="242" rx="46" ry="15" fill="#1e0801" opacity="0.5" filter="url(#dv-soft)" />
          </g>

          {/* Díry. Tmavé, kreslí se přes tělo. */}
          <g>
            {CUTS.map((c) => (
              <path key={c.id} data-hole={c.id} d={c.d} fill="#0b0502" opacity="0" />
            ))}
          </g>

          {/* Svíčka. Celá skupina bliká zároveň — jeden plamen uvnitř,
              ne čtyři nezávislé žárovky. */}
          <g className="dv-flame">
            {CUTS.map((c) => (
              <path
                key={c.id}
                data-ember={c.id}
                d={c.d}
                fill="url(#dv-ember)"
                opacity="0"
                style={{ mixBlendMode: "screen" }}
              />
            ))}
            {CUTS.map((c) => (
              <path
                key={`s-${c.id}`}
                data-spill={c.id}
                d={c.d}
                fill="#ffa22e"
                opacity="0"
                filter="url(#dv-bloom)"
                style={{ mixBlendMode: "screen" }}
              />
            ))}
          </g>

          {/* Stopa nože a jiskra na jejím čele. */}
          <g>
            {CUTS.map((c) => (
              <path
                key={c.id}
                data-trace={c.id}
                d={c.d}
                fill="none"
                stroke="url(#dv-blade)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="1"
                filter="url(#dv-cutglow)"
              />
            ))}
            <circle ref={sparkRef} r="7" cx="-50" cy="-50" fill="#fff4d2" opacity="0" filter="url(#dv-cutglow)" />
          </g>
        </svg>

        <p className="dv-hint">
          <span className="dv-hint-mouse">{t("introHint")}</span>
          <span className="dv-hint-touch">{t("introHintTouch")}</span>
        </p>

        <div className="dv-title">
          <p className="dv-title-main font-display">{t("introTitle")}</p>
          <p className="dv-title-sub">{t("introSub")}</p>
        </div>
      </div>

      {/* Nůž místo kurzoru. Na dotyku se neukazuje — tam řeže prst. */}
      <div ref={knifeRef} className="dv-knife" aria-hidden="true">
        <svg viewBox="0 0 64 20" width="52" height="17">
          <path d="M2 12 L34 12 L34 8 L2 8 Z" fill="#2c2c2e" />
          <path d="M34 6 L60 9.6 L60 10.4 L34 14 Z" fill="#e8e6df" />
          <path d="M34 6 L60 9.6 L60 10 L34 10 Z" fill="#fffdf6" />
        </svg>
      </div>
    </div>
  );
}
