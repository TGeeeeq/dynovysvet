import type { MetadataRoute } from "next";

const BASE = "https://www.dynovysvet.cz";

/**
 * Priority nejsou libovolné: vstupenky a Dýňový svět jsou to, kvůli čemu
 * na web lidé v sezóně chodí, recepty a pěstování zase přivádějí návštěvnost
 * po zbytek roku.
 */
const PAGES: [path: string, priority: number, freq: MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
  ["", 1, "weekly"],
  ["/dynovy-svet", 0.9, "weekly"],
  ["/vstupenky", 0.9, "daily"],
  ["/skoly", 0.8, "monthly"],
  ["/statek", 0.6, "monthly"],
  ["/blesi-trh", 0.6, "monthly"],
  ["/recepty", 0.7, "monthly"],
  ["/pestovani", 0.7, "monthly"],
  ["/kontakt", 0.6, "yearly"],
  ["/obchodni-podminky", 0.2, "yearly"],
  ["/ochrana-soukromi", 0.2, "yearly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PAGES.map(([path, priority, changeFrequency]) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
