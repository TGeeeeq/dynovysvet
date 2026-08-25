"use client";

import { useId, useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";

/**
 * Poptávkový formulář. Jeden komponent pro školy, pronájem, bleší trh
 * i obecný dotaz — liší se jen tím, která pole se zapnou.
 *
 * Vizuálně to není karta ani rámeček. Pole jsou linky pod textem, přesně
 * jako v papírovém formuláři: účaří, na které se píše. Orámované boxy by
 * z toho udělaly administrativní software.
 */

export type InquiryKind = "skola" | "pronajem" | "blesi_trh" | "obecny";

export interface InquiryFields {
  /** Telefon — u škol a pronájmu je to hlavní kanál. */
  phone?: boolean;
  /** Datum návštěvy nebo akce. */
  date?: { label: string; hint?: string };
  /** Jedna volba z několika. */
  radio?: { legend: string; options: readonly string[] };
  /** Více voleb najednou. */
  checkboxes?: { legend: string; options: readonly string[] };
  /** Volný text. */
  message?: { label: string; hint?: string };
}

type Status = "idle" | "pending" | "ok" | "error";

const LABEL = "block text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint";
const INPUT =
  "mt-2 block w-full border-0 border-b-2 border-ink/20 bg-transparent px-0 py-3 text-lg text-ink placeholder:text-ink-faint/60 transition-colors focus:border-pumpkin focus:outline-none focus:ring-0";

export function InquiryForm({
  kind,
  title,
  lead,
  plate,
  fields = {},
  submitLabel,
}: {
  kind: InquiryKind;
  title: string;
  lead?: string;
  /** Číslo tabule, aby formulář zapadl do číslování sekcí na stránce. */
  plate?: string;
  fields?: InquiryFields;
  submitLabel: string;
}) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const id = (name: string) => `${uid}-${name}`;
  const errorId = `${uid}-error`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Past na roboty. Člověk pole nevidí, robot ho vyplní.
    if (String(data.get("web") ?? "").trim() !== "") {
      setStatus("ok");
      return;
    }

    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    if (!name || !email) {
      setStatus("error");
      setError("Vyplňte prosím jméno a e-mail.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setStatus("error");
      setError("E-mail nevypadá správně. Zkontrolujte ho prosím.");
      return;
    }
    if (fields.radio && !data.get("choice")) {
      setStatus("error");
      setError("Vyberte prosím jednu z možností.");
      return;
    }

    setStatus("pending");
    setError(null);

    try {
      const response = await fetch("/api/poptavka", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name,
          email,
          phone: String(data.get("phone") ?? "").trim() || null,
          date: String(data.get("date") ?? "").trim() || null,
          choice: String(data.get("choice") ?? "").trim() || null,
          options: data.getAll("options").map(String),
          message: String(data.get("message") ?? "").trim() || null,
        }),
      });

      if (!response.ok) throw new Error(String(response.status));

      form.reset();
      setStatus("ok");
    } catch {
      setStatus("error");
      setError(
        "Odeslání se nepovedlo. Zkuste to prosím znovu, nebo nám zavolejte na 776 815 332.",
      );
    }
  }

  const pending = status === "pending";

  return (
    <section className="border-t-2 border-ink/12 bg-paper-deep/50">
      <div className="mx-auto max-w-[88rem] px-5 py-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          {plate ? (
            <SectionHead plate={plate} title={title} lead={lead} />
          ) : (
            <header className="max-w-2xl">
              <h2 className="font-display letterpress text-balance text-4xl font-semibold sm:text-5xl">
                {title}
              </h2>
              {lead && (
                <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-soft">
                  {lead}
                </p>
              )}
            </header>
          )}

          <form noValidate onSubmit={onSubmit} className="max-w-2xl">
            {/* Honeypot. Skrytý pro oči i pro čtečky, ale robot ho vidí. */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor={id("web")}>Nechte prázdné</label>
              <input
                id={id("web")}
                name="web"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              <div className={fields.phone ? undefined : "sm:col-span-2"}>
                <label htmlFor={id("name")} className={LABEL}>
                  Jméno a příjmení
                </label>
                <input
                  id={id("name")}
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  aria-describedby={error ? errorId : undefined}
                  className={INPUT}
                />
              </div>

              <div>
                <label htmlFor={id("email")} className={LABEL}>
                  E-mail
                </label>
                <input
                  id={id("email")}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-describedby={error ? errorId : undefined}
                  className={INPUT}
                />
              </div>

              {fields.phone && (
                <div>
                  <label htmlFor={id("phone")} className={LABEL}>
                    Telefon
                  </label>
                  <input
                    id={id("phone")}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className={`${INPUT} tabular`}
                  />
                </div>
              )}

              {fields.date && (
                <div>
                  <label htmlFor={id("date")} className={LABEL}>
                    {fields.date.label}
                  </label>
                  <input
                    id={id("date")}
                    name="date"
                    type="date"
                    aria-describedby={fields.date.hint ? id("date-hint") : undefined}
                    className={`${INPUT} tabular`}
                  />
                  {fields.date.hint && (
                    <p id={id("date-hint")} className="mt-2 text-[0.86rem] text-ink-faint">
                      {fields.date.hint}
                    </p>
                  )}
                </div>
              )}
            </div>

            {fields.radio && (
              <fieldset className="mt-12">
                <legend className={LABEL}>{fields.radio.legend}</legend>
                <hr className="rule-hand mb-5 mt-3" />
                <ul className="space-y-3">
                  {fields.radio.options.map((option, i) => (
                    <li key={option}>
                      <label
                        htmlFor={id(`choice-${i}`)}
                        className="flex cursor-pointer items-start gap-3 text-ink-soft transition-colors hover:text-ink"
                      >
                        <input
                          id={id(`choice-${i}`)}
                          name="choice"
                          type="radio"
                          value={option}
                          className="mt-1.5 size-4 shrink-0 accent-pumpkin"
                        />
                        <span className="text-pretty leading-relaxed">{option}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}

            {fields.checkboxes && (
              <fieldset className="mt-12">
                <legend className={LABEL}>{fields.checkboxes.legend}</legend>
                <hr className="rule-hand mb-5 mt-3" />
                <ul className="space-y-3">
                  {fields.checkboxes.options.map((option, i) => (
                    <li key={option}>
                      <label
                        htmlFor={id(`options-${i}`)}
                        className="flex cursor-pointer items-start gap-3 text-ink-soft transition-colors hover:text-ink"
                      >
                        <input
                          id={id(`options-${i}`)}
                          name="options"
                          type="checkbox"
                          value={option}
                          className="mt-1.5 size-4 shrink-0 accent-pumpkin"
                        />
                        <span className="text-pretty leading-relaxed">{option}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}

            {fields.message && (
              <div className="mt-12">
                <label htmlFor={id("message")} className={LABEL}>
                  {fields.message.label}
                </label>
                <textarea
                  id={id("message")}
                  name="message"
                  rows={5}
                  aria-describedby={
                    fields.message.hint ? id("message-hint") : undefined
                  }
                  className={`${INPUT} resize-y leading-relaxed`}
                />
                {fields.message.hint && (
                  <p id={id("message-hint")} className="mt-2 text-[0.86rem] text-ink-faint">
                    {fields.message.hint}
                  </p>
                )}
              </div>
            )}

            <div className="mt-12 flex flex-wrap items-center gap-6">
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-ink px-7 py-3.5 text-paper transition-colors hover:bg-ember disabled:cursor-progress disabled:opacity-60"
              >
                {pending ? "Odesílám…" : submitLabel}
              </button>
              <p className="max-w-xs text-[0.82rem] leading-relaxed text-ink-faint">
                Odesláním souhlasíte se zpracováním údajů podle{" "}
                <a
                  href="/ochrana-soukromi"
                  className="border-b border-pumpkin/50 text-pumpkin transition-colors hover:border-pumpkin"
                >
                  pravidel ochrany soukromí
                </a>
                .
              </p>
            </div>

            {/* Výsledek. `aria-live` ho přečte i tomu, kdo na tlačítko nevidí. */}
            <p
              id={errorId}
              aria-live="polite"
              className={`mt-6 text-pretty leading-relaxed ${
                status === "error" ? "text-ember" : "text-moss"
              }`}
            >
              {status === "ok" &&
                "Děkujeme, máme to. Ozveme se vám e-mailem nebo telefonem."}
              {status === "error" && error}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
