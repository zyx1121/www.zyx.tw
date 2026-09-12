"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useScroll, useTransform } from "motion/react"
import * as m from "motion/react-m"

import { useInView } from "@workspace/ui/hooks/use-in-view"

type Project = {
  name: string
  description: string
  href: string
  /**
   * Static preview, 680x383 (16:9, 2x of the widest card). Live sites are
   * screenshots committed under apps/web/public/previews and refreshed with
   * `bun run previews`; GitHub repos use GitHub's own OpenGraph card. Sites
   * used to be embedded as live iframes, which cost ~7 MB per visit and
   * rendered blank for anything with `frame-ancestors 'none'`.
   */
  preview: string
}

const PROJECTS: Project[] = [
  {
    name: "things.zyx.tw",
    description:
      "A scrapbook for texts, links, images, and videos worth keeping.",
    href: "https://things.zyx.tw",
    preview: "/previews/things.zyx.tw.webp",
  },
  {
    name: "good.zyx.tw",
    description:
      "Digital 乖乖 — the snack engineers tape onto servers for luck.",
    href: "https://good.zyx.tw",
    preview: "/previews/good.zyx.tw.webp",
  },
  {
    name: "ai.winlab.tw",
    description: "NYCU's Office of AI Affairs — the official site.",
    href: "https://ai.winlab.tw",
    preview: "/previews/ai.winlab.tw.webp",
  },
  {
    name: "winlab.tw",
    description: "WinLab — Chien-Chao Tseng's lab at NYCU CS.",
    href: "https://winlab.tw",
    preview: "/previews/www.winlab.tw.webp",
  },
  {
    name: "gallery.winlab.tw",
    description: "Art from NYCU WinLab — sketches, prints, the whole wall.",
    href: "https://gallery.winlab.tw",
    preview: "/previews/gallery.winlab.tw.webp",
  },
  {
    name: "scriptorium",
    description:
      "Self-hosted LLM wiki for teams — Karpathy's pattern over Postgres + MCP.",
    href: "https://github.com/zyx1121/scriptorium",
    preview: "https://opengraph.githubassets.com/1/zyx1121/scriptorium",
  },
  {
    name: "temp.zyx.tw",
    description: "Anonymous shared notepad — one URL, one pad, no account.",
    href: "https://temp.zyx.tw",
    preview: "/previews/temp.zyx.tw.webp",
  },
  {
    name: "link.zyx.tw",
    description: "URL shortener — paste a long one, get a short one back.",
    href: "https://link.zyx.tw",
    preview: "/previews/link.zyx.tw.webp",
  },
  {
    name: "time.zyx.tw",
    description: "What time is it? A clock, that's all.",
    href: "https://time.zyx.tw",
    preview: "/previews/time.zyx.tw.webp",
  },
] as const

function shuffle<T>(input: readonly T[]): T[] {
  const out = input.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = out[i] as T
    out[i] = out[j] as T
    out[j] = tmp
  }
  return out
}

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { ref: headingRef, inView } = useInView()

  // Server renders the static list; client shuffles after hydration so
  // every reload surfaces a different opener without an SSR mismatch.
  const [order, setOrder] = useState<Project[]>(() => PROJECTS.slice())
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate one-shot client shuffle, see comment above
    setOrder(shuffle(PROJECTS))
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })

  const x = useTransform(scrollYProgress, (p) => {
    const track = trackRef.current
    if (!track) return 0
    const max = track.scrollWidth - window.innerWidth
    return -p * Math.max(0, max)
  })

  return (
    <section
      ref={sectionRef}
      className="relative h-[500dvh] w-dvw"
      aria-label="Projects"
    >
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <m.h2
          ref={headingRef as React.RefObject<HTMLHeadingElement>}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={spring}
          className="px-6 text-center text-2xl font-medium sm:text-3xl"
        >
          Things I&apos;ve built.
        </m.h2>
        <m.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...spring, delay: 0.1 }}
          className="px-6 pt-3 pb-10 text-center text-sm text-muted-foreground"
        >
          Side projects, lab work, and corners of the internet I keep alive.
        </m.p>
        <m.div
          ref={trackRef}
          style={{ x }}
          className="flex shrink-0 items-stretch gap-6 px-8 will-change-transform sm:gap-8 sm:px-12"
        >
          {order.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </m.div>
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const { name, description, href, preview } = project

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-[280px] shrink-0 flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-foreground/30 sm:w-[340px]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-muted/40">
        <Image
          src={preview}
          alt={`Preview of ${name}`}
          width={680}
          height={383}
          sizes="(min-width: 640px) 340px, 280px"
          loading="lazy"
          className="h-full w-full object-cover object-top"
        />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <h3 className="text-lg font-medium transition-colors group-hover:text-brand sm:text-xl">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {description}
        </p>
      </div>
    </Link>
  )
}
