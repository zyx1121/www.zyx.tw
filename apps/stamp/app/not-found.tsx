import type { Metadata } from "next"
import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"
import { column, enterRow, page } from "@workspace/ui/lib/layout"

// The layout's Open Graph and Twitter cards describe the home page, url
// included, so a missing page drops them.
export const metadata: Metadata = {
  title: "Not found",
  openGraph: null,
  twitter: null,
}

const LINK = "underline underline-offset-4"

/** Says nothing is here and where to look, for people and agents. */
export default function NotFound() {
  return (
    <main className={cn(column, page, "flex flex-col gap-3")}>
      <h1 className={cn("text-title font-medium", enterRow(1))}>
        Nothing is here
      </h1>
      <p className={cn("text-muted-foreground", enterRow(2))}>
        Stamp is on the{" "}
        <Link href="/" className={cn(LINK, "text-foreground")}>
          home page
        </Link>
        . Agents can read{" "}
        <a href="/llms.txt" className={cn(LINK, "text-foreground")}>
          llms.txt
        </a>
        .
      </p>
    </main>
  )
}
