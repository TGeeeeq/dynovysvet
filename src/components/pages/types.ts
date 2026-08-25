import type { Locale } from "@/lib/i18n/config";

/** Stránky nejsou route soubory, ale komponenty — jazyk jim předává router. */
export interface PageProps {
  locale: Locale;
}
