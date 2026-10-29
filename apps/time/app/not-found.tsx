import type { Metadata } from "next"
import Link from "next/link"

import { RequestedPath } from "@workspace/ui/components/shell"
import { StatusPage } from "@workspace/ui/components/status-page"
import { cn } from "@workspace/ui/lib/utils"
import { column, enterRow } from "@workspace/ui/lib/layout"

// The layout's Open Graph and Twitter cards describe the home page, url
// included, so a missing page drops them.
export const metadata: Metadata = {
  title: "Not found",
  openGraph: null,
  twitter: null,
}

export default function NotFound() {
  return (
    <main
      className={cn(
        column,
        "flex min-h-dvh flex-col justify-center",
        enterRow(1)
      )}
    >
      <StatusPage
        title="Not found"
        command={
          <>
            cd <RequestedPath />
          </>
        }
        action={
          <Link
            href="/"
            className="self-start terminal-link underline decoration-muted-foreground/40 underline-offset-4"
          >
            Go home
          </Link>
        }
      />
    </main>
  )
}
