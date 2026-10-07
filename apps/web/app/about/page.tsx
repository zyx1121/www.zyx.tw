import { cn } from "cn"

import { Status } from "@workspace/ui/components/status"
import { ScrambleText } from "@workspace/ui/components/ui/scramble-text"
import { column, enterRow, page } from "@workspace/ui/lib/layout"

import { Hero } from "@/components/hero"
import { ABOUT, HOME } from "@/lib/copy"
import { getGithubStatus } from "@/lib/github"
import { FACTS, SECTIONS } from "@/lib/resume"
import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({ title: ABOUT.title, path: "/about" })

// The GitHub status is fetched on the server and the page regenerated in the
// background every 5 minutes (ISR), so the SSR HTML carries real events
// instead of "Loading…". force-static keeps the route prerendered even though
// the GitHub fetch carries an Authorization header, which Next would
// otherwise read as a dynamic signal.
export const revalidate = 300
export const dynamic = "force-static"

// Content blocks enter one row apart after the title: step 1 is row 2.
const block = (step: number) => enterRow(1 + step)

const LINK =
  "rounded-control underline decoration-muted-foreground/40 underline-offset-4 outline-offset-2 transition-colors hover:decoration-foreground focus-visible:outline-2"

/** The resume's section headings, at group-heading size. */
const HEADING = "text-body font-medium"

/**
 * Titles as displayed: "Wi-Fi" keeps its hyphen and "6 GHz" its space on one
 * line. The data, and so the Markdown, keeps plain characters.
 */
function unbroken(text: string) {
  return text
    .replace(/Wi-Fi/g, "Wi\u2011Fi")
    .replace(/(\d) GHz/g, "$1\u00a0GHz")
}

/** A value that links when it has an address. */
function Value({ text, href }: { text: string; href?: string }) {
  if (!href) return <>{text}</>
  const external = href.startsWith("http")
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={LINK}
    >
      {text}
    </a>
  )
}

/**
 * About reads as a CV: the name, a few facts, then Education, Experience,
 * Publications, Projects and Awards, each newest first, and last what he is
 * doing now on GitHub.
 */
export default async function About() {
  const status = await getGithubStatus()

  return (
    <main className={cn(column, page, "flex-1")}>
      <Hero
        title={
          <ScrambleText
            element="h1"
            text={HOME.title}
            className="text-title font-medium"
          />
        }
        className="pb-25"
      />

      {/* Facts: a muted label column, then the value. */}
      <dl className={cn("flex flex-col gap-y-3", block(1))}>
        {FACTS.map(({ label, value, href }) => (
          <div key={label} className="flex gap-x-5">
            <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
            <dd>
              <Value text={value} href={href} />
            </dd>
          </div>
        ))}
      </dl>

      {SECTIONS.map(({ id, title, entries }, index) => (
        <section
          key={id}
          aria-labelledby={`${id}-heading`}
          className={cn("mt-20", block(2 + index))}
        >
          <h2 id={`${id}-heading`} className={HEADING}>
            {title}
          </h2>
          <ol className="mt-5 flex flex-col gap-y-3">
            {entries.map(({ when, what, note, where, href }) => (
              <li key={`${when} ${what}`} className="flex gap-x-5">
                <span className="w-28 shrink-0 text-caption whitespace-nowrap text-muted-foreground tabular-nums">
                  {when}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-x-5 sm:flex-row sm:justify-between">
                  <span className="text-pretty">
                    {unbroken(what)}
                    {note && (
                      <span className="block text-muted-foreground">
                        {note}
                      </span>
                    )}
                  </span>
                  {/* At most 16rem wide from sm, so a long name wraps in
                      its own column instead of squeezing the one beside it. */}
                  <span className="shrink-0 text-pretty text-muted-foreground sm:max-w-64 sm:text-right">
                    <Value text={where} href={href} />
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <Status
        data={status}
        className={cn("mt-20", block(2 + SECTIONS.length))}
      />
    </main>
  )
}
