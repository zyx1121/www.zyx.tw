"use client"

import { useActionState } from "react"

import { login, type LoginState } from "@/app/login/actions"

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:outline-none"

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    null
  )

  return (
    <form action={action} className="w-full max-w-sm space-y-3">
      <input
        name="email"
        type="email"
        placeholder="mail@zyx.tw"
        autoComplete="email"
        required
        className={inputClass}
      />
      <input
        name="password"
        type="password"
        placeholder="password"
        autoComplete="current-password"
        required
        className={inputClass}
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg border border-border bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "signing in…" : "sign in"}
      </button>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  )
}
