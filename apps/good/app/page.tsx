import type { Metadata } from "next"

import { Good } from "@/components/good"
import { SITE_DESC, SITE_NAME } from "@/lib/site"

// Canonical lives on the page rather than the root layout, so the 404 page
// does not point at the home.
export const metadata: Metadata = { alternates: { canonical: "/" } }

export default function Home() {
  return (
    <main className="h-dvh w-dvw">
      <h1 className="sr-only">{SITE_NAME}</h1>
      <p className="sr-only">{SITE_DESC}</p>
      <Good />
    </main>
  )
}
