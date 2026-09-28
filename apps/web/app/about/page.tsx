import { Status } from "@workspace/ui/components/status"
import { ScrambleText } from "@workspace/ui/components/ui/scramble-text"
import { cn } from "@workspace/ui/lib/utils"

import { Hero } from "@/components/hero"
import { ABOUT, HOME } from "@/lib/copy"
import { getGithubStatus } from "@/lib/github"
import { column, enter, enterRow, page } from "@/lib/layout"
import { FACTS, type LeadRun, SECTIONS } from "@/lib/resume"
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

function Lead({ runs }: { runs: LeadRun[] }) {
  return (
    <p className="mt-3 text-muted-foreground">
      {runs.map(({ text, href }, index) =>
        href ? <Value key={index} text={text} href={href} /> : text
      )}
    </p>
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
          <ScrambleText element="h1" text={HOME.title} className="text-3xl" />
        }
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
      </dl>

      {SECTIONS.map(({ id, title, lead, entries }, index) => (
        <section
          key={id}
          aria-labelledby={`${id}-heading`}
          className={cn("mt-20", enter)}
          style={block(2 + index)}
        >
          <h2 id={`${id}-heading`} className={HEADING}>
            {title}
          </h2>
          {lead && <Lead runs={lead} />}
          <ol className="mt-5 flex flex-col gap-y-3">
            {entries.map(({ when, what, note, where, href }) => (
              <li
                key={`${when} ${what}`}
                className="grid grid-cols-[7rem_1fr] gap-x-5 sm:grid-cols-[7rem_1fr_fit-content(16rem)]"
              >
                <span className="whitespace-nowrap text-muted-foreground tabular-nums">
                  {when}
                </span>
                <span className="text-pretty">
                  {what}
                  {note && (
                    <span className="block text-muted-foreground">{note}</span>
                  )}
                </span>
                {/* At most 16rem wide from sm, so a long name wraps in
                    its own column instead of squeezing the one beside it. */}
                <span className="col-start-2 text-muted-foreground text-pretty sm:col-start-auto sm:text-right">
                  <Value text={where} href={href} />
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <Status
        data={status}
        className={cn("mt-20", enter)}
        style={block(2 + SECTIONS.length)}
      />
    </main>
  )
}
