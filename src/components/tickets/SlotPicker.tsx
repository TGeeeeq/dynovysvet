"use client";

import { useEffect, useMemo, useState } from "react";
import { CapacityMeter } from "./CapacityMeter";
import { TICKET_TYPES, type TicketTypeCode } from "@/lib/tickets/schedule";

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

const DAY_SHORT = ["ne", "po", "út", "st", "čt", "pá", "so"];
const MONTHS = ["ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince"];

function fmtDay(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  return { wd: DAY_SHORT[d.getUTCDay()], num: d.getUTCDate(), month: MONTHS[d.getUTCMonth()] };
}
const hhmm = (iso: string) => iso.slice(11, 16);

export function SlotPicker({ days: initialDays }: { days: DayView[] }) {
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
    () => TICKET_TYPES.filter((t) => t.countsToCapacity).reduce((a, t) => a + qty[t.code], 0),
    [qty],
  );
  const total = useMemo(
    () => TICKET_TYPES.reduce((a, t) => a + qty[t.code] * t.price, 0),
    [qty],
  );
  const remaining = slot ? slot.capacity - slot.reserved : 0;
  const tooMany = Boolean(slot) && counted > remaining;
  const canSubmit = Boolean(slot) && counted > 0 && !tooMany;

  if (!day) {
    return (
      <p className="text-lg text-ink-soft">
        Termíny pro nadcházející sezónu ještě nejsou vypsané. Nechte nám e-mail
        a dáme vám vědět, jakmile se prodej otevře.
      </p>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div>
        {/* ── Kalendář sezóny ─────────────────────────────────────────── */}
        <fieldset>
          <legend className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">
            Vyberte den
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
                    <span className="text-[0.6rem] opacity-60">{f.month.slice(0, 3)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {/* ── Časové sloty ────────────────────────────────────────────── */}
        <fieldset className="mt-12">
          <legend className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">
            Vyberte čas příchodu
          </legend>
          <p className="mt-2 text-[0.9rem] text-ink-soft">
            Vstup je na konkrétní hodinu, ať se na statku nesejde víc lidí, než unese.
            Uvnitř pak můžete zůstat, jak dlouho chcete.
          </p>

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
                    <CapacityMeter remaining={free} capacity={s.capacity} className="max-w-56" />
                    <span
                      className={`rounded-full border-2 px-4 py-1.5 text-[0.86rem] ${
                        on ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink-soft"
                      }`}
                    >
                      {on ? "Vybráno" : free <= 0 ? "Plno" : "Vybrat"}
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
          <h2 className="font-display text-2xl font-semibold">Vstupenky</h2>

          <ul className="mt-5 space-y-4">
            {TICKET_TYPES.map((t) => (
              <li key={t.code} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.98rem]">{t.name}</p>
                  <p className="tabular text-[0.8rem] text-ink-faint">
                    {t.price === 0 ? "zdarma" : `${t.price} Kč`}
                    {t.note && ` · ${t.note}`}
                  </p>
                </div>
                <Stepper
                  label={t.name}
                  value={qty[t.code]}
                  onChange={(v) => setQty((q) => ({ ...q, [t.code]: v }))}
                />
              </li>
            ))}
          </ul>

          <hr className="rule-hand my-5" />

          <div className="flex items-baseline justify-between">
            <span className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">Celkem</span>
            <span className="tabular text-2xl font-medium">{total} Kč</span>
          </div>

          {slot && (
            <p className="tabular mt-3 text-[0.86rem] text-ink-soft">
              {fmtDay(day.date).num}. {fmtDay(day.date).month} · {hhmm(slot.startsAt)}
            </p>
          )}

          {tooMany && (
            <p role="alert" className="mt-3 text-[0.88rem] text-ember">
              V tomto čase už zbývá jen {remaining} míst. Zkuste jiný čas nebo snižte počet.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-5 w-full rounded-full bg-ink px-6 py-3.5 text-paper transition-colors enabled:hover:bg-ember disabled:cursor-not-allowed disabled:opacity-35"
          >
            {!slot ? "Nejdřív vyberte čas" : counted === 0 ? "Přidejte vstupenku" : "Pokračovat k platbě"}
          </button>

          <p className="mt-4 text-[0.8rem] leading-relaxed text-ink-faint">
            Platí se kartou online. Vstupenku dostanete e-mailem jako QR kód —
            stačí ho u vstupu ukázat v telefonu. Místo vám držíme 15 minut.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Stepper({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <StepBtn onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`${label}: ubrat`}>–</StepBtn>
      <span className="tabular w-7 text-center text-[1.02rem]">{value}</span>
      <StepBtn onClick={() => onChange(Math.min(30, value + 1))} aria-label={`${label}: přidat`}>+</StepBtn>
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
