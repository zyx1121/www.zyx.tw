"use client"

import { useState } from "react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin() {
    setIsLoading(true)

    await authClient.signIn.social({ provider: "google", callbackURL: "/" })
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl/8 font-medium">1909</h1>
      <Button variant="outline" disabled={isLoading} onClick={handleLogin}>
        {isLoading ? "登入中..." : "Sign in with Google"}
      </Button>
    </div>
  )
}
