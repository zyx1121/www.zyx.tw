"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin() {
    const supabase = createClient()
    setIsLoading(true)

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-lg font-medium">1909</h1>
      <Button variant="outline" disabled={isLoading} onClick={handleLogin}>
        {isLoading ? "登入中..." : "Sign in with Google"}
      </Button>
    </div>
  )
}
