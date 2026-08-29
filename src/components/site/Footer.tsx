import Link from "next/link";
import { Stamp } from "./Stamp";
import { AFLogo } from "./AFLogo";
import { FARM } from "@/content/farm";
import type { Locale } from "@/lib/i18n/config";
import { makeT, type DictKey } from "@/lib/i18n/dict";
import { href, type RouteKey } from "@/lib/i18n/routes";

const FOOTER_NAV: ReadonlyArray<[RouteKey, DictKey]> = [
  ["pumpkinWorld", "navPumpkinWorld"],
  ["tickets", "navTickets"],
  ["schools", "navSchools"],
  ["venue", "navVenue"],
  ["fleaMarket", "navFleaMarket"],
  ["recipes", "navRecipes"],
  ["growing", "navGrowing"],
];

export function Footer({ locale }: { locale: Locale }) {
  const t = makeT(locale);

  return (
    <footer className="border-t-2 border-ink/15 bg-paper-deep/60">
      <div className="mx-auto grid max-w-[88rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[auto_1fr_1fr_1fr]">
        <div className="max-w-56">
          <Stamp size={92} className="text-ink/80" />
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">{t("findUs")}</h2>
          <address className="mt-3 space-y-1 text-[0.94rem] not-italic leading-relaxed text-ink-soft">
            <p>{FARM.street}</p>
            <p>{FARM.zip} Nová Ves u Leštiny</p>
            <p className="pt-2">
              <a className="underline decoration-pumpkin underline-offset-4" href={`tel:${FARM.phone}`}>
                {FARM.phoneHuman}
              </a>
            </p>
            <p>
              <a className="underline decoration-pumpkin underline-offset-4" href={`mailto:${FARM.email}`}>
                {FARM.email}
              </a>
            </p>
          </address>
          <p className="mt-4 text-[0.86rem] text-ink-faint">{t("trainNote")}</p>
        </div>

        <nav aria-label={t("footerNav")} className="text-[0.94rem]">
          <h2 className="font-display text-lg font-semibold">{t("onTheFarm")}</h2>
          <ul className="mt-3 space-y-1.5 text-ink-soft">
            {FOOTER_NAV.map(([key, label]) => (
              <li key={key}>
                <Link href={href(key, locale)} className="hover:text-ink hover:underline underline-offset-4">
                  {t(label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-[0.94rem]">
          <h2 className="font-display text-lg font-semibold">{t("operator")}</h2>
          <div className="mt-3 space-y-1.5 text-ink-soft">
            <p>
              {FARM.owner}, IČ {FARM.ico}
            </p>
            <p className="text-[0.86rem] text-ink-faint">{t("operatorNote")}</p>
            <p className="pt-2 text-[0.86rem] text-ink-faint">
              {t("forestNote")} {FARM.spolek}, IČO {FARM.icoSpolek}.
            </p>
          </div>
          <ul className="mt-4 space-y-1.5 text-ink-soft">
            <li>
              <a
                href={FARM.facebook}
                className="hover:text-ink hover:underline underline-offset-4"
                rel="noreferrer noopener"
                target="_blank"
              >
                Facebook
              </a>
            </li>
            <li>
              <Link href={href("terms", locale)} className="hover:text-ink hover:underline underline-offset-4">
                {t("navTerms")}
              </Link>
            </li>
            <li>
              <Link href={href("privacy", locale)} className="hover:text-ink hover:underline underline-offset-4">
                {t("navPrivacy")}
              </Link>
            </li>
            <li>
              {/* Vstup do administrace. Nenápadný, ale existující — jinak by
                  majitel musel adresu znát nazpaměť. */}
              <Link
                href="/admin"
                rel="nofollow"
                className="text-ink-faint hover:text-ink hover:underline underline-offset-4"
              >
                {t("siteAdmin")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-[88rem] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-5 text-[0.8rem] text-ink-faint sm:px-8">
          <p>
            © {new Date().getFullYear()} {FARM.name}
          </p>
          <p>
            {t("partners")}:{" "}
            <a
              href="https://www.kudyznudy.cz/"
              className="underline underline-offset-4"
              rel="noreferrer noopener"
              target="_blank"
            >
              Kudy z nudy
            </a>
            {" · "}
            <a
              href="https://www.szif.cz"
              className="underline underline-offset-4"
              rel="noreferrer noopener"
              target="_blank"
            >
              Program rozvoje venkova
            </a>
          </p>
          <a
            href="https://www.antoninfigueroa.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="group ml-auto inline-flex items-center gap-2.5 text-ink-faint transition-colors hover:text-ink"
          >
            <AFLogo
              size={30}
              className="ring-1 ring-[#d4a45a]/20 transition duration-500 ease-out group-hover:scale-105 group-hover:ring-[#d4a45a]/45 group-hover:shadow-[0_0_18px_rgba(212,164,90,0.25)]"
            />
            <span>
              {t("madeBy")} <span className="font-display tracking-wide">Antonín Figueroa</span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
