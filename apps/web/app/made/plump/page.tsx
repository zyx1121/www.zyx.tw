import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/ui/button"
import { cn } from "@workspace/ui/lib/utils"

import { PlumpDemo } from "@/components/plump-demo"
import { column, page } from "@/lib/layout"
import { PLUMP } from "@/lib/plump"
import { pageMetadata } from "@/lib/site"

export const dynamic = "force-static"

export const metadata = pageMetadata({
  title: "Plump, SVG to 3D",
  path: "/made/plump",
  description: PLUMP.description,
  image: { url: PLUMP.image, width: 1440, height: 900, alt: PLUMP.imageAlt },
})

function OpenPlump() {
  return (
    <a href={PLUMP.href} className={buttonVariants()}>
      Open Plump <ArrowUpRight aria-hidden data-icon="inline-end" />
    </a>
  )
}

export default function Plump() {
  return (
    <main
      className={cn(
        column,
        page,
        "font-['Helvetica_Neue',Helvetica,Arial,sans-serif] [font-feature-settings:normal]"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-5">
        <Link
          href="/made"
          className="text-muted-foreground outline-offset-4 hover:text-foreground"
        >
          Made by zyx
        </Link>
        <p className="text-muted-foreground">{PLUMP.purpose}</p>
      </div>
      <div className="mt-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-display font-medium tracking-[-0.05em]">
            {PLUMP.name}
          </h1>
          <p className="mt-5 text-2xl/8">{PLUMP.tagline}</p>
        </div>
        <OpenPlump />
      </div>

      <section aria-labelledby="plump-demo-title" className="mt-10">
        <h2 id="plump-demo-title" className="sr-only">
          {PLUMP.demo.title}
        </h2>
        <PlumpDemo />
        <p className="mt-3 max-w-[65ch] text-muted-foreground">
          {PLUMP.demo.body}
        </p>
      </section>

      <section
        className="mt-25 grid gap-5 sm:grid-cols-2"
        aria-labelledby="plump-idea-title"
      >
        <h2
          id="plump-idea-title"
          className="text-2xl/8 font-medium text-balance"
        >
          {PLUMP.idea.title}
        </h2>
        <p className="text-muted-foreground">{PLUMP.idea.body}</p>
      </section>

      <section className="mt-20" aria-label="How Plump works">
        <ol className="grid gap-10 sm:grid-cols-3 sm:gap-5">
          {PLUMP.steps.map(({ title, body }, index) => (
            <li key={title}>
              <p className="text-muted-foreground tabular-nums">0{index + 1}</p>
              <h2 className="mt-5 font-medium">{title}</h2>
              <p className="mt-3 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
        <a
          href="/made/plump/sample.svg"
          download="plump-sample.svg"
          className="mt-8 inline-block underline decoration-muted-foreground underline-offset-4"
        >
          Download the sample SVG
        </a>
      </section>

      <section
        className="mt-20 grid gap-5 sm:grid-cols-2"
        aria-labelledby="plump-details-title"
      >
        <h2 id="plump-details-title" className="font-medium">
          A small tool, with room to play.
        </h2>
        <div>
          <dl className="space-y-3">
            {PLUMP.details.map(({ label, value }) => (
              <div key={label} className="grid grid-cols-[5rem_1fr] gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-muted-foreground">{PLUMP.storage}</p>
        </div>
      </section>

      <section className="mt-25" aria-labelledby="plump-open-title">
        <h2
          id="plump-open-title"
          className="text-2xl/8 font-medium text-balance"
        >
          {PLUMP.closing}
        </h2>
        <div className="mt-5">
          <OpenPlump />
        </div>
        <p className="mt-10 text-muted-foreground">
          {PLUMP.credit}{" "}
          <Link href="/about" className="underline underline-offset-4">
            Meet the maker
          </Link>
        </p>
      </section>
    </main>
  )
}
