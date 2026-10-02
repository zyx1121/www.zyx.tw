import { localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import type { Metadata } from "next"

// The layout's Open Graph and Twitter cards describe the home page, url
// included, so a missing page drops them.
const baseMetadata: Metadata = {
  title: "Not found",
  openGraph: null,
  twitter: null,
}

export default function NotFound() {
  return (
    <main className="flex h-dvh w-dvw flex-col items-center justify-center">
      <h1 className="animate-pulse font-mono text-display font-bold">404</h1>
    </main>
  )
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES)
}
