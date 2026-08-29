import type { MetadataRoute } from "next";
import { isGateEnabled } from "@/lib/security/site-gate";

export default function robots(): MetadataRoute.Robots {
  // Zamčený web nemá co indexovat — prohledávač by za heslo stejně nepustil
  // a v indexu by zůstala jen stránka se zámkem.
  if (isGateEnabled()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Administrace a brána nemají v indexu co dělat.
      disallow: ["/admin", "/brana", "/vstup", "/api/"],
    },
    sitemap: "https://www.dynovysvet.cz/sitemap.xml",
  };
}
