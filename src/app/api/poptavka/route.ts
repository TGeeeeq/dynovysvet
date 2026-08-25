import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, hasDatabaseUrl, schema } from "@/lib/db/client";
import { FARM } from "@/content/farm";
import { rateLimit } from "@/lib/security/rate-limit";
import { LOCALES } from "@/lib/i18n/config";

/**
 * Příjem poptávkových formulářů (školy, pronájem, bleší trh, obecný dotaz).
 *
 * Poptávka se ukládá do databáze a zároveň se posílá e-mailem. To pořadí je
 * záměrné: kdyby výpadek e-mailu shodil celý požadavek, přišli bychom o
 * poptávku úplně. Zápis do databáze je zdroj pravdy, e-mail je jen upozornění.
 */

export const runtime = "nodejs";

const Body = z.object({
  kind: z.enum(["skola", "pronajem", "blesi_trh", "obecny"]),
  locale: z.enum(LOCALES).default("cs"),
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().max(40).nullish(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  message: z.string().trim().max(4000).nullish(),
  choice: z.string().trim().max(200).nullish(),
  options: z.array(z.string().trim().max(200)).max(12).nullish(),
  /** Past na roboty — člověk tohle pole nevidí. */
  web: z.string().max(0).nullish(),
});

const SUBJECTS: Record<z.infer<typeof Body>["kind"], string> = {
  skola: "Nová poptávka — školy a skupiny",
  pronajem: "Nová poptávka — pronájem statku",
  blesi_trh: "Nová registrace — bleší trh",
  obecny: "Nový dotaz z webu",
};

export async function POST(request: Request) {
  // Hrubá brzda proti zaplavení schránky. In-memory limiter je na serverless
  // jen per-instance, ale robota, který tluče ze stejného spojení, zastaví;
  // pomalejší útok chytne honeypot a ruční kontrola v administraci.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "neznama";
  const gate = rateLimit(`poptavka:${ip}`, 5, 600);
  if (!gate.allowed) {
    return NextResponse.json(
      { error: "Příliš mnoho pokusů. Zkuste to prosím za chvíli." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfterSeconds) } },
    );
  }

  let parsed;
  try {
    parsed = Body.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Formulář se nepodařilo přečíst. Zkontrolujte prosím vyplněná pole." },
      { status: 400 },
    );
  }

  // Robot vyplnil honeypot. Tváříme se, že vše proběhlo — ať nezkouší znovu.
  if (parsed.web) return NextResponse.json({ ok: true });

  const extra: Record<string, unknown> = {};
  if (parsed.choice) extra.choice = parsed.choice;
  if (parsed.options?.length) extra.options = parsed.options;
  // Jazyk, ve kterém poptávka přišla — majitel má odpovídat stejným.
  extra.locale = parsed.locale;

  if (hasDatabaseUrl()) {
    try {
      await getDb().insert(schema.inquiries).values({
        kind: parsed.kind,
        name: parsed.name,
        email: parsed.email.toLowerCase(),
        phone: parsed.phone || null,
        preferredDate: parsed.date ?? null,
        message: parsed.message || null,
        extra: Object.keys(extra).length ? extra : null,
      });
    } catch (error) {
      console.error("Poptávku se nepodařilo uložit:", error);
      return NextResponse.json(
        { error: "Nepodařilo se poptávku uložit. Zkuste to prosím znovu, nebo nám zavolejte." },
        { status: 500 },
      );
    }
  } else {
    // Bez databáze (lokální vývoj, preview bez env) alespoň nic neztratíme.
    console.warn("DATABASE_URL chybí, poptávka jen do logu:", parsed);
  }

  await notify(parsed, extra);
  return NextResponse.json({ ok: true });
}

/**
 * Upozornění na e-mail. Selhání se jen loguje — poptávka už je v databázi
 * a majitel ji uvidí v administraci i bez e-mailu.
 */
async function notify(data: z.infer<typeof Body>, extra: Record<string, unknown>) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const lines = [
    `Jméno: ${data.name}`,
    `E-mail: ${data.email}`,
    data.phone && `Telefon: ${data.phone}`,
    data.date && `Termín: ${data.date}`,
    extra.choice && `Volba: ${extra.choice}`,
    Array.isArray(extra.options) && `Volby: ${extra.options.join(", ")}`,
    `Jazyk: ${data.locale}`,
    data.message && `\n${data.message}`,
  ].filter(Boolean);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? "web@dynovysvet.cz",
        to: [process.env.MAIL_TO ?? FARM.email],
        reply_to: data.email,
        subject: SUBJECTS[data.kind],
        text: lines.join("\n"),
      }),
    });
  } catch (error) {
    console.error("Upozornění na poptávku se nepodařilo odeslat:", error);
  }
}
