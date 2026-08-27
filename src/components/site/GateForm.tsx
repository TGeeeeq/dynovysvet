"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { unlock, type GateState } from "@/app/(gate)/vstup/actions";
import { RETURN_PARAM } from "@/lib/security/site-gate";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-[0.98rem] text-paper transition-colors enabled:hover:bg-ember disabled:cursor-not-allowed disabled:opacity-45"
    >
      {pending ? "Ověřuji…" : "Vstoupit"}
    </button>
  );
}

/** Formulář zámku. Jedno pole, jedno tlačítko — nic víc tu k dělání není. */
export function GateForm({ target }: { target: string }) {
  const [state, action] = useActionState<GateState, FormData>(unlock, {});

  return (
    <form action={action} className="mt-10">
      <input type="hidden" name={RETURN_PARAM} value={target} />

      <label
        htmlFor="heslo"
        className="block text-[0.72rem] uppercase tracking-[0.2em] text-ink-faint"
      >
        Heslo
      </label>
      <input
        id="heslo"
        name="heslo"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        className="mt-2 block w-full border-0 border-b-2 border-ink/20 bg-transparent px-0 py-2.5 text-[1.05rem] text-ink transition-colors focus:border-pumpkin focus:outline-none focus:ring-0"
      />

      {state.error && (
        <p role="status" className="mt-6 border-l-2 border-ember py-2.5 pl-4 text-[0.95rem] text-ember">
          {state.error}
        </p>
      )}

      <Submit />
    </form>
  );
}
