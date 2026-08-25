"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAME, LOCALE_SHORT, isLocale, type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dict";
import { href, routeKeyFromSlug } from "@/lib/i18n/routes";

/**
 * Přepínač jazyka, který **zůstane na téže stránce**. Přehodit návštěvníka
 * na titulku jen proto, že klikl na „EN", je nejrychlejší způsob, jak ho
 * ztratit — a přesně to dělá většina vícejazyčných webů.
 *
 * Cestu čteme z prohlížeče, ne z props: hlavička je v layoutu a ten o tom,
 * kterou stránku právě vykresluje, neví.
 */
export function LocaleSwitch({
  current,
  className = "",
  size = "sm",
}: {
  current: Locale;
  className?: string;
  size?: "sm" | "lg";
}) {
  const pathname = usePathname() ?? "/";

  // `/en/tickets` → locale `en`, slug `tickets`; `/vstupenky` → `cs`, `vstupenky`.
  const parts = pathname.split("/").filter(Boolean);
  const fromPath = isLocale(parts[0]) ? (parts[0] as Locale) : DEFAULT_LOCALE;
  const slug = isLocale(parts[0]) ? parts[1] : parts[0];
  const key = slug ? routeKeyFromSlug(fromPath, slug) : "home";

  return (
    <div
      className={`flex items-center ${size === "lg" ? "gap-1 text-base" : "gap-0.5 text-[0.76rem]"} ${className}`}
      role="group"
      aria-label={dict.switchLanguage[current]}
    >
      {LOCALES.map((l, i) => {
        const target = key ? href(key, l) : href("home", l);
        const active = l === current;
        return (
          <span key={l} className="flex items-center">
            {i > 0 && (
              <span aria-hidden className="mx-1 h-3 w-px bg-current opacity-25" />
            )}
            {active ? (
              <span
                aria-current="true"
                className={`rounded-sm px-1.5 py-0.5 font-medium tracking-[0.12em] ${
                  size === "lg" ? "bg-ink text-paper" : "bg-current/15"
                }`}
              >
                {LOCALE_SHORT[l]}
              </span>
            ) : (
              <Link
                href={target}
                hrefLang={l}
                lang={l}
                title={LOCALE_NAME[l]}
                className="rounded-sm px-1.5 py-0.5 tracking-[0.12em] opacity-60 transition-opacity hover:opacity-100"
              >
                {LOCALE_SHORT[l]}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
