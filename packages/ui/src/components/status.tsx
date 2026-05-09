"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { SiGithub } from "react-icons/si"
import {
  VscGitCommit,
  VscGitPullRequest,
  VscIssues,
  VscRepo,
  VscRepoForked,
  VscStarFull,
  VscTag,
} from "react-icons/vsc"
import type { IconType } from "react-icons"

import { useInView } from "@workspace/ui/hooks/use-in-view"
import { cn } from "@workspace/ui/lib/utils"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

type GhEvent = {
  id: string
  type: string
  repo: { name: string; url: string }
  payload: Record<string, unknown>
  created_at: string
}

type HeatmapDay = {
  date: string
  contributionCount: number
  contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE"
}

type Heatmap = {
  totalContributions: number
  weeks: { contributionDays: HeatmapDay[] }[]
}

type ApiResponse = {
  user: string
  events: GhEvent[]
  heatmap: Heatmap | null
}

const LEVEL_CLASS: Record<HeatmapDay["contributionLevel"], string> = {
  NONE: "bg-muted",
  FIRST_QUARTILE: "bg-brand/25",
  SECOND_QUARTILE: "bg-brand/50",
  THIRD_QUARTILE: "bg-brand/75",
  FOURTH_QUARTILE: "bg-brand",
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}w ago`
}

function describe(e: GhEvent): { icon: IconType; text: string } {
  switch (e.type) {
    case "PushEvent": {
      const ref = (e.payload.ref as string) ?? ""
      const branch = ref.replace(/^refs\/heads\//, "") || "a branch"
      return { icon: VscGitCommit, text: `Pushed to ${branch}` }
    }
    case "PullRequestEvent": {
      const action = (e.payload.action as string) ?? "updated"
      return { icon: VscGitPullRequest, text: `${cap(action)} a PR` }
    }
    case "IssuesEvent": {
      const action = (e.payload.action as string) ?? "updated"
      return { icon: VscIssues, text: `${cap(action)} an issue` }
    }
    case "WatchEvent":
      return { icon: VscStarFull, text: "Starred" }
    case "ForkEvent":
      return { icon: VscRepoForked, text: "Forked" }
    case "CreateEvent": {
      const refType = (e.payload.ref_type as string) ?? "ref"
      return { icon: VscRepo, text: `Created ${refType}` }
    }
    case "ReleaseEvent": {
      const tag =
        ((e.payload.release as { tag_name?: string })?.tag_name as string) ?? ""
      return { icon: VscTag, text: `Released ${tag}`.trim() }
    }
    case "PublicEvent":
      return { icon: VscRepo, text: "Made public" }
    default:
      return { icon: VscRepo, text: e.type }
  }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function HeatmapGrid({ heatmap }: { heatmap: Heatmap }) {
  const days = heatmap.weeks.flatMap((w) => w.contributionDays)
  return (
    <div
      className="grid w-full grid-flow-col grid-rows-7 gap-[3px]"
      style={{
        gridTemplateColumns: `repeat(${heatmap.weeks.length}, minmax(0, 1fr))`,
      }}
    >
      {days.map((day) => (
        <div
          key={day.date}
          title={`${dateFmt.format(new Date(day.date))} — ${day.contributionCount} contribution${
            day.contributionCount === 1 ? "" : "s"
          }`}
          className={cn(
            "aspect-square rounded-[2px]",
            LEVEL_CLASS[day.contributionLevel]
          )}
        />
      ))}
    </div>
  )
}

export function Status() {
  const { ref, inView } = useInView()
  const [data, setData] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/github")
      .then((r) => r.json())
      .then((d: ApiResponse & { error?: string }) => {
        if (cancelled) return
        if (d.error) setError(d.error)
        setData(d)
      })
      .catch(() => !cancelled && setError("fetch_failed"))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      aria-label="Status"
      className="flex h-dvh w-dvw flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={spring}
        className="text-2xl font-medium sm:text-3xl"
      >
        Status.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.1 }}
        className="max-w-md text-sm text-muted-foreground"
      >
        A peek at what I&apos;ve been messing with lately.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ ...spring, delay: 0.2 }}
        className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 text-left"
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            href="https://github.com/zyx1121"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <SiGithub className="h-4 w-4" />
            <span>@zyx1121</span>
          </Link>
          {data?.heatmap && (
            <span className="text-xs text-muted-foreground">
              {data.heatmap.totalContributions.toLocaleString()} contributions
              this year
            </span>
          )}
        </div>

        {data?.heatmap && (
          <div className="mt-5">
            <HeatmapGrid heatmap={data.heatmap} />
          </div>
        )}

        <ul className="mt-5 space-y-3">
          {data === null && !error && (
            <li className="text-sm text-muted-foreground">Loading…</li>
          )}
          {error && (
            <li className="text-sm text-muted-foreground">
              GitHub is being shy ({error}).
            </li>
          )}
          {data?.events.length === 0 && !error && (
            <li className="text-sm text-muted-foreground">
              No public activity in the last few days.
            </li>
          )}
          {data?.events.map((e) => {
            const { icon: Icon, text } = describe(e)
            return (
              <li
                key={e.id}
                className="flex items-baseline gap-3 text-sm text-muted-foreground"
              >
                <Icon className="h-4 w-4 shrink-0 translate-y-0.5 text-muted-foreground" />
                <span className="flex-1 truncate">
                  <span className="text-foreground">{text}</span>
                  <span> in </span>
                  <Link
                    href={`https://github.com/${e.repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 transition-colors hover:text-foreground"
                  >
                    {e.repo.name}
                  </Link>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground/70 tabular-nums">
                  {timeAgo(e.created_at)}
                </span>
              </li>
            )
          })}
        </ul>
      </motion.div>
    </section>
  )
}
