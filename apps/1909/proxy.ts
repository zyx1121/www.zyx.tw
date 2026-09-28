import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"

// Only checks that a session cookie exists; pages and actions verify the
// session itself through requireMember().
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic =
    pathname === "/robots.txt" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth")

  if (!isPublic && !getSessionCookie(request)) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
