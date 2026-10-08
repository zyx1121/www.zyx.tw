import type { Metadata } from "next"
import { cn } from "cn"

import { buttonVariants } from "@workspace/ui/components/ui/button"
import { enterRow } from "@workspace/ui/lib/layout"

import { Film } from "@/components/film"
import { Reveal } from "@/components/reveal"
import { Seal } from "@/components/seal"
import {
  ACCESS_URL,
  CAPABILITIES,
  CLOSING,
  GUARANTEE,
  HERO,
  OFFICES,
  PRODUCT,
  SITE_NAME,
  STEPS,
  TRUST,
} from "@/lib/content"

// Canonical lives on the page rather than the root layout, so the 404 page
// does not point at the home.
export const metadata: Metadata = { alternates: { canonical: "/" } }

/** The page's width: wider than the shared column, for campaign screens. */
const WIDE = "mx-auto w-full max-w-6xl px-5 md:px-10"

/** One screen, one idea: at least the viewport tall, content centered. */
const SCREEN = "flex min-h-dvh flex-col justify-center py-30"

function Actions({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <a href={ACCESS_URL} className={buttonVariants()}>
        {HERO.primary}
      </a>
      <a href="#film" className={buttonVariants({ variant: "outline" })}>
        {HERO.secondary}
      </a>
    </div>
  )
}

function Statement({ title, body }: { title: string; body?: string }) {
  return (
    <header className="flex max-w-4xl flex-col gap-5">
      <h2 className="stamp-statement">{title}</h2>
      {body && (
        <p className="stamp-lead max-w-2xl text-muted-foreground">{body}</p>
      )}
    </header>
  )
}

function Items({
  items,
  className,
}: {
  items: { title: string; body: string }[]
  className?: string
}) {
  return (
    <ul className={cn("grid gap-x-10 gap-y-15", className)}>
      {items.map((item) => (
        <li key={item.title} className="flex flex-col gap-3 border-t pt-5">
          <h3 className="stamp-item-title">{item.title}</h3>
          <p className="stamp-item-body text-muted-foreground">{item.body}</p>
        </li>
      ))}
    </ul>
  )
}

function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={2048}
      height={1280}
      loading="lazy"
      decoding="async"
      className="w-full rounded-control bg-muted"
    />
  )
}

export default function Home() {
  return (
    <main>
      <section className={cn(WIDE, SCREEN, "gap-10")}>
        <h1 className={cn("relative w-fit", enterRow(1))}>
          <span className="stamp-wordmark">{SITE_NAME}</span>
          <Seal className="seal-pressed absolute -top-10 -right-2 size-14 sm:-top-4 sm:-right-16 sm:size-16 md:-top-6 md:-right-30 md:size-28" />
        </h1>
        <div className="flex flex-col gap-5">
          <p className={cn("stamp-statement max-w-4xl", enterRow(2))}>
            {HERO.tagline}
          </p>
          <p
            className={cn(
              "stamp-lead max-w-2xl text-muted-foreground",
              enterRow(3)
            )}
          >
            {HERO.lede}
          </p>
        </div>
        <div className={cn("flex flex-col gap-3", enterRow(4))}>
          <Actions />
          <p className="text-caption text-muted-foreground">{HERO.note}</p>
        </div>
      </section>

      <section className={cn(WIDE, SCREEN)}>
        <Reveal>
          <Film id="film" className="scroll-mt-20" />
        </Reveal>
      </section>

      <section className={cn(WIDE, SCREEN)}>
        <Reveal className="flex flex-col gap-20">
          <Statement title={STEPS.title} />
          <ol className="grid gap-x-10 gap-y-15 md:grid-cols-3">
            {STEPS.items.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col gap-3 border-t pt-5"
              >
                <span className="stamp-office text-muted-foreground tabular-nums">
                  0{index + 1}
                </span>
                <h3 className="stamp-item-title">{step.title}</h3>
                <p className="stamp-item-body text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className={cn(WIDE, SCREEN)}>
        <Reveal className="flex flex-col gap-15">
          <Statement title={PRODUCT.title} body={PRODUCT.body} />
          <Shot src="/audit-chat.jpg" alt={PRODUCT.alt} />
        </Reveal>
      </section>

      <section className={cn(WIDE, SCREEN)}>
        <Reveal className="flex flex-col gap-15">
          <Statement title={GUARANTEE.title} body={GUARANTEE.body} />
          <Shot src="/leave-canvas.jpg" alt={GUARANTEE.alt} />
          <Items items={GUARANTEE.points} className="md:grid-cols-3" />
        </Reveal>
      </section>

      <section className={cn(WIDE, SCREEN)}>
        <Reveal className="flex flex-col gap-15">
          <Statement title={OFFICES.title} />
          <dl className="flex flex-col">
            {OFFICES.items.map((item) => (
              <div
                key={item.office}
                className="grid gap-3 border-t py-10 md:grid-cols-2 md:gap-10"
              >
                <dt className="stamp-office">{item.office}</dt>
                <dd className="stamp-lead text-muted-foreground">{item.job}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section className={cn(WIDE, SCREEN)}>
        <Reveal className="flex flex-col gap-20">
          <Statement title={CAPABILITIES.title} />
          <Items
            items={CAPABILITIES.items}
            className="sm:grid-cols-2 lg:grid-cols-4"
          />
        </Reveal>
      </section>

      <section className={cn(WIDE, SCREEN)}>
        <Reveal className="flex flex-col gap-20">
          <Statement title={TRUST.title} body={TRUST.body} />
          <Items items={TRUST.items} className="md:grid-cols-3" />
        </Reveal>
      </section>

      <section className={cn(WIDE, SCREEN, "items-center text-center")}>
        <Reveal className="flex flex-col items-center gap-10">
          <Seal id="seal-end" className="size-24 -rotate-6" />
          <h2 className="stamp-statement max-w-4xl">{CLOSING.title}</h2>
          <p className="stamp-lead max-w-2xl text-muted-foreground">
            {CLOSING.body}
          </p>
          <a href={ACCESS_URL} className={buttonVariants()}>
            {HERO.primary}
          </a>
        </Reveal>
      </section>
    </main>
  )
}
