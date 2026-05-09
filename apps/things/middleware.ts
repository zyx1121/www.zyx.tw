import { type NextRequest } from "next/server"

import { createClient } from "@/utils/supabase/middleware"

export async function middleware(request: NextRequest) {
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
