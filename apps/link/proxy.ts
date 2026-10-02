export { localeProxy as proxy } from "@workspace/ui/lib/i18n-proxy"

export const config = {
  matcher: [
    "/((?!api/|_next/|favicon.ico|opengraph-image|r/|env/|fonts/|previews/|made/identities/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|woff2|glb)$).*)",
  ],
}
