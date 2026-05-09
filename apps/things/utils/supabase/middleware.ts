import { createServerClient, type CookieMethodsServer } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const createClient = async (
  request: NextRequest
): Promise<NextResponse> => {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })
  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) =>
        request.cookies.set(name, value)
      )
      supabaseResponse = NextResponse.next({ request })
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options)
      )
    },
  }
  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: cookieMethods,
  })

  // Critical: this call refreshes expired access tokens via the cookie
  // jar so server components downstream see a valid session. Skip when
  // env is absent (CI build) so middleware doesn't crash.
  if (supabaseUrl && supabaseKey) {
    await supabase.auth.getUser()
  }

  return supabaseResponse
}
