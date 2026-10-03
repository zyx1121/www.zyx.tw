import type { Metadata } from "next"

// The layout's Open Graph and Twitter cards describe the home page, url
// included, so a missing page drops them.
export const metadata: Metadata = {
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
