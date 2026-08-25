"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { audit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/admin/session";
import {
  CLOCK_RE,
  DATE_RE,
  addSlot,
  closeDay,
  publishAll,
  readSeasonForm,
  removeSlot,
  saveDay,
  setPublished,
  writeSeason,
} from "@/lib/admin/season";

/** Tvar uuid, jak ho generuje `gen_random_uuid()`. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Akce nad sezónou.
 *
 * Výsledek se nevrací do stránky přes stav, ale kódem v adrese — celá sekce
 * sezóny je tak čistě serverová a po obnovení stránky (F5) se nic neopakuje.
 * Do adresy jde vždycky jen kód a čísla, nikdy volný text: adresu vidí
 * prohlížeč, historie i logy.
 */

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "neznama";
}

/** Změna termínů se projeví i na webu — vstupenky se prodávají z těchhle dat. */
function refresh(): void {
  revalidatePath("/admin/sezona");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/vstupenky");
  // Cizojazyčné mutace mají vlastní adresy; přes rozvržení se obnoví všechny.
  revalidatePath("/[locale]", "layout");
}

function back(params: Record<string, string | number>): never {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  redirect(`/admin/sezona?${query}`);
}

/* ---------------------------------------------------------- vypsat sezónu */

export async function vypsatTerminy(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const read = readSeasonForm((key) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : undefined;
  });
  // Sem se dá dostat jen přes náhled, kde už formulář jednou prošel. Když
  // přesto neprojde, někdo si pohrál se skrytými poli — stačí suchá hláška.
  if (!read.plan) back({ z: "neplatne" });

  const result = await writeSeason(read.plan);
  if (!result.ok) {
    await audit(user.id, "sezona.vypsani_selhalo", {
      entity: "event_days",
      detail: { od: read.values.from, do: read.values.to, problem: result.problem },
      ip: await clientIp(),
    });
    back({ z: "chyba" });
  }

  const o = result.outcome;
  await audit(user.id, "sezona.vypsana", {
    entity: "event_days",
    detail: {
      od: read.values.from,
      do: read.values.to,
      delka_minut: read.values.slotMinutes,
      kapacita: read.values.capacity,
      novych_dni: o.newDays,
      novych_casovek: o.newSlots,
      uz_existovalo: o.existing,
      preskoceno_prodano: o.sold,
    },
    ip: await clientIp(),
  });

  refresh();
  back({
    z: o.newDays > 0 ? "vypsano" : "nic",
    n: o.newDays,
    c: o.newSlots,
    m: o.seats,
    b: o.existing.length,
    p: o.sold.length,
  });
}

/* ------------------------------------------------------------ zveřejnění */

export async function prepnoutZverejneni(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const date = String(formData.get("den") ?? "");
  const published = formData.get("zverejnit") === "1";
  if (!DATE_RE.test(date)) back({ z: "neplatne" });

  const result = await setPublished(date, published);
  if (!result.ok) back({ z: "chyba" });

  await audit(user.id, published ? "sezona.den_zverejnen" : "sezona.den_skryt", {
    entity: "event_days",
    entityId: date,
    ip: await clientIp(),
  });

  refresh();
  back({ z: published ? "zverejneno" : "skryto", den: date });
}

export async function zverejnitVse(): Promise<void> {
  const user = await requireAdmin();

  const result = await publishAll();
  if (!result.ok) back({ z: "chyba" });

  await audit(user.id, "sezona.zverejneno_vse", {
    entity: "event_days",
    detail: { pocet: result.count },
    ip: await clientIp(),
  });

  refresh();
  back({ z: "vse", n: result.count });
}

/* --------------------------------------------------------------- zavřít */

export async function zavritDen(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const date = String(formData.get("den") ?? "");
  if (!DATE_RE.test(date)) back({ z: "neplatne" });

  const result = await closeDay(date);
  if (!result.ok) back({ z: result.reason === "prodano" ? "prodano" : "chyba", den: date });

  await audit(user.id, "sezona.den_zavren", {
    entity: "event_days",
    entityId: date,
    ip: await clientIp(),
  });

  refresh();
  back({ z: "zavreno", den: date });
}

