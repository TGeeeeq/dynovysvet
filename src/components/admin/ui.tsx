import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Stavební prvky administrace.
 *
 * Vizuálně navazuje na web — stejný papír, stejný inkoust, stejné vlasové
 * linky — ale je to pracovní nástroj, ne výkladní skříň: žádné ilustrace,
 * žádné animace, hustší sazba. Čísla vždy v tabulkových číslicích, aby se
 * ve sloupci srovnala pod sebe.
 *
 * Pravidlo z webu platí i tady: oranžová je zvýraznění, nikdy velká plocha.
 */

/* ------------------------------------------------------------------ text */

export function PageTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink/15 pb-5">
      <div>
        <h1 className="font-display text-[2rem] font-semibold leading-tight">{title}</h1>
        {hint && <p className="mt-1.5 max-w-2xl text-[0.95rem] text-ink-soft">{hint}</p>}
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[0.72rem] uppercase tracking-[0.24em] text-ink-faint">{children}</h2>
  );
}

/** Vysvětlivka pod polem. Píše se česky a bez žargonu — čte to majitel. */
export function Hint({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[0.84rem] leading-relaxed text-ink-faint">{children}</p>;
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="border-2 border-dashed border-ink/15 px-5 py-10 text-center text-ink-faint">
      {children}
    </p>
  );
}

/* --------------------------------------------------------------- tlačítka */

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.94rem] transition-colors disabled:cursor-not-allowed disabled:opacity-45";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "quiet" | "danger" }) {
  const look =
    variant === "primary"
      ? "bg-ink text-paper enabled:hover:bg-ember"
      : variant === "danger"
        ? "border-2 border-ember text-ember enabled:hover:bg-ember enabled:hover:text-paper"
        : "border-2 border-ink/20 text-ink enabled:hover:border-ink";
  return <button {...props} className={`${BTN_BASE} ${look} ${className}`} />;
}

export function LinkButton({
  href,
  children,
  variant = "quiet",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "quiet";
}) {
  const look =
    variant === "primary"
      ? "bg-ink text-paper hover:bg-ember"
      : "border-2 border-ink/20 text-ink hover:border-ink";
  return (
    <Link href={href} className={`${BTN_BASE} ${look}`}>
      {children}
    </Link>
  );
}

/* --------------------------------------------------------------- formulář */

export const LABEL_CLASS = "block text-[0.72rem] uppercase tracking-[0.2em] text-ink-faint";
export const INPUT_CLASS =
  "mt-2 block w-full border-0 border-b-2 border-ink/20 bg-transparent px-0 py-2.5 text-[1.05rem] text-ink placeholder:text-ink-faint/60 transition-colors focus:border-pumpkin focus:outline-none focus:ring-0";

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={LABEL_CLASS}>
        {label}
      </label>
      {children}
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}

/* --------------------------------------------------------------- tabulka */

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    // Široká tabulka se roluje sama v sobě; stránka se nikdy nesmí
    // rozjet do stran, jinak na telefonu zmizí navigace.
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[46rem] border-collapse text-[0.95rem]">
        <thead>
          <tr className="border-b-2 border-ink/15 text-left">
            {head.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap py-2.5 pr-6 text-[0.7rem] font-normal uppercase tracking-[0.18em] text-ink-faint last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/12">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={`py-3 pr-6 align-top last:pr-0 ${className}`}>{children}</td>;
}

/* ----------------------------------------------------------------- stavy */

export type Tone = "neutral" | "ok" | "warn" | "bad";

const TONE: Record<Tone, string> = {
  neutral: "border-ink/25 text-ink-soft",
  ok: "border-moss/60 text-moss",
  warn: "border-wheat text-ember",
  bad: "border-ember/70 text-ember",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-sm border px-2 py-0.5 text-[0.72rem] uppercase tracking-[0.14em] ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}

/** Velké číslo na přehledu. Popisek nahoře, hodnota dole — čte se shora dolů. */
export function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: ReactNode;
  note?: string;
}) {
  return (
    <div className="border-t-2 border-ink/15 pt-3">
      <p className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">{label}</p>
      <p className="tabular mt-1.5 text-[1.9rem] font-medium leading-none">{value}</p>
      {note && <p className="mt-1.5 text-[0.86rem] text-ink-soft">{note}</p>}
    </div>
  );
}

/** Hláška po uložení nebo po chybě. */
export function Notice({ tone = "ok", children }: { tone?: "ok" | "bad"; children: ReactNode }) {
  return (
    <p
      role="status"
      className={`border-l-2 py-2.5 pl-4 text-[0.95rem] ${
        tone === "ok" ? "border-moss text-moss" : "border-ember text-ember"
      }`}
    >
      {children}
    </p>
  );
}
