"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { rateLimit } from "@/lib/security/rate-limit";
import {
  GATE_COOKIE,
  GATE_TTL_SECONDS,
  RETURN_PARAM,
  isGateEnabled,
  issueGateToken,
  passwordMatches,
  safeReturnPath,
} from "@/lib/security/site-gate";

/**
 * Odemčení nespuštěného webu.
 *
 * Limit je in-memory, tedy per-instance a jen best-effort (viz komentář
 * v `src/lib/security/rate-limit.ts`). Tady to stačí: heslo zná okruh
 * pozvaných a chráníme se proti hloupému skriptu, ne proti kampani —
 * a rozhodně kvůli zámku nespuštěného webu nezavádíme tabulku v databázi.
 */

export type GateState = { error?: string };

/** Deset pokusů za čtvrt hodiny. Kdo heslo dostal, trefí ho dřív. */
const LIMIT = 10;
const WINDOW_SECONDS = 15 * 60;

export async function unlock(_prev: GateState, formData: FormData): Promise<GateState> {
  // Web se mezitím mohl otevřít — pak nemá formulář co ověřovat.
  if (!isGateEnabled()) redirect("/");

  const password = String(formData.get("heslo") ?? "");
  const target = safeReturnPath(String(formData.get(RETURN_PARAM) ?? ""));

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "neznama";

  const limit = rateLimit(`vstup:${ip}`, LIMIT, WINDOW_SECONDS);
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return { error: `Příliš mnoho pokusů. Zkuste to znovu za ${minutes} min.` };
  }

  if (!(await passwordMatches(password))) {
    return { error: "Heslo nesouhlasí. Zkuste to prosím znovu." };
  }

  const jar = await cookies();
  jar.set(GATE_COOKIE, await issueGateToken(), {
    httpOnly: true,
    // Na localhostu běží http a secure cookie by se vůbec neuložila.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GATE_TTL_SECONDS,
  });

  redirect(target);
}
