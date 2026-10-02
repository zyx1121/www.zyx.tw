import { T } from "@workspace/ui/components/locale-provider"
import { cn } from "@workspace/ui/lib/utils"

import { Hero, HeroTitle } from "@/components/hero"
import type { LegalDoc, Run } from "@/lib/legal"
import { column, enter, enterRow, page } from "@/lib/layout"

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
            <T>{text}</T>
          </a>
        ) : (
          <span key={index}>
            <T>{text}</T>
          </span>
        )
      )}
    </p>
  )
}

/** Privacy and Terms: the title, the date of the last change, the sections. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <main className={cn(column, page, "flex-1 text-sm/6")}>
      <Hero
        title={
          <HeroTitle>
            <T>{doc.title}</T>
          </HeroTitle>
        }
        subtitle={
          <>
            <T>{"Last updated"}</T>
            <T> </T>
            <time dateTime={doc.updated} className="tabular-nums">
              <T>{doc.updated}</T>
            </time>
            .
          </>
        }
        className="pb-25"
      />
      {doc.sections.map(({ heading, paragraphs }, index) => (
        <section
          key={heading}
          className={cn(index > 0 && "mt-15", enter)}
          style={enterRow(3 + index)}
        >
          <h2 className="text-2xl">
            <T>{heading}</T>
          </h2>
          {paragraphs.map((runs, paragraph) => (
            <Paragraph key={paragraph} runs={runs} />
          ))}
        </section>
      ))}
    </main>
  )
}
