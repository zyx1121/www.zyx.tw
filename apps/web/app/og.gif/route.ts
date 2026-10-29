import og from "@/lib/og.json"
import { SITE_URL } from "@/lib/site"

// Picked per request, so it must never be cached.
export const dynamic = "force-dynamic"

/**
 * The share card: a redirect to one of the recorded GIFs in public/og/
 * (scripts/og-image.py), at random, so the card differs from fetch to fetch.
 * The address is built from the site URL: behind the proxy, request.url is
 * the container's own address.
 */
export function GET() {
  const index = Math.floor(Math.random() * og.count)
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(`/og/${index}.gif`, SITE_URL).toString(),
      "Cache-Control": "no-store",
    },
  })
}
