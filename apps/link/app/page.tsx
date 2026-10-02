import { localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import type { Metadata } from "next"

import { Shortener } from "@/components/shortener"

// Canonical lives on the page rather than the root layout, so the 404 page
// does not point at the home.
const baseMetadata: Metadata = { alternates: { canonical: "/" } }

export default function Page() {
  return <Shortener />
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES, "/")
}
