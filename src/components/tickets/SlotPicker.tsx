"use client";

import { useEffect, useMemo, useState } from "react";
import { CapacityMeter } from "./CapacityMeter";
import { TICKET_TYPES, type TicketTypeCode } from "@/lib/tickets/schedule";
import { TICKETS } from "@/content/copy/tickets";
import { copyFor } from "@/content/copy/types";
import { NUMBER_LOCALE, type Locale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/dict";

export interface SlotView {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  reserved: number;
}
export interface DayView {
  date: string;
  slots: SlotView[];
}

/**
 * Datum vykresluje `Intl`, ne vlastní tabulka měsíců. České „26. září"
 * i německé „26. September" tak vzniknou ze stejného kódu a nemusíme
 * udržovat tři seznamy názvů měsíců.
 */
function makeFmtDay(locale: Locale) {
  const tag = NUMBER_LOCALE[locale];
  const wdFmt = new Intl.DateTimeFormat(tag, { weekday: "short", timeZone: "UTC" });
  const monthFmt = new Intl.DateTimeFormat(tag, { month: "long", timeZone: "UTC" });
  const monthShortFmt = new Intl.DateTimeFormat(tag, { month: "short", timeZone: "UTC" });
  return (date: string) => {
    const d = new Date(`${date}T12:00:00Z`);
    return {
      wd: wdFmt.format(d).replace(/\.$/, ""),
      num: d.getUTCDate(),
      month: monthFmt.format(d),
      monthShort: monthShortFmt.format(d).replace(/\.$/, ""),
    };
  };
}
const hhmm = (iso: string) => iso.slice(11, 16);

export function SlotPicker({ days: initialDays, locale }: { days: DayView[]; locale: Locale }) {
  const c = copyFor(TICKETS, locale);
  const t = makeT(locale);
  const fmtDay = useMemo(() => makeFmtDay(locale), [locale]);
  const [days, setDays] = useState(initialDays);
  const [dayIdx, setDayIdx] = useState(0);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<TicketTypeCode, number>>({
    dospely: 2, snizene: 0, dite_do_2: 0, pes: 0,
  });

  const day = days[dayIdx];
  const slot = day?.slots.find((s) => s.id === slotId) ?? null;

  /**
   * Živá kapacita. Endpoint je cachovaný na CDN 10 s, takže i deset tisíc
   * lidí najednou znamená pár requestů na databázi — ne deset tisíc.
   *
   * Jitter je tu záměrně: bez něj se všichni klienti během chvíle
   * zesynchronizují do jedné vlny přesně na hranici cachovacího okna.
   */
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const r = await fetch("/api/dostupnost", { cache: "no-store" });
        if (r.ok && alive) setDays(await r.json());
      } catch {
        // Výpadek pollingu nesmí nic rozbít — zůstanou poslední známá čísla.
      }
      if (alive) timer = setTimeout(tick, 15_000 + Math.random() * 5_000);
    };
    timer = setTimeout(tick, 15_000 + Math.random() * 5_000);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  const counted = useMemo(
    () => TICKET_TYPES.filter((x) => x.countsToCapacity).reduce((a, x) => a + qty[x.code], 0),
    [qty],
  );
  const total = useMemo(
    () => TICKET_TYPES.reduce((a, x) => a + qty[x.code] * x.price, 0),
    [qty],
  );
  const remaining = slot ? slot.capacity - slot.reserved : 0;
  const tooMany = Boolean(slot) && counted > remaining;
  const canSubmit = Boolean(slot) && counted > 0 && !tooMany;

  if (!day) {
    return (
      <p className="text-lg text-ink-soft">{c("noDates")}</p>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div>
        {/* ── Kalendář sezóny ─────────────────────────────────────────── */}
        <fieldset>
          <legend className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">
            {t("chooseDay")}
          </legend>
          <ul className="mt-4 flex flex-wrap gap-2">
            {days.map((d, i) => {
              const f = fmtDay(d.date);
              const free = d.slots.reduce((a, s) => a + (s.capacity - s.reserved), 0);
              const full = free <= 0;
              const on = i === dayIdx;
              return (
                <li key={d.date}>
                  <button
                    type="button"
                    disabled={full}
                    onClick={() => { setDayIdx(i); setSlotId(null); }}
                    aria-pressed={on}
                    className={`flex w-14 flex-col items-center rounded-sm border-2 px-1 py-1.5 transition-colors ${
                      on
                        ? "border-ink bg-ink text-paper"
                        : full
                          ? "cursor-not-allowed border-ink/10 text-ink-faint/50 line-through"
                          : "border-ink/15 text-ink hover:border-pumpkin"
                    }`}
                  >
                    <span className="text-[0.66rem] uppercase tracking-wider opacity-70">{f.wd}</span>
                    <span className="tabular text-[1.05rem] font-medium leading-tight">{f.num}</span>
                    <span className="text-[0.6rem] opacity-60">{f.monthShort}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {/* ── Časové sloty ────────────────────────────────────────────── */}
        <fieldset className="mt-12">
          <legend className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">
            {t("chooseTime")}
          </legend>
          <p className="mt-2 text-[0.9rem] text-ink-soft">{c("slotsLead")}</p>

          <ul className="mt-5 divide-y divide-ink/12 border-y border-ink/12">
            {day.slots.map((s) => {
              const free = s.capacity - s.reserved;
              const on = s.id === slotId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={free <= 0}
                    onClick={() => setSlotId(s.id)}
                    aria-pressed={on}
                    className={`grid w-full grid-cols-[5.5rem_1fr_auto] items-center gap-4 py-4 text-left transition-colors ${
                      free <= 0 ? "cursor-not-allowed opacity-45" : "hover:bg-paper-deep/50"
                    }`}
                  >
                    <span className={`tabular text-lg ${on ? "text-pumpkin" : "text-ink"}`}>
                      {hhmm(s.startsAt)}
                    </span>
                    <CapacityMeter remaining={free} capacity={s.capacity} locale={locale} className="max-w-56" />
                    <span
                      className={`rounded-full border-2 px-4 py-1.5 text-[0.86rem] ${
                        on ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink-soft"
                      }`}
                    >
                      {on ? c("selected") : free <= 0 ? c("slotFull") : c("select")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </div>

      {/* ── Souhrn ─────────────────────────────────────────────────────
          Lepí se při scrollu, aby cena byla vidět pořád. */}
      <aside className="lg:sticky lg:top-6">
        <div className="border-2 border-ink/15 bg-paper-bright p-6">
          <h2 className="font-display text-2xl font-semibold">{c("basketTitle")}</h2>

          <ul className="mt-5 space-y-4">
            {TICKET_TYPES.map((tt) => (
              <li key={tt.code} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.98rem]">{tt.name[locale]}</p>
                  <p className="tabular text-[0.8rem] text-ink-faint">
                    {tt.price === 0 ? c("free") : `${tt.price} ${t("currency")}`}
                    {tt.note[locale] && ` · ${tt.note[locale]}`}
                  </p>
                </div>
                <Stepper
                  label={tt.name[locale]}
                  minusLabel={c("stepperMinus")}
                  plusLabel={c("stepperPlus")}
                  value={qty[tt.code]}
                  onChange={(v) => setQty((q) => ({ ...q, [tt.code]: v }))}
                />
              </li>
            ))}
          </ul>

          <hr className="rule-hand my-5" />

          <div className="flex items-baseline justify-between">
            <span className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">{t("total")}</span>
            <span className="tabular text-2xl font-medium">{total} {t("currency")}</span>
          </div>

          {slot && (
            <p className="tabular mt-3 text-[0.86rem] text-ink-soft">
              {fmtDay(day.date).num}. {fmtDay(day.date).month} · {hhmm(slot.startsAt)}
            </p>
          )}

          {tooMany && (
            <p role="alert" className="mt-3 text-[0.88rem] text-ember">
              {c("tooMany").replace("{n}", String(remaining))}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 w-full rounded-full bg-ink px-6 py-3.5 text-paper transition-colors enabled:hover:bg-ember disabled:cursor-not-allowed disabled:opacity-35"
          >
            {!slot ? c("pickTimeFirst") : counted === 0 ? c("addTicket") : c("continueToPayment")}
          </button>

          <p className="mt-4 text-[0.8rem] leading-relaxed text-ink-faint">{c("paymentNote")}</p>
        </div>
      </aside>
    </div>
  );
}

function Stepper({
  label, minusLabel, plusLabel, value, onChange,
}: {
  label: string;
  minusLabel: string;
  plusLabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <StepBtn onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`${label}: ${minusLabel}`}>–</StepBtn>
      <span className="tabular w-7 text-center text-[1.02rem]">{value}</span>
      <StepBtn onClick={() => onChange(Math.min(30, value + 1))} aria-label={`${label}: ${plusLabel}`}>+</StepBtn>
    </div>
  );
}

function StepBtn(props: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      className="grid size-8 place-items-center rounded-full border-2 border-ink/20 text-lg leading-none text-ink transition-colors enabled:hover:border-pumpkin enabled:hover:text-pumpkin disabled:opacity-30"
    />
  );
}
