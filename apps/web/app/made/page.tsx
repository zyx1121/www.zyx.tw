import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { Hero, HeroTitle } from "@/components/hero"
import { column, page } from "@/lib/layout"
import { MADE, PLUMP } from "@/lib/plump"
import { pageMetadata } from "@/lib/site"

export const dynamic = "force-static"
export const metadata = pageMetadata({
  title: MADE.title,
  path: "/made",
  description: MADE.description,
})

export default function Made() {
  return (
    <main className={cn(column, page)}>
      <Hero
        title={<HeroTitle>{MADE.title}</HeroTitle>}
        subtitle={MADE.description}
      />
      <Link
        href="/made/plump"
        className="group mt-10 block rounded-lg outline-offset-8 focus-visible:outline-2"
      >
        <Image
          src={PLUMP.image}
          alt={PLUMP.imageAlt}
          width={1440}
          height={900}
          preload
          sizes="(min-width: 1536px) 984px, (min-width: 1024px) 728px, (min-width: 576px) 536px, calc(100vw - 40px)"
          className="aspect-[8/5] w-full rounded-lg object-cover"
        />
        <div className="mt-5 flex items-center justify-between gap-5">
          <h2 className="font-medium">{PLUMP.name}</h2>
          <span className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
            {PLUMP.purpose} <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
        <p className="mt-3 text-muted-foreground">{PLUMP.tagline}</p>
      </Link>
    </main>
  )
}
