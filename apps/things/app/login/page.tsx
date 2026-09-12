import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/login-form"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

async function currentUser() {
  // Same guard as app/page.tsx: without env there is no session to check,
  // and createClient would throw before getUser() ever runs.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export default async function LoginPage() {
  const user = await currentUser()
  if (user) redirect("/")

  return (
    <main className="flex h-dvh items-center justify-center px-6">
      <LoginForm />
    </main>
  )
}
