"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dict";
import { LocaleSwitch } from "./LocaleSwitch";

export interface NavItem {
  href: string;
  label: string;
  /** Římská číslice u položky — stejná typografická rodina jako tabule na webu. */
  plate: string;
}

/**
 * Menu na mobilu. Ne tmavý overlay s tenkým seznamem — papírový arch, který
 * sjede přes obrazovku, s velkou sazbou a římskými číslicemi jako u tabulí
 * v herbáři. Na malém displeji je to jediné místo, kde má web prostor
 * ukázat charakter.
 */
export function MobileNav({
  items,
  locale,
  ticketsHref,
}: {
  items: NavItem[];
  locale: Locale;
  ticketsHref: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Zavřít při přechodu na jinou stránku.
  useEffect(() => setOpen(false), [pathname]);

  // Zamknout scroll pod otevřeným menu a pustit Esc.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? dict.closeMenu[locale] : dict.openMenu[locale]}
        className="relative z-[60] -mr-1 grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink/80 text-ink lg:hidden"
      >
        {/* Tři ručně nerovné linky — stejná ruka jako zbytek kresby. */}
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
          {open ? (
            <>
              <path d="M5.4 5.2 18.7 18.6" />
              <path d="M18.6 5.4 5.2 18.8" />
            </>
          ) : (
            <>
              <path d="M3.4 7.1h17.3" />
              <path d="M3.2 12.2h17.6" />
              <path d="M3.5 17.2h17.1" />
            </>
          )}
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-0 z-50 flex flex-col bg-paper lg:hidden"
      >
        {/* Zrno i tady, jinak by menu vypadalo jako z jiného webu. */}
        <div className="grain pointer-events-none absolute inset-0" aria-hidden />

        <nav
          aria-label={dict.mainNav[locale]}
          className="relative flex-1 overflow-y-auto px-6 pb-8 pt-24"
        >
          <ul>
            {items.map((item) => (
              <li key={item.href} className="border-b border-ink/12 last:border-0">
                <Link
                  href={item.href}
                  className="group flex items-baseline gap-4 py-4 text-ink"
                >
                  <span className="tabular w-7 shrink-0 text-[0.7rem] tracking-[0.2em] text-pumpkin">
                    {item.plate}
                  </span>
                  <span className="font-display text-[2rem] font-semibold leading-none">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative flex items-center gap-4 border-t-2 border-ink/15 bg-paper-deep/70 px-6 py-5">
          <LocaleSwitch current={locale} size="lg" />
          <Link
            href={ticketsHref}
            className="ml-auto rounded-full bg-ink px-6 py-2.5 font-medium text-paper"
          >
            {dict.buyTickets[locale]}
          </Link>
        </div>
      </div>
    </>
  );
}
