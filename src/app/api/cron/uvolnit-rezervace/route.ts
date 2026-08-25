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
 * Cron na Vercelu se autorizuje hlavičkou s CRON_SECRET; bez ní endpoint
 * odmítne, aby ho nešlo spouštět zvenčí.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Nepovoleno", { status: 401 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ skipped: "DATABASE_URL není nastavena" });
  }

  const released = await releaseExpiredHolds();
  return NextResponse.json({ released });
}
