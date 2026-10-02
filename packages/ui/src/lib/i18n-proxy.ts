import { NextResponse, type NextRequest } from "next/server"
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isLocale,
  cookieDomain,
  resolveLocale,
} from "./i18n"

/** Resolve only supported values, overriding any client-supplied locale header. */
export function localeProxy(request: NextRequest) {
  const explicit = request.nextUrl.searchParams.get("lang")
  const locale = resolveLocale(
    explicit,
    request.cookies.get(LOCALE_COOKIE)?.value
  )
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(LOCALE_HEADER, locale)
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  if (isLocale(explicit)) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      domain: cookieDomain(request.nextUrl.hostname),
    })
  }
  response.headers.set("Content-Language", locale)
  return response
}
