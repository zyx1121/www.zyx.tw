import { cn } from "cn"

import { column, enterRow, page } from "@workspace/ui/lib/layout"

import { Hero, HeroTitle } from "@/components/hero"
import type { LegalDoc, Run } from "@/lib/legal"

const LINK =
  "rounded-control underline underline-offset-4 outline-offset-2 transition-colors hover:text-muted-foreground focus-visible:outline-2"

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

/** Privacy and Terms: the title, the date of the last change, the sections. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <main className={cn(column, page, "flex-1 text-body")}>
      <Hero
        title={<HeroTitle>{doc.title}</HeroTitle>}
        subtitle={
          <>
            Last updated{" "}
            <time dateTime={doc.updated} className="tabular-nums">
              {doc.updated}
            </time>
            .
          </>
        }
        className="pb-25"
      />
      {doc.sections.map(({ heading, paragraphs }, index) => (
        <section
          key={heading}
          className={cn(index > 0 && "mt-15", enterRow(3 + index))}
        >
          <h2 className="text-title">{heading}</h2>
          {paragraphs.map((runs, paragraph) => (
            <Paragraph key={paragraph} runs={runs} />
          ))}
        </section>
      ))}
    </main>
  )
}
