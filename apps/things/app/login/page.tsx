import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/login-form"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect("/")

  return (
    <main className="flex h-dvh items-center justify-center px-6">
      <LoginForm />
    </main>
  )
}
