import { createServerClient, type CookieMethodsServer } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const createClient = (
  cookieStore: Awaited<ReturnType<typeof cookies>>
): SupabaseClient => {
  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      } catch {
        // Server Component — middleware refreshes user sessions instead.
      }
    },
  }
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: cookieMethods,
  })
}
