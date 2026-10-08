import type { Metadata } from "next"
import { cn } from "cn"

import { buttonVariants } from "@workspace/ui/components/ui/button"
import { column, enterRow, page } from "@workspace/ui/lib/layout"

import { Film } from "@/components/film"
import { Seal } from "@/components/seal"
import {
  CAPABILITIES,
  CLOSING,
  CONTACT_URL,
  EMAIL,
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

function Actions({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <a href={CONTACT_URL} className={buttonVariants()}>
        {HERO.primary}
      </a>
      <a href="#film" className={buttonVariants({ variant: "outline" })}>
        {HERO.secondary}
      </a>
    </div>
  )
}

function Heading({ title, body }: { title: string; body?: string }) {
  return (
    <header className="flex max-w-2xl flex-col gap-3">
      <h2 className="text-title font-medium">{title}</h2>
      {body && <p className="text-muted-foreground">{body}</p>}
    </header>
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
    <main className={cn(column, page, "flex flex-col gap-20")}>
      <section className="flex flex-col gap-5">
        <h1 className={cn("relative w-fit", enterRow(1))}>
          <span className="text-display font-medium tracking-tight">
            {SITE_NAME}
          </span>
          <Seal className="seal-pressed absolute -top-3 -right-15 size-14" />
        </h1>
        <p className={cn("text-title font-medium", enterRow(2))}>
          {HERO.tagline}
        </p>
        <p className={cn("max-w-xl text-muted-foreground", enterRow(3))}>
          {HERO.lede}
        </p>
        <Actions className={cn("pt-3", enterRow(4))} />
      </section>

      <Film id="film" className={cn("scroll-mt-20", enterRow(5))} />

      <section className="flex flex-col gap-10">
        <Heading title={STEPS.title} />
        <ol className="grid gap-10 md:grid-cols-3 md:gap-5">
          {STEPS.items.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2 border-t pt-5">
              <span className="text-caption text-muted-foreground tabular-nums">
                0{index + 1}
              </span>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-10">
        <Heading title={PRODUCT.title} body={PRODUCT.body} />
        <Shot src="/audit-chat.jpg" alt={PRODUCT.alt} />
      </section>

      <section className="flex flex-col gap-10">
        <Heading title={GUARANTEE.title} body={GUARANTEE.body} />
        <Shot src="/leave-canvas.jpg" alt={GUARANTEE.alt} />
        <ul className="grid gap-10 md:grid-cols-3 md:gap-5">
          {GUARANTEE.points.map((point) => (
            <li key={point.title} className="flex flex-col gap-2 border-t pt-5">
              <h3 className="font-medium">{point.title}</h3>
              <p className="text-muted-foreground">{point.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-10">
        <Heading title={OFFICES.title} />
        <dl className="flex flex-col">
          {OFFICES.items.map((item) => (
            <div
              key={item.office}
              className="grid gap-1 border-t py-5 md:grid-cols-4 md:gap-5"
            >
              <dt className="font-medium">{item.office}</dt>
              <dd className="text-muted-foreground md:col-span-3">
                {item.job}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-10">
        <Heading title={CAPABILITIES.title} />
        <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 2xl:grid-cols-4">
          {CAPABILITIES.items.map((item) => (
            <li key={item.title} className="flex flex-col gap-2 border-t pt-5">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-10">
        <Heading title={TRUST.title} body={TRUST.body} />
        <ul className="grid gap-10 md:grid-cols-3 md:gap-5">
          {TRUST.items.map((item) => (
            <li key={item.title} className="flex flex-col gap-2 border-t pt-5">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-5 border-t pt-20">
        <h2 className="max-w-2xl text-title font-medium">{CLOSING.title}</h2>
        <p className="text-muted-foreground">
          {CLOSING.body}{" "}
          <a
            href={CONTACT_URL}
            className="text-foreground underline underline-offset-4"
          >
            {EMAIL}
          </a>
        </p>
        <Actions className="pt-3" />
      </section>
    </main>
  )
}
