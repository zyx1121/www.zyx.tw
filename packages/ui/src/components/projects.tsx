"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { SiGithub } from "react-icons/si"

import { useInView } from "@workspace/ui/hooks/use-in-view"

type Project = {
  name: string
  description: string
  href: string
  web: boolean
}

const PROJECTS: Project[] = [
  {
    name: "winlab.tw",
    description: "WinLab — Wireless Internet Laboratory",
    href: "https://winlab.tw",
    web: true,
  },
  {
    name: "ai.winlab.tw",
    description: "NYCU Office of AI Affairs — institutional website",
    href: "https://ai.winlab.tw",
    web: true,
  },
  {
    name: "gallery.winlab.tw",
    description: "Art from NYCU WinLab",
    href: "https://gallery.winlab.tw",
    web: true,
  },
  {
    name: "scriptorium",
    description:
      "Self-hosted LLM wiki for teams — Karpathy's pattern over Postgres + MCP",
    href: "https://github.com/zyx1121/scriptorium",
    web: false,
  },
  {
    name: "link.zyx.tw",
    description: "URL shortener",
    href: "https://link.zyx.tw",
    web: true,
  },
] as const

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

function parseGithubRepo(url: string) {
  const m = url.match(/^https?:\/\/github\.com\/([\w-]+\/[\w.-]+?)\/?$/)
  return m ? m[1] : null
}

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { ref: headingRef, inView } = useInView()

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
      className="relative h-[300dvh] w-dvw"
      aria-label="Projects"
    >
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <motion.h2
          ref={headingRef as React.RefObject<HTMLHeadingElement>}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={spring}
          className="px-6 text-center text-2xl font-medium sm:text-3xl"
        >
          Things I&apos;ve built.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...spring, delay: 0.1 }}
          className="px-6 pt-3 pb-10 text-center text-sm text-muted-foreground"
        >
          Side projects, lab work, and corners of the internet I keep alive.
        </motion.p>
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex shrink-0 items-stretch gap-6 px-8 will-change-transform sm:gap-8 sm:px-12"
        >
          {PROJECTS.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const { name, description, href, web } = project
  const repo = !web ? parseGithubRepo(href) : null
  const [thumb, setThumb] = useState<string | null>(null)

  useEffect(() => {
    if (!repo) return
    let cancelled = false
    fetch(`/api/repo-thumbnail?repo=${repo}`)
      .then((r) => (r.ok ? r.json() : { url: null }))
      .then((d: { url: string | null }) => {
        if (!cancelled) setThumb(d.url)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [repo])

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-[280px] shrink-0 flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-foreground/30 sm:w-[340px]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-muted/40">
        {web ? (
          <iframe
            src={href}
            title={name}
            scrolling="no"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            className="pointer-events-none origin-top-left"
            style={{
              width: "400%",
              height: "400%",
              transform: "scale(0.25)",
            }}
          />
        ) : thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <SiGithub className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
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
