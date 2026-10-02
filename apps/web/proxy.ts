import { type NextRequest } from "next/server"
import { localeProxy } from "@workspace/ui/lib/i18n-proxy"
import { localeUrl, resolveLocale } from "@workspace/ui/lib/i18n"
import site from "./lib/site.json"

export function proxy(request: NextRequest) {
  const response = localeProxy(request)
  const locale = resolveLocale(response.headers.get("Content-Language"))
  const page = site.pages.find(
    (page) =>
      page.path === request.nextUrl.pathname ||
      page.markdown === request.nextUrl.pathname
  )
  if (page) {
    response.headers.set("Vary", "Accept, Cookie")
    response.headers.set(
      "Link",
      request.nextUrl.pathname.endsWith(".md")
        ? `<${site.url}${locale === "en" ? localeUrl(page.path, locale) : page.path}>; rel="canonical"`
        : `<${site.url}/llms.txt>; rel="describedby", <${site.url}${localeUrl(page.markdown, locale)}>; rel="alternate"; type="text/markdown"`
    )
  }
  return response
}

export const config = {
  matcher: [
    "/((?!api/|_next/|favicon.ico|opengraph-image|r/|env/|fonts/|previews/|made/identities/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|woff2|glb)$).*)",
  ],
}
