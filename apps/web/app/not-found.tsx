import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"
import { column, enterRow, page } from "@workspace/ui/lib/layout"

import { Command, Cursor, RequestedPath } from "@workspace/ui/components/shell"
import { NOT_FOUND } from "@/lib/copy"
import { PAGES } from "@/lib/site"

// Two columns, as `ls -l` lines up its names: the path, then what it is.
const ROW = "relative flex gap-x-5"
const NAME = "w-36 shrink-0"
const LINK = "terminal-link after:absolute after:inset-0"

/**
 * The 404 page, for people and agents, as a shell session: the visitor's
 * `cd` fails, `ls /` lists every page, and a comment lists llms.txt and the
 * Markdown twins. Markdown requests get /404.md instead (next.config.mjs).
 */
export default function NotFound() {
  return (
    <main className={cn(column, page, "flex-1")}>
      <div className={cn("pb-25", enterRow(1))}>
        <Command>
          cd <RequestedPath />
        </Command>
        <h1 className="mt-3 text-title font-medium">{NOT_FOUND.title}</h1>
      </div>
      <section aria-label={NOT_FOUND.lead} className={enterRow(2)}>
        <Command>ls /</Command>
        <ul className="mt-5 flex flex-col gap-y-3">
          {PAGES.map(({ path, summary }) => (
            <li key={path} className={ROW}>
              <span className={NAME}>
                <Link href={path} className={LINK}>
                  {path}
                </Link>
              </span>
              <span className="text-muted-foreground">{summary}</span>
            </li>
          ))}
        </ul>
      </section>
      <section
        aria-labelledby="agents-heading"
        className={cn("mt-20", enterRow(3))}
      >
        <h2 id="agents-heading" className="text-muted-foreground">
          <span aria-hidden="true"># </span>
          {NOT_FOUND.agents.toLowerCase()}
        </h2>
        <ul className="mt-5 flex flex-col gap-y-3">
          <li className={ROW}>
            <span className={NAME}>
              <a href="/llms.txt" className={LINK}>
                /llms.txt
              </a>
            </span>
            <span className="text-muted-foreground">{NOT_FOUND.llms}</span>
          </li>
          {PAGES.map(({ markdown, label }) => (
            <li key={markdown} className={ROW}>
              <span className={NAME}>
                <a href={markdown} className={LINK}>
                  {markdown}
                </a>
              </span>
              <span className="text-muted-foreground">
                {label} {NOT_FOUND.twin}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <Command className={cn("mt-20", enterRow(4))}>
        <Cursor />
      </Command>
    </main>
  )
}
