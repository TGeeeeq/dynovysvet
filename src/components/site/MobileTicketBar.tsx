import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/dict";
import { href } from "@/lib/i18n/routes";
import { moodAt } from "@/lib/season";

/**
 * Lišta s odkazem na vstupenky, přilepená dole na telefonu.
 *
 * V hlavičce se na 390 px pixely nedostávají — logo, přepínač jazyka
 * a menu ji vyplní beze zbytku, takže tlačítko na vstupenky by muselo
 * zmizet. A to je na výdělečném webu ta poslední věc, která smí zmizet.
 *
 * Ukazuje se jen v sezóně, kdy se opravdu prodává; mimo ni by jen zabírala
 * spodní třetinu displeje. Čistě CSS, žádný skript.
 */
export function MobileTicketBar({ locale, now = new Date() }: { locale: Locale; now?: Date }) {
  const mood = moodAt(now);
  if (!mood.ticketsOpen) return null;
  const t = makeT(locale);

  return (
    <>
      {/* Lišta je `fixed`, takže by jinak překryla poslední řádek patičky. */}
      <div aria-hidden className="h-[4.5rem] sm:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink/15 bg-paper-bright/95 px-4 py-3 backdrop-blur-sm sm:hidden">
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-[0.8rem] text-ink-soft">{mood.label[locale]}</p>
          <Link
            href={href("tickets", locale)}
            className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-[0.92rem] text-paper"
          >
            {t("buyTickets")}
          </Link>
        </div>
      </div>
    </>
  );
}
