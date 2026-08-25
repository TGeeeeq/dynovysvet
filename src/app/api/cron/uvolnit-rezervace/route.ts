import { NextResponse } from "next/server";
import { releaseExpiredHolds } from "@/lib/db/booking";
import { hasDatabaseUrl } from "@/lib/db/client";

/**
 * Uvolňuje propadlé rezervace.
 *
 * Když někdo dojde do pokladny a platbu nedokončí, jeho místa by jinak
 * zůstala blokovaná až do konce sezóny. Běží každou minutu — v den otevření
 * registrací je rozdíl mezi „místo se vrátí za minutu" a „za čtvrt hodiny"
 * dost velký na to, aby se projevil na tržbě.
 *
 * Cron se autorizuje hlavičkou s CRON_SECRET. V produkci je tajemství
 * povinné — bez něj by šlo endpoint spouštět zvenčí libovolně často.
 * Mimo produkci se kontrola přeskočí, aby se dal cron zkusit ručně.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("CRON_SECRET není nastavena — uvolňování rezervací neběží.");
      return new NextResponse("Není nastaveno", { status: 503, headers: NO_STORE });
    }
  } else if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Nepovoleno", { status: 401, headers: NO_STORE });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ skipped: "DATABASE_URL není nastavena" }, { headers: NO_STORE });
  }

  const released = await releaseExpiredHolds();
  return NextResponse.json({ released }, { headers: NO_STORE });
}
