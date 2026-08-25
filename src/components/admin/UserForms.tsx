"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  createUser,
  manageUser,
  type UsersState,
} from "@/app/(admin)/admin/(panel)/uzivatele/actions";
import { Button, Field, INPUT_CLASS, LABEL_CLASS, Notice } from "./ui";

/**
 * Formuláře stránky „Kdo má přístup".
 *
 * Klientské jsou kvůli jediné věci: vygenerované počáteční heslo se vrací
 * z akce do stavu formuláře a vykreslí se právě jednou. Do adresy ani do
 * databáze se v čitelné podobě nedostane, takže po přenačtení stránky je
 * pryč — a to je záměr.
 */

const SELECT_CLASS = `${INPUT_CLASS} appearance-none`;

/** Počáteční heslo. Rámeček je nápadný schválně — je to jediná šance si ho opsat. */
function PasswordBox({ email, hodnota }: { email: string; hodnota: string }) {
  return (
    <div className="mt-5 border-2 border-pumpkin px-5 py-4">
      <p className="text-[0.72rem] uppercase tracking-[0.2em] text-ink-faint">
        Počáteční heslo pro {email}
      </p>
      <p className="tabular mt-2 select-all break-all text-[1.5rem] leading-tight">{hodnota}</p>
      <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-soft">
        Zapište si ho, znovu se nezobrazí — předejte ho osobně nebo telefonem, ne e-mailem.
        Při prvním přihlášení si ho ten člověk musí změnit.
      </p>
    </div>
  );
}

/* ------------------------------------------------------- nový přístup */

function CreateSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Zakládám…" : "Založit přístup"}
    </Button>
  );
}

export function UserCreateForm() {
  const [state, action] = useActionState<UsersState, FormData>(createUser, {});

  return (
    <div className="max-w-md">
      <form action={action} className="mt-5 space-y-6">
        <Field label="Jméno" htmlFor="jmeno">
          <input
            id="jmeno"
            name="jmeno"
            type="text"
            required
            maxLength={120}
            autoComplete="off"
            className={INPUT_CLASS}
          />
        </Field>

        <Field
          label="E-mail"
          htmlFor="email"
          hint="Tímhle e-mailem se bude přihlašovat. Heslo mu na něj neposíláme."
        >
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="off"
            className={INPUT_CLASS}
          />
        </Field>

        <div>
          <label htmlFor="role" className={LABEL_CLASS}>
            Role
          </label>
          <select id="role" name="role" defaultValue="obsluha" className={SELECT_CLASS}>
            <option value="obsluha">obsluha — objednávky, poptávky, brána</option>
            <option value="majitel">majitel — všechno včetně cen a přístupů</option>
          </select>
        </div>

        {state.error && <Notice tone="bad">{state.error}</Notice>}
        {state.message && !state.heslo && <Notice>{state.message}</Notice>}

        <CreateSubmit />
      </form>

      {state.heslo && (
        <>
          {state.message && <p className="mt-6 text-[0.95rem] text-moss">{state.message}</p>}
          <PasswordBox email={state.heslo.email} hodnota={state.heslo.hodnota} />
        </>
      )}
    </div>
  );
}

/* --------------------------------------------------- úkony u jednoho řádku */

/**
 * Tlačítko v řádku tabulky. Není to `Button` z `ui.tsx` schválně: v hustém
 * sloupci by pět oválných tlačítek přebilo samotná data. Ve formuláři jich
 * stojí několik vedle sebe a `name`/`value` rozhodne, který úkon se provede.
 */
function RowButton({
  zamer,
  danger,
  children,
}: {
  zamer: string;
  danger?: boolean;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="zamer"
      value={zamer}
      disabled={pending}
      className={`whitespace-nowrap text-left text-[0.88rem] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-45 ${
        danger ? "text-ember" : "text-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}

export function UserRowActions({
  id,
  role,
  zablokovany,
  zamceny,
  jaSam,
}: {
  id: string;
  role: "majitel" | "obsluha";
  zablokovany: boolean;
  zamceny: boolean;
  jaSam: boolean;
}) {
  const [state, action] = useActionState<UsersState, FormData>(manageUser, {});

  return (
    <form action={action} className="min-w-[15rem] space-y-3">
      <input type="hidden" name="id" value={id} />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <RowButton zamer="heslo">Vygenerovat nové heslo</RowButton>

        {!jaSam &&
          (zablokovany ? (
            <RowButton zamer="odblokovat">Odblokovat</RowButton>
          ) : (
            <RowButton zamer="zablokovat" danger>
              Zablokovat
            </RowButton>
          ))}

        {zamceny && <RowButton zamer="odemknout">Odemknout</RowButton>}
      </div>

      {!jaSam && (
        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
          <label className="sr-only" htmlFor={`role-${id}`}>
            Role
          </label>
          <select
            id={`role-${id}`}
            name="role"
            defaultValue={role}
            className="w-40 appearance-none border-0 border-b-2 border-ink/20 bg-transparent px-0 py-1.5 text-[0.9rem] focus:border-pumpkin focus:outline-none"
          >
            <option value="obsluha">obsluha</option>
            <option value="majitel">majitel</option>
          </select>
          <RowButton zamer="role">Změnit roli</RowButton>
        </div>
      )}

      {jaSam && <p className="text-[0.84rem] text-ink-faint">To jste vy.</p>}

      {state.error && <p className="text-[0.88rem] text-ember">{state.error}</p>}
      {state.message && <p className="text-[0.88rem] text-moss">{state.message}</p>}
      {state.heslo && <PasswordBox email={state.heslo.email} hodnota={state.heslo.hodnota} />}
    </form>
  );
}
