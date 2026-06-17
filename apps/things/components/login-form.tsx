"use client"

import { useActionState } from "react"

import { Button } from "@workspace/ui/components/ui/button"
import { Input } from "@workspace/ui/components/ui/input"

import { login, type LoginState } from "@/app/login/actions"

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    null
  )

  return (
    <form action={action} className="w-full max-w-sm space-y-3">
      <Input
        name="email"
        type="email"
        placeholder="mail@zyx.tw"
        autoComplete="email"
        required
      />
      <Input
        name="password"
        type="password"
        placeholder="password"
        autoComplete="current-password"
        required
      />
      <Button type="submit" loading={pending} className="w-full">
        {pending ? "signing in…" : "sign in"}
      </Button>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  )
}
