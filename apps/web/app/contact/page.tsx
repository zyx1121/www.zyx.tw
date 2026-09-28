import { EMAIL } from "@workspace/ui/lib/profile"
import { cn } from "@workspace/ui/lib/utils"

import { CONTACT } from "@/lib/copy"
import { column, enter, enterRow, page } from "@/lib/layout"
import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: CONTACT.title,
  path: "/contact",
})

export const dynamic = "force-static"

/** Contact is the address, at the title's size. */
export default function ContactPage() {
  return (
    <main className={cn(column, page, "flex-1")}>
      <h1 className="sr-only">{CONTACT.title}</h1>
      <a
        href={`mailto:${EMAIL}`}
        className={cn(
          "inline-block rounded-sm text-3xl decoration-muted-foreground underline-offset-8 outline-offset-4 hover:underline focus-visible:outline-2",
          enter
        )}
        style={enterRow(1)}
      >
        {EMAIL}
      </a>
    </main>
  )
}
