"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  changeName,
  changePassword,
  revokeOtherDevices,
  type AccountState,
} from "@/app/(admin)/admin/(panel)/ucet/actions";
import { Button, Field, INPUT_CLASS, Notice } from "./ui";

/**
 * Formuláře na stránce „Můj účet".
 *
 * Klientské jsou jen kvůli hlášce o chybě a stavu „ukládám" — po úspěchu se
 * akce přesměruje, takže si tu nedržíme žádný stav navíc. Do hlášek se nikdy
 * nedostane heslo: chyby mluví o tom, co je špatně, ne o tom, co bylo zadáno.
 */

function Submit({
  label,
  busy,
  variant,
  disabled,
}: {
  label: string;
  busy: string;
  variant?: "primary" | "quiet" | "danger";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending || disabled}>
      {pending ? busy : label}
    </Button>
  );
}

/* ------------------------------------------------------------------ jméno */

export function AccountNameForm({ jmeno }: { jmeno: string }) {
  const [state, action] = useActionState<AccountState, FormData>(changeName, {});

  return (
    <form action={action} className="mt-5 max-w-md space-y-6">
      <Field label="Jméno" htmlFor="jmeno" hint="Takhle vás uvidí ostatní v záznamu změn.">
        <input
          id="jmeno"
          name="jmeno"
          type="text"
          defaultValue={jmeno}
          required
          maxLength={120}
          autoComplete="name"
          className={INPUT_CLASS}
        />
      </Field>

      {state.error && <Notice tone="bad">{state.error}</Notice>}

      <Submit label="Uložit jméno" busy="Ukládám…" />
    </form>
  );
}

/* ------------------------------------------------------------------ heslo */

export function AccountPasswordForm({ email }: { email: string }) {
  const [state, action] = useActionState<AccountState, FormData>(changePassword, {});

  return (
    <form action={action} className="mt-5 max-w-md space-y-6">
      {/* Skryté pole s e-mailem není k ničemu nám, ale správcům hesel
          v prohlížeči — bez něj nabízejí uložení hesla k cizímu účtu.
          Na server se neposílá, akce si uživatele bere ze session. */}
      <input type="text" name="ucet" value={email} readOnly hidden autoComplete="username" />

      <Field label="Současné heslo" htmlFor="soucasne">
        <input
          id="soucasne"
          name="soucasne"
          type="password"
          required
          autoComplete="current-password"
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Nové heslo" htmlFor="nove">
        <input
          id="nove"
          name="nove"
          type="password"
          required
          autoComplete="new-password"
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Nové heslo ještě jednou" htmlFor="potvrzeni">
        <input
          id="potvrzeni"
          name="potvrzeni"
          type="password"
          required
          autoComplete="new-password"
          className={INPUT_CLASS}
        />
      </Field>

      {state.error && <Notice tone="bad">{state.error}</Notice>}

      <Submit label="Změnit heslo" busy="Měním heslo…" />
    </form>
  );
}

/* -------------------------------------------------------------- zařízení */

export function AccountRevokeOthers({ ostatnich }: { ostatnich: number }) {
  const [state, action] = useActionState<AccountState, FormData>(revokeOtherDevices, {});

  return (
    <form action={action} className="mt-6 space-y-4">
      {state.error && <Notice tone="bad">{state.error}</Notice>}
      <Submit
        label="Odhlásit všechna ostatní zařízení"
        busy="Odhlašuji…"
        variant="danger"
        disabled={ostatnich === 0}
      />
    </form>
  );
}
