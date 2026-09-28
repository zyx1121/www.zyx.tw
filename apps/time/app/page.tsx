import type { Metadata } from "next"

import { Clock } from "@/components/clock"

// Canonical lives on the page rather than the root layout, so the 404 page
// does not point at the home.
export const metadata: Metadata = { alternates: { canonical: "/" } }

export default function Page() {
  return <Clock />
}
