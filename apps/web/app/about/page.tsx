import { DaysAlive } from "@workspace/ui/components/days-alive"
import { Intro, IntroLine } from "@workspace/ui/components/intro"
import { Status } from "@workspace/ui/components/status"
import { ScrambleText } from "@workspace/ui/components/ui/scramble-text"
import { cn } from "@workspace/ui/lib/utils"

import { Hero } from "@/components/hero"
import { LatestList } from "@/components/latest-list"
import { ABOUT, HOME } from "@/lib/copy"
import { getGithubStatus } from "@/lib/github"
import { getLatestChanges } from "@/lib/latest"
import { column, enter, enterRow, page } from "@/lib/layout"
import { FACTS, TIMELINE } from "@/lib/resume"
import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({ title: ABOUT.title, path: "/about" })

// The GitHub status and the Latest list are fetched on the server and the
// page regenerated in the background every 5 minutes (ISR), so the SSR HTML
// carries real data instead of "Loading…". force-static keeps the route
// prerendered even though the GitHub fetch carries an Authorization header,
// which Next would otherwise read as a dynamic signal.
export const revalidate = 300
export const dynamic = "force-static"

// Content blocks enter one row apart after the hero's two: step 1 is row 3.
const block = (step: number) => enterRow(2 + step)

const LINK =
  "rounded-sm underline decoration-muted-foreground/40 underline-offset-4 outline-offset-2 transition-colors hover:decoration-foreground focus-visible:outline-2"

/** The resume's section headings, at group-heading size. */
const HEADING = "text-2xl"

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
 * About reads as a resume: who, the facts, a timeline, then what he is doing
 * now (GitHub status) and what shipped lately.
 */
export default async function About() {
  const [status, latest] = await Promise.all([
    getGithubStatus(),
    getLatestChanges(),
  ])

  return (
    <main className={cn(column, page, "flex-1")}>
      <Hero
        title={
          <ScrambleText element="h1" text={HOME.title} className="text-3xl" />
        }
        subtitle={<IntroLine />}
        aside={<Intro className="w-16 max-w-16 shrink-0 sm:max-w-16" />}
        className="pb-25"
      />

      {/* Facts: a muted label column, then the value. */}
      <dl
        className={cn("grid grid-cols-[7rem_1fr] gap-x-5 gap-y-3", enter)}
        style={block(1)}
      >
        {FACTS.map(({ label, value, href }) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>
              <Value text={value} href={href} />
            </dd>
          </div>
        ))}
        <div className="contents">
          <dt className="text-muted-foreground">Alive</dt>
          {/* Holds its line while the count mounts, so nothing below moves. */}
          <dd className="min-h-[1lh]">
            <DaysAlive className="text-foreground" /> days
          </dd>
        </div>
      </dl>

      <section
        aria-labelledby="timeline-heading"
        className={cn("mt-20", enter)}
        style={block(2)}
      >
        <h2 id="timeline-heading" className={HEADING}>
          {ABOUT.timeline}
        </h2>
        <ol className="mt-5 flex flex-col gap-y-3">
          {TIMELINE.map(({ when, what, where, href }) => (
            <li
              key={`${when} ${what}`}
              className="grid grid-cols-[7rem_1fr] gap-x-5 sm:grid-cols-[7rem_1fr_auto]"
            >
              <span className="whitespace-nowrap text-muted-foreground tabular-nums">
                {when}
              </span>
              <span className="text-pretty">{what}</span>
              <span className="col-start-2 text-muted-foreground sm:col-start-auto sm:text-right">
                <Value text={where} href={href} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Status data={status} className={cn("mt-20", enter)} style={block(3)} />

      {latest && latest.changes.length > 0 && (
        <LatestList
          changes={latest.changes}
          renderedAt={latest.fetchedAt}
          className={cn("mt-20", enter)}
          style={block(4)}
        />
      )}
    </main>
  )
}
