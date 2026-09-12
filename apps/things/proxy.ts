import { type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

// Next 16 file convention (was middleware.ts). Same matcher, same session
// refresh; runs on the Node.js runtime like apps/1909/proxy.ts.
export async function proxy(request: NextRequest) {
  return createClient(request)
}

export const config = {
  matcher: [
    /*
     * Run on every path except static assets, image optimization, favicons.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
