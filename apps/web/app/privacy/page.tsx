import { cn } from "@workspace/ui/lib/utils"

import { Hero, HeroTitle } from "@/components/hero"
import { column, enter, enterRow, page } from "@/lib/layout"
import { PRIVACY, type Run } from "@/lib/privacy"
import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({
  title: PRIVACY.title,
  path: "/privacy",
})

export const dynamic = "force-static"

const LINK =
  "rounded-sm underline underline-offset-4 outline-offset-2 transition-colors hover:text-muted-foreground focus-visible:outline-2"

function Paragraph({ runs }: { runs: Run[] }) {
  return (
    <p className="mt-3">
      {runs.map(({ text, href }, index) =>
        href ? (
          <a
            key={index}
            href={href}
            {...(href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className={LINK}
          >
            {text}
          </a>
        ) : (
          <span key={index}>{text}</span>
        )
      )}
    </p>
  )
}

export default function Privacy() {
  return (
    <main className={cn(column, page, "flex-1")}>
      <Hero
        title={<HeroTitle>{PRIVACY.title}</HeroTitle>}
        subtitle={
          <>
            Last updated{" "}
            <time dateTime={PRIVACY.updated} className="tabular-nums">
              {PRIVACY.updated}
            </time>
            .
          </>
        }
        className="pb-25"
      />
      {PRIVACY.sections.map(({ heading, paragraphs }, index) => (
        <section
          key={heading}
          className={cn(index > 0 && "mt-15", enter)}
          style={enterRow(3 + index)}
        >
          <h2 className="text-2xl">{heading}</h2>
          {paragraphs.map((runs, paragraph) => (
            <Paragraph key={paragraph} runs={runs} />
          ))}
        </section>
      ))}
    </main>
  )
}
