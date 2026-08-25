import Link from "next/link";
import { GourdPlate } from "@/components/illustrations/Gourd";
import { GOURDS } from "@/lib/illustrations/gourds";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/dict";
import { href } from "@/lib/i18n/routes";

/**
 * 404 se vykresluje bez znalosti jazyka (Next ji hledá výš než parametr
 * cesty), takže mluví česky — což je u statku na Vysočině správná sázka.
 */
export default function NotFound() {
  const t = makeT(DEFAULT_LOCALE);
  return (
    <div className="mx-auto flex max-w-[88rem] flex-col items-center gap-8 px-5 py-28 text-center sm:px-8">
      <GourdPlate gourd={GOURDS[5]} size={190} seed={404} className="opacity-70" />
      <h1 className="font-display letterpress text-[clamp(2.4rem,7vw,4.5rem)] font-semibold">
        {t("notFoundTitle")}
      </h1>
      <p className="max-w-md text-lg leading-relaxed text-ink-soft">{t("notFoundBody")}</p>
      <Link
        href={href("home", DEFAULT_LOCALE)}
        className="rounded-full border-2 border-ink px-6 py-2.5 font-medium transition-colors hover:bg-ink hover:text-paper"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
