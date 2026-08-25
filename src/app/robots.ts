import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Administrace a brána nemají v indexu co dělat.
      disallow: ["/admin", "/brana", "/api/"],
    },
    sitemap: "https://www.dynovysvet.cz/sitemap.xml",
  };
}
