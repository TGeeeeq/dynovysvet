"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveTexts, type SaveTextsState } from "@/app/(admin)/admin/(panel)/texty/actions";
import { Badge, Button, INPUT_CLASS, LABEL_CLASS, Notice, SectionTitle } from "./ui";

/**
 * Editor textů jedné stránky.
 *
 * Rozhodnutí, ze kterého plyne zbytek: **stav polí drží prohlížeč, „upraveno"
 * se počítá porovnáním s výchozím zněním, ne s tím, co je v databázi.** Odznak
 * i tlačítko „Vrátit původní text" tak reagují okamžitě při psaní a po uložení
 * sedí samy od sebe — blok vrácený na výchozí text se z databáze smaže a
 * odznak zmizí, aniž bychom museli cokoli přenačítat.
 *
 * 🔴 Do polí jde **prostý text**. Značky HTML server odmítne a nikde se nic
 * nevykresluje přes `dangerouslySetInnerHTML` — obsah píše člověk a jediné,
 * co ho na webu dělí od skriptu, je právě to, že se vykreslí jako text.
 */

export type EditorBlock = {
  key: string;
  label: string;
  multiline: boolean;
  /** Výchozí znění z kódu. */
  base: Trio;
  /** Co je teď na webu vidět — tedy odchylka z databáze, jinak výchozí znění. */
  current: Trio;
};

export type EditorGroup = { title: string; blocks: EditorBlock[] };

type Trio = { cs: string; en: string; de: string };
type Lang = keyof Trio;

const LANGS: { code: Lang; label: string }[] = [
  { code: "cs", label: "Česky" },
  { code: "en", label: "Anglicky" },
  { code: "de", label: "Německy" },
];

export function ContentEditor({ page, groups }: { page: string; groups: EditorGroup[] }) {
  const [state, action] = useActionState<SaveTextsState, FormData>(saveTexts, {});

  const [values, setValues] = useState<Record<string, Trio>>(() =>
    Object.fromEntries(groups.flatMap((g) => g.blocks.map((b) => [b.key, { ...b.current }]))),
  );

  const base = Object.fromEntries(groups.flatMap((g) => g.blocks.map((b) => [b.key, b.base])));

  /** Prázdné pole se ukládá jako „bez odchylky", takže se rovná výchozímu textu. */
  const changed = (key: string, lang: Lang): boolean => {
    const value = values[key]?.[lang] ?? "";
    return value.trim().length > 0 && value !== base[key][lang];
  };
  const blockChanged = (key: string): boolean => LANGS.some((l) => changed(key, l.code));
  const changedCount = (g: EditorGroup) => g.blocks.filter((b) => blockChanged(b.key)).length;

  const set = (key: string, lang: Lang, value: string) =>
    setValues((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: value } }));

  const reset = (key: string) => setValues((prev) => ({ ...prev, [key]: { ...base[key] } }));

  return (
    <form action={action} className="space-y-10">
      <input type="hidden" name="stranka" value={page} />

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/12 pb-5">
        <p className="text-[0.9rem] text-ink-soft">
          Česky je hlavní. Když necháte cizojazyčné pole prázdné, vrátí se do něj původní znění
          z webu.
        </p>
        <SaveButton />
      </div>

      {state.error && <Notice tone="bad">{state.error}</Notice>}
      {state.ok && (
        <Notice>
          {state.saved === 0 && state.deleted === 0
            ? "Nic se nezměnilo, ukládat nebylo co."
            : `Uloženo. Upravených textů: ${state.saved}. Vrácených na původní znění: ${state.deleted}.`}
        </Notice>
      )}

      {groups.map((group, i) => (
        <Group key={group.title} title={group.title} changed={changedCount(group)} first={i === 0}>
          <div className="space-y-12 pt-8">
            {group.blocks.map((block) => (
              <div key={block.key}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <p className="text-[1.02rem] leading-snug">{block.label}</p>
                  <div className="flex items-center gap-4">
                    {blockChanged(block.key) && (
                      <>
                        <Badge tone="warn">upraveno</Badge>
                        <button
                          type="button"
                          onClick={() => reset(block.key)}
                          className="text-[0.86rem] text-ink-soft underline-offset-4 hover:text-ember hover:underline"
                        >
                          Vrátit původní text
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-x-8 gap-y-6 lg:grid-cols-3">
                  {LANGS.map(({ code, label }) => {
                    const id = `${block.key}-${code}`;
                    const value = values[block.key]?.[code] ?? "";
                    return (
                      <div key={code} className={code === "cs" ? "lg:col-span-1" : undefined}>
                        <label htmlFor={id} className={LABEL_CLASS}>
                          {label}
                        </label>
                        {block.multiline ? (
                          <textarea
                            id={id}
                            name={`blok:${block.key}:${code}`}
                            value={value}
                            onChange={(e) => set(block.key, code, e.target.value)}
                            rows={rowsFor(base[block.key][code])}
                            className={`${INPUT_CLASS} resize-y leading-relaxed`}
                          />
                        ) : (
                          <input
                            id={id}
                            type="text"
                            name={`blok:${block.key}:${code}`}
                            value={value}
                            onChange={(e) => set(block.key, code, e.target.value)}
                            className={INPUT_CLASS}
                          />
                        )}
                        {/* Původní znění ukazujeme jen tam, kde se text liší —
                            jinak by pod každým polem stálo totéž dvakrát. */}
                        {changed(block.key, code) && (
                          <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-faint">
                            <span className="uppercase tracking-[0.16em]">Původně: </span>
                            {base[block.key][code]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Group>
      ))}

      <div className="flex justify-end border-t-2 border-ink/15 pt-6">
        <SaveButton />
      </div>
    </form>
  );
}

/**
 * Sekce stránky. Otevřenost si drží sama — kdyby ji řídil rodič, po každém
 * uložení by se všechny sekce zase rozbalily a majitel by hledal, kde skončil.
 */
function Group({
  title,
  changed,
  first,
  children,
}: {
  title: string;
  changed: number;
  first: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(first);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="border-t-2 border-ink/15 pt-4"
    >
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4">
        <SectionTitle>{title}</SectionTitle>
        <span className="text-[0.8rem] text-ink-faint">
          {changed > 0 ? `${changed}× upraveno` : open ? "skrýt" : "rozbalit"}
        </span>
      </summary>
      {children}
    </details>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Ukládám…" : "Uložit"}
    </Button>
  );
}

/** Výška textového pole podle délky výchozího textu, ať se nemusí rolovat. */
function rowsFor(text: string): number {
  return Math.min(9, Math.max(3, Math.ceil(text.length / 60)));
}
