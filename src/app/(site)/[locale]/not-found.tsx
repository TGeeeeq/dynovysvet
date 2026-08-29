import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/dict";
import { href } from "@/lib/i18n/routes";

/**
 * 404 se vykresluje bez znalosti jazyka (Next ji hledá výš než parametr
 * cesty), takže mluví česky — což je u statku na Vysočině správná sázka.
 *
 * Žádný obrázek. Chybová stránka má člověka co nejrychleji poslat dál, ne
 * ho na místě, kde nic nenašel, ještě chvíli zdržovat obrázkem.
 */
export default function NotFound() {
  const t = makeT(DEFAULT_LOCALE);
  return (
    <div className="mx-auto flex max-w-[88rem] flex-col items-start gap-7 px-5 py-32 sm:px-8 lg:py-44">
      <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-pumpkin">404</p>
      <h1 className="font-display letterpress max-w-3xl text-balance text-[clamp(2.6rem,9vw,6rem)] font-semibold">
        {t("notFoundTitle")}
      </h1>
      <p className="max-w-md text-lg leading-relaxed text-ink-soft">{t("notFoundBody")}</p>
      <Link href={href("home", DEFAULT_LOCALE)} className="btn btn-outline mt-2">
        {t("backHome")}
      </Link>
    </div>
  );
}
