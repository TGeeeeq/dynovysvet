"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/admin/session";
import { hasDatabaseUrl } from "@/lib/db/client";
import {
  SETTINGS_SCHEMA,
  SETTING_KEYS,
  getAllSettings,
  setSetting,
  type SettingKey,
} from "@/lib/db/settings";

/**
 * Nastavení prodeje.
 *
 * Hlavní vypínač (`prodej.zapnut`) má vlastní akci a vlastní tlačítko: je to
 * jediná věc na téhle stránce, která se mačká ve spěchu (rozbité počasí,
 * porucha), a nesmí se schovávat za „uložit celý formulář".
 *
 * Zbytek se ukládá naráz a zapisují se jen klíče, které se opravdu změnily —
 * jinak by v záznamu změn každé uložení vypadalo, že majitel přepsal všechno.
 */

export type SettingsState = {
  /** Klíč, u kterého je chyba — popisek k němu dohledá formulář, ne adresa. */
  errorKey?: string;
  error?: string;
};

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "neznama";
}

/** Nastavení sahá i na web — vypnutý prodej, hláška v hlavičce, název sezóny. */
function refresh(): void {
  revalidatePath("/admin/nastaveni");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/vstupenky");
  revalidatePath("/[locale]", "layout");
}

/** Co se u toho klíče čeká za hodnotu, česky a bez zmínky o schématu. */
function expectation(key: SettingKey): string {
  const schema = SETTINGS_SCHEMA[key];
  if (schema instanceof z.ZodNumber) {
    const min = Number.isFinite(schema.minValue) ? schema.minValue : null;
    const max = Number.isFinite(schema.maxValue) ? schema.maxValue : null;
    if (min !== null && max !== null) return `Zadejte celé číslo od ${min} do ${max}.`;
    return "Zadejte celé číslo.";
  }
  return "Tuhle hodnotu systém nepřijal.";
}

/** Nejdelší text, který u daného klíče dovolíme uložit. */
function limit(key: SettingKey): number {
  if (key === "email.potvrzeni_podpis") return 500;
  if (key === "web.oznameni") return 300;
  return 200;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function ulozitNastaveni(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireAdmin();
  if (!hasDatabaseUrl()) {
    return { error: "Databáze není připojená, nastavení se nemá kam uložit." };
  }

  const current = await getAllSettings();
  const changed: string[] = [];

  for (const key of SETTING_KEYS) {
    // Hlavní vypínač má vlastní tlačítko — kdyby byl i tady, přepisovala by
    // ho každá jiná změna a nikdo by nevěděl, která hodnota platí.
    if (key === "prodej.zapnut") continue;

    const schema = SETTINGS_SCHEMA[key];
    const raw = formData.get(key);
    let value: unknown;

    if (schema instanceof z.ZodBoolean) {
      value = raw === "1";
    } else if (schema instanceof z.ZodNumber) {
      const text = typeof raw === "string" ? raw.trim() : "";
      const parsed = Number(text);
      if (text === "" || !Number.isInteger(parsed)) {
        return { errorKey: key, error: expectation(key) };
      }
      value = parsed;
    } else {
      const text = typeof raw === "string" ? raw.trim() : "";
      if (key === "provoz.alert_email" && text !== "" && !EMAIL_RE.test(text)) {
        return { errorKey: key, error: "Tohle nevypadá jako e-mailová adresa." };
      }
      value = text.slice(0, limit(key));
    }

    if (value === current[key]) continue;

    const result = await setSetting(key, value, user.id);
    if (!result.ok) return { errorKey: key, error: expectation(key) };
    changed.push(key);
  }

  if (changed.length > 0) {
    await audit(user.id, "nastaveni.ulozeno", {
      entity: "settings",
      detail: { klice: changed },
      ip: await clientIp(),
    });
    refresh();
  }

  redirect(`/admin/nastaveni?z=ulozeno&n=${changed.length}`);
}

/** Hlavní vypínač prodeje. Jedno tlačítko, okamžitý efekt na webu. */
export async function prepnoutProdej(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  if (!hasDatabaseUrl()) redirect("/admin/nastaveni?z=bez_databaze");

  const on = formData.get("zapnout") === "1";
  const result = await setSetting("prodej.zapnut", on, user.id);
  if (!result.ok) redirect("/admin/nastaveni?z=chyba");

  await audit(user.id, on ? "nastaveni.prodej_zapnut" : "nastaveni.prodej_vypnut", {
    entity: "settings",
    entityId: "prodej.zapnut",
    ip: await clientIp(),
  });

  refresh();
  redirect(`/admin/nastaveni?z=${on ? "prodej_zapnut" : "prodej_vypnut"}`);
}
