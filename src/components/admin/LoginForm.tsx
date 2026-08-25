"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/app/(admin)/admin/actions";
import { Button, Field, INPUT_CLASS, Notice } from "./ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-10 w-full">
      {pending ? "Přihlašuji…" : "Přihlásit se"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-10 space-y-8">
      <Field label="E-mail" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Heslo" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={INPUT_CLASS}
        />
      </Field>

      {state.error && <Notice tone="bad">{state.error}</Notice>}

      <Submit />
    </form>
  );
}
