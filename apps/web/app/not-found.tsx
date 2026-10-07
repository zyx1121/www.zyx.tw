import Link from "next/link"
import { cn } from "cn"

import { column, enterRow, page } from "@workspace/ui/lib/layout"

import { Hero, HeroTitle } from "@/components/hero"
import { NOT_FOUND } from "@/lib/copy"
import { PAGES } from "@/lib/site"

const ROW = "relative flex flex-wrap justify-between gap-x-5"
const LINK =
  "rounded-control decoration-muted-foreground underline-offset-4 outline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-2"

/**
 * The 404 page, for people and agents: every page, then llms.txt and the
 * Markdown twins. Markdown requests get /404.md instead (next.config.mjs).
 */
export default function NotFound() {
  return (
    <main className={cn(column, page, "flex-1")}>
      <Hero
        title={<HeroTitle>{NOT_FOUND.title}</HeroTitle>}
        subtitle={NOT_FOUND.lead}
        className="pb-25"
      />
      <ul className={cn("flex flex-col gap-y-3", enterRow(3))}>
        {PAGES.map(({ path, label, summary }) => (
          <li key={path} className={ROW}>
            <Link href={path} className={LINK}>
              {label}
            </Link>
            <span className="text-muted-foreground">{summary}</span>
          </li>
        ))}
      </ul>
      <section
        aria-labelledby="agents-heading"
        className={cn("mt-20", enterRow(4))}
      >
        <h2 id="agents-heading" className="text-body font-medium">
          {NOT_FOUND.agents}
        </h2>
        <ul className="mt-5 flex flex-col gap-y-3">
          <li className={ROW}>
            <a href="/llms.txt" className={LINK}>
              /llms.txt
            </a>
            <span className="text-muted-foreground">{NOT_FOUND.llms}</span>
          </li>
          {PAGES.map(({ markdown, label }) => (
            <li key={markdown} className={ROW}>
              <a href={markdown} className={LINK}>
                {markdown}
              </a>
              <span className="text-muted-foreground">
                {label} {NOT_FOUND.twin}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
