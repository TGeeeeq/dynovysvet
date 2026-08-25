"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveNews, type NewsFormState } from "@/app/(admin)/admin/(panel)/aktuality/actions";
import { Button, Field, Hint, INPUT_CLASS, LABEL_CLASS, Notice, SectionTitle } from "./ui";

/**
 * Formulář jedné aktuality.
 *
 * Dvě věci, které stojí za vysvětlení:
 *
 * 1. **Adresa se dopisuje sama, ale jen u nové aktuality.** U už zveřejněné
 *    by se změnou nadpisu tiše rozbil odkaz, který si někdo uložil nebo poslal
 *    dál. Přepsat ji ručně jde vždycky.
 *
 * 2. **Diakritiku odstraňuje i prohlížeč.** Je to jen náhled — server si
 *    adresu stejně přepíše sám, hodnotě z formuláře se nevěří.
 *
 * 🔴 Text je prostý text. Nic z aktuality se nevykresluje jako HTML.
 */

export type NewsFormValues = {
  id: string;
  slug: string;
  titleCs: string;
  titleEn: string;
  titleDe: string;
  bodyCs: string;
  bodyEn: string;
  bodyDe: string;
  /** Pražský čas ve tvaru `2026-09-20T10:00`, nebo prázdno. */
  publishedAt: string;
  /** Pražské datum ve tvaru `2026-09-20`, nebo prázdno. */
  pinnedUntil: string;
  imagePath: string;
};

export function NewsForm({ values }: { values: NewsFormValues }) {
  const [state, action] = useActionState<NewsFormState, FormData>(saveNews, {});
  const isNew = values.id === "";

  const [titleCs, setTitleCs] = useState(values.titleCs);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  const onTitle = (value: string) => {
    setTitleCs(value);
    if (isNew && !slugTouched) setSlug(slugPreview(value));
  };

  return (
    <form action={action} className="space-y-12">
      <input type="hidden" name="id" value={values.id} />

      {state.error && <Notice tone="bad">{state.error}</Notice>}
      {state.ok && <Notice>Aktualita je uložená.</Notice>}

      <section className="space-y-8">
        <SectionTitle>Česky</SectionTitle>

        <Field label="Nadpis" htmlFor="titleCs">
          <input
            id="titleCs"
            name="titleCs"
            type="text"
            required
            maxLength={200}
            value={titleCs}
            onChange={(e) => onTitle(e.target.value)}
            className={INPUT_CLASS}
          />
        </Field>

        <Field
          label="Adresa na webu"
          htmlFor="slug"
          hint={
            isNew
              ? "Doplní se sama z nadpisu. Malá písmena bez diakritiky, slova oddělená pomlčkou. Musí být jiná než u ostatních aktualit."
              : "Adresu měňte jen když musíte — starý odkaz na aktualitu přestane fungovat."
          }
        >
          <input
            id="slug"
            name="slug"
            type="text"
            required
            maxLength={80}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="Text" htmlFor="bodyCs" hint="Prostý text. Odstavce oddělte prázdným řádkem.">
          <textarea
            id="bodyCs"
            name="bodyCs"
            required
            rows={10}
            maxLength={20000}
            defaultValue={values.bodyCs}
            className={`${INPUT_CLASS} resize-y leading-relaxed`}
          />
        </Field>
      </section>

      <section className="space-y-8">
        <SectionTitle>Překlady</SectionTitle>
        <Hint>
          Nechte klidně prázdné. Anglická i německá verze webu pak u téhle aktuality ukáže české
          znění — prázdné pole nikdy neznamená prázdné místo na webu.
        </Hint>

        <Translation
          lang="Anglicky"
          titleName="titleEn"
          bodyName="bodyEn"
          title={values.titleEn}
          body={values.bodyEn}
        />
        <Translation
          lang="Německy"
          titleName="titleDe"
          bodyName="bodyDe"
          title={values.titleDe}
          body={values.bodyDe}
        />
      </section>

      <section className="space-y-8">
        <SectionTitle>Kdy a jak se ukáže</SectionTitle>

        <div className="grid gap-8 sm:grid-cols-2">
          <Field
            label="Zveřejnit od"
            htmlFor="publishedAt"
            hint="Prázdné pole znamená koncept — aktualita zůstane jen tady v administraci. Čas v budoucnu se zveřejní sám."
          >
            <input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={values.publishedAt}
              className={INPUT_CLASS}
            />
          </Field>

          <Field
            label="Držet nahoře do"
            htmlFor="pinnedUntil"
            hint="Nepovinné. Do konce zvoleného dne bude aktualita stát nad ostatními."
          >
            <input
              id="pinnedUntil"
              name="pinnedUntil"
              type="date"
              defaultValue={values.pinnedUntil}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field
          label="Obrázek"
          htmlFor="imagePath"
          hint="Zatím jen cesta k souboru, který na webu už je, například /foto/statek/stodola.jpg. Nahrávání obrázků přímo odsud přidáme později."
        >
          <input
            id="imagePath"
            name="imagePath"
            type="text"
            maxLength={300}
            placeholder="/foto/…"
            defaultValue={values.imagePath}
            className={INPUT_CLASS}
          />
        </Field>
      </section>

      <div className="flex justify-end border-t-2 border-ink/15 pt-6">
        <Submit isNew={isNew} />
      </div>
    </form>
  );
}

/** Jeden cizí jazyk. Schovaný v `<details>`, ať formulář nezabírá tři obrazovky. */
function Translation({
  lang,
  titleName,
  bodyName,
  title,
  body,
}: {
  lang: string;
  titleName: string;
  bodyName: string;
  title: string;
  body: string;
}) {
  // Vyplněný překlad je vidět rovnou; prázdný se schová, ať formulář nezabírá
  // tři obrazovky jen kvůli polím, která majitel většinou nechá být.
  const [open, setOpen] = useState(title.length > 0 || body.length > 0);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="border-t border-ink/12 pt-4"
    >
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4">
        <span className={LABEL_CLASS}>{lang}</span>
        <span className="text-[0.8rem] text-ink-faint">{open ? "skrýt" : "vyplnit"}</span>
      </summary>

      <div className="space-y-8 pt-6">
        <Field label="Nadpis" htmlFor={titleName}>
          <input
            id={titleName}
            name={titleName}
            type="text"
            maxLength={200}
            defaultValue={title}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Text" htmlFor={bodyName}>
          <textarea
            id={bodyName}
            name={bodyName}
            rows={8}
            maxLength={20000}
            defaultValue={body}
            className={`${INPUT_CLASS} resize-y leading-relaxed`}
          />
        </Field>
      </div>
    </details>
  );
}

function Submit({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Ukládám…" : isNew ? "Založit aktualitu" : "Uložit změny"}
    </Button>
  );
}

/**
 * Náhled adresy z nadpisu. Stejné pravidlo jako `slugify` na serveru, jen tady
 * je to pohodlí — o výsledku rozhoduje vždycky server.
 */
function slugPreview(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}
