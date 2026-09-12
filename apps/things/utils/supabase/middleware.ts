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

  // No env (CI build, or a deployment whose env was never set): let the
  // request through unauthenticated. createServerClient itself throws when
  // the URL or key is missing, so this check has to come before it, not
  // around the getUser() call below. With the old order every request,
  // /robots.txt included, was a 500 (MIDDLEWARE_INVOCATION_FAILED on Vercel).
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

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

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: cookieMethods,
  })

  // Critical: this call refreshes expired access tokens via the cookie
  // jar so server components downstream see a valid session.
  // supabase-js rethrows non-auth failures (an unreachable host is a plain
  // fetch TypeError), which would take the whole site down with it. Treat
  // that as "no session for this request" and let the page render.
  try {
    await supabase.auth.getUser()
  } catch (error) {
    console.error("[proxy] supabase.auth.getUser failed:", error)
  }

  return supabaseResponse
}
