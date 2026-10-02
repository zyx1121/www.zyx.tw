import { T } from "@workspace/ui/components/locale-provider"
import { localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import type { Metadata } from "next"

import { Good } from "@/components/good"
import { SITE_DESC, SITE_NAME } from "@/lib/site"

// Canonical lives on the page rather than the root layout, so the 404 page
// does not point at the home.
const baseMetadata: Metadata = { alternates: { canonical: "/" } }

export default function Home() {
  return (
    <main className="h-dvh w-dvw">
      <h1 className="sr-only">
        <T>{SITE_NAME}</T>
      </h1>
      <p className="sr-only">
        <T>{SITE_DESC}</T>
      </p>
      <Good />
    </main>
  )
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES, "/")
}
