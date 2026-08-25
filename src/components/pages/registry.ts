import type { ComponentType } from "react";
import type { RouteKey } from "@/lib/i18n/routes";
import type { PageProps } from "./types";

import { Home } from "./Home";
import { PumpkinWorld } from "./PumpkinWorld";
import { Tickets } from "./Tickets";
import { Schools } from "./Schools";
import { Venue } from "./Venue";
import { FleaMarket } from "./FleaMarket";
import { Recipes } from "./Recipes";
import { Growing } from "./Growing";
import { Contact } from "./Contact";
import { Terms } from "./Terms";
import { Privacy } from "./Privacy";

/**
 * Stránky nejsou soubory v `app/`, protože slug se v každém jazyce jmenuje
 * jinak (`/vstupenky`, `/en/tickets`, `/de/eintrittskarten`). Router jednu
 * stránku dohledá tady podle klíče, který mu vrátí `routeKeyFromSlug`.
 */
export const PAGES: Record<RouteKey, ComponentType<PageProps>> = {
  home: Home,
  pumpkinWorld: PumpkinWorld,
  tickets: Tickets,
  schools: Schools,
  venue: Venue,
  fleaMarket: FleaMarket,
  recipes: Recipes,
  growing: Growing,
  contact: Contact,
  terms: Terms,
  privacy: Privacy,
};