/* ------------------------------------------------------- detail jednoho dne */

function toDay(date: string, params: Record<string, string | number>): never {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  redirect(`/admin/sezona/${date}?${query}`);
}

/** Číslo z formuláře. Cokoli, co není celé číslo v rozsahu, je `null`. */
function wholeNumber(value: FormDataEntryValue | null, min: number, max: number): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

/** Uloží kapacity všech časovek dne a poznámku k němu, jedním formulářem. */
export async function ulozitDen(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const date = String(formData.get("den") ?? "");
  if (!DATE_RE.test(date)) back({ z: "neplatne" });

  const rawNote = String(formData.get("poznamka") ?? "").trim();
  const note = rawNote === "" ? null : rawNote.slice(0, 300);

  const capacities: { slotId: string; capacity: number }[] = [];
  for (const raw of formData.getAll("casovka")) {
    const slotId = String(raw);
    // Identifikátory z formuláře nikdy nedůvěřujeme — do dotazu jdou jen ty,
    // které vypadají jako uuid, a `saveDay()` navíc ověří, že patří tomuto dni.
    if (!UUID_RE.test(slotId)) toDay(date, { z: "neplatne" });
    const capacity = wholeNumber(formData.get(`kapacita_${slotId}`), 0, 5000);
    if (capacity === null) toDay(date, { z: "neplatne" });
    capacities.push({ slotId, capacity });
  }

  const result = await saveDay(date, note, capacities);
  if (!result.ok) {
    if (result.conflict) {
      toDay(date, {
        z: "kapacita",
        cas: result.conflict.time,
        prodano: result.conflict.reserved,
        na: result.conflict.wanted,
      });
    }
    toDay(date, { z: "chyba" });
  }

  await audit(user.id, "sezona.den_upraven", {
    entity: "event_days",
    entityId: date,
    detail: { zmeneno_casovek: result.changed, poznamka: note },
    ip: await clientIp(),
  });

  refresh();
  revalidatePath(`/admin/sezona/${date}`);
  toDay(date, { z: "ulozeno", n: result.changed });
}

/** Přidá do dne časovku navíc — třeba dopolední, když přijede škola. */
export async function pridatCasovku(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const date = String(formData.get("den") ?? "");
  if (!DATE_RE.test(date)) back({ z: "neplatne" });

  const from = String(formData.get("od") ?? "");
  const to = String(formData.get("do") ?? "");
  const capacity = wholeNumber(formData.get("kapacita"), 0, 5000);
  if (!CLOCK_RE.test(from) || !CLOCK_RE.test(to) || capacity === null) {
    toDay(date, { z: "neplatne" });
  }

  const result = await addSlot(date, from, to, capacity);
  if (!result.ok) toDay(date, { z: "nepridano" });

  await audit(user.id, "sezona.casovka_pridana", {
    entity: "event_days",
    entityId: date,
    detail: { od: from, do: to, kapacita: capacity },
    ip: await clientIp(),
  });

  refresh();
  revalidatePath(`/admin/sezona/${date}`);
  toDay(date, { z: "pridano", cas: from });
}

/** Smaže časovku. Databáze ji pustí jen tehdy, když na ni nic není prodané. */
export async function smazatCasovku(formData: FormData): Promise<void> {
  const user = await requireAdmin();

  const date = String(formData.get("den") ?? "");
  const slotId = String(formData.get("casovka") ?? "");
  if (!DATE_RE.test(date)) back({ z: "neplatne" });
  if (!UUID_RE.test(slotId)) toDay(date, { z: "neplatne" });

  const result = await removeSlot(slotId);
  if (!result.ok) toDay(date, { z: "nesmazano" });

  await audit(user.id, "sezona.casovka_smazana", {
    entity: "time_slots",
    entityId: slotId,
    detail: { den: date },
    ip: await clientIp(),
  });

  refresh();
  revalidatePath(`/admin/sezona/${date}`);
  toDay(date, { z: "smazano" });
}
