import Link from "next/link";
import { Stamp } from "./Stamp";
import { moodAt } from "@/lib/season";

const NAV = [
  { href: "/dynovy-svet", label: "Dýňový svět" },
  { href: "/skoly", label: "Školy a skupiny" },
  { href: "/statek", label: "Statek" },
  { href: "/blesi-trh", label: "Bleší trh" },
  { href: "/recepty", label: "Recepty" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header({ now = new Date() }: { now?: Date }) {
  const mood = moodAt(now);

  return (
    <header className="relative z-40">
      {/* Sezónní pruh. Web ví, jaký je den, a říká to jako první věc —
          návštěvník se ptá „máte otevřeno?" dřív než na cokoli jiného. */}
      <div className="border-b border-ink/10 bg-ink text-paper">
        <div className="mx-auto flex max-w-[88rem] items-center gap-3 px-5 py-2 text-[0.78rem] sm:px-8">
          <span
            className={`inline-block size-1.5 shrink-0 rounded-full ${
              mood.ticketsOpen ? "bg-lantern" : "bg-paper/40"
            }`}
            aria-hidden
          />
          <p className="truncate tracking-wide">{mood.label}</p>
          {mood.ticketsOpen && (
            <Link
              href="/vstupenky"
              className="ml-auto shrink-0 underline decoration-lantern decoration-2 underline-offset-4 hover:text-lantern"
            >
              Koupit vstupenky
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-[88rem] items-center gap-6 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <Stamp size={52} className="shrink-0" />
          <span className="leading-none">
            <span className="font-display block text-[1.32rem] font-semibold">Dýňový svět</span>
            <span className="block text-[0.72rem] uppercase tracking-[0.18em] text-ink-faint">
              Statek u Pipků
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 text-[0.92rem] lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="relative py-1 text-ink-soft transition-colors hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/vstupenky"
          className="ml-auto shrink-0 rounded-full border-2 border-ink px-5 py-2 text-[0.9rem] font-medium text-ink transition-colors hover:bg-ink hover:text-paper lg:ml-0"
        >
          Vstupenky
        </Link>
      </div>
    </header>
  );
}
