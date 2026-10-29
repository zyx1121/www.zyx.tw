import og from "@/lib/og.json"

// Picked per request, so it must never be cached.
export const dynamic = "force-dynamic"

/**
 * The share card: a redirect to one of the recorded GIFs in public/og/
 * (scripts/og-image.py), at random, so the card differs from fetch to fetch.
 */
export function GET(request: Request) {
  const index = Math.floor(Math.random() * og.count)
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(`/og/${index}.gif`, request.url).toString(),
      "Cache-Control": "no-store",
    },
  })
}
