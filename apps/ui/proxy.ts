import { type NextRequest } from "next/server";
import { localeProxy } from "@workspace/ui/lib/i18n-proxy";
export function proxy(request: NextRequest) {
  const response = localeProxy(request);
  if (request.nextUrl.pathname === "/") {
    response.headers.set(
      "Link",
      `</llms.txt>; rel="describedby", </index.md?lang=${response.headers.get("Content-Language")}>; rel="alternate"; type="text/markdown"`
    );
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api/|_next/|favicon.ico|opengraph-image|r/|env/|fonts/|previews/|made/identities/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|woff2|glb)$).*)",
  ],
};
