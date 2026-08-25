import Link from "next/link";
import { Stamp } from "./Stamp";
import { LocaleSwitch } from "./LocaleSwitch";
import { MobileNav, type NavItem } from "./MobileNav";
import { moodAt } from "@/lib/season";
import type { Locale } from "@/lib/i18n/config";
import { makeT, type DictKey } from "@/lib/i18n/dict";
import { href, type RouteKey } from "@/lib/i18n/routes";

/** Klíč stránky + klíč překladu; pořadí je pořadí v menu. */
const NAV: ReadonlyArray<[RouteKey, DictKey]> = [
  ["pumpkinWorld", "navPumpkinWorld"],
  ["schools", "navSchools"],
  ["venue", "navVenue"],
  ["fleaMarket", "navFleaMarket"],
  ["recipes", "navRecipes"],
  ["contact", "navContact"],
];

const PLATES = ["I", "II", "III", "IV", "V", "VI", "VII"];

export function Header({ locale, now = new Date() }: { locale: Locale; now?: Date }) {
  const mood = moodAt(now);
  const t = makeT(locale);
  const ticketsHref = href("tickets", locale);

  const items: NavItem[] = NAV.map(([key, label], i) => ({
    href: href(key, locale),
    label: t(label),
    plate: PLATES[i],
  }));

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
          <p className="truncate tracking-wide">{mood.label[locale]}</p>
          {mood.ticketsOpen && (
            <Link
              href={ticketsHref}
              className="ml-auto hidden shrink-0 underline decoration-lantern decoration-2 underline-offset-4 hover:text-lantern sm:block"
            >
              {t("buyTickets")}
            </Link>
          )}
          <LocaleSwitch current={locale} className="ml-auto shrink-0 sm:ml-6" />
        </div>
      </div>

      <div className="mx-auto flex max-w-[88rem] items-center gap-6 px-5 py-4 sm:px-8">
        <Link href={href("home", locale)} className="flex items-center gap-3 text-ink" aria-label={t("homeLink")}>
          <Stamp size={52} className="shrink-0" />
          <span className="leading-none">
            <span className="font-display block text-[1.32rem] font-semibold">
              {t("navPumpkinWorld")}
            </span>
            <span className="block text-[0.72rem] uppercase tracking-[0.18em] text-ink-faint">
              Statek u Pipků
            </span>
          </span>
        </Link>

        <nav aria-label={t("mainNav")} className="ml-auto hidden items-center gap-7 text-[0.92rem] lg:flex">
          {items.map((n) => (
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
          href={ticketsHref}
          className="ml-auto hidden shrink-0 rounded-full border-2 border-ink px-5 py-2 text-[0.9rem] font-medium text-ink transition-colors hover:bg-ink hover:text-paper sm:block lg:ml-0"
        >
          {t("ticketsCta")}
        </Link>

        <MobileNav items={items} locale={locale} ticketsHref={ticketsHref} />
      </div>
    </header>
  );
}
