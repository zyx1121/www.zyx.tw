"use client"

import Link from "next/link"
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

import {
  describeEvent,
  type EventKind,
  type Heatmap,
  type HeatmapDay,
  type StatusData,
} from "@workspace/ui/lib/github-events"
import { GITHUB_USER, STATUS_COPY } from "@workspace/ui/lib/profile"
import { timeAgo } from "@workspace/ui/lib/time-ago"

import { cn } from "../lib/utils"

const ICON: Record<EventKind, IconType> = {
  commit: VscGitCommit,
  "pull-request": VscGitPullRequest,
  issue: VscIssues,
  star: VscStarFull,
  fork: VscRepoForked,
  repo: VscRepo,
  tag: VscTag,
}

// Each day is one character, so the heatmap reads like terminal output.
// The glyph is full width in CJK monospace fonts, so a cell is square.
const LEVEL_CLASS: Record<HeatmapDay["contributionLevel"], string> = {
  NONE: "text-muted",
  FIRST_QUARTILE: "text-foreground/25",
  SECOND_QUARTILE: "text-foreground/50",
  THIRD_QUARTILE: "text-foreground/75",
  FOURTH_QUARTILE: "text-foreground",
}

const GLYPH = "\u25a0"

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export function HeatmapGrid({ heatmap }: { heatmap: Heatmap }) {
  const days = heatmap.weeks.flatMap((w) => w.contributionDays)
  return (
    // One column per week; the font size makes each character one column
    // wide, so the grid fills the width at any screen size.
    <div className="@container w-full">
      <div
        className="grid grid-flow-col grid-rows-7 leading-none select-none"
        style={{
          gridTemplateColumns: `repeat(${heatmap.weeks.length}, minmax(0, 1fr))`,
          fontSize: `${100 / heatmap.weeks.length}cqw`,
        }}
      >
        {days.map((day) => (
          <span
            key={day.date}
            title={`${dateFmt.format(new Date(day.date))}: ${day.contributionCount} contribution${
              day.contributionCount === 1 ? "" : "s"
            }`}
            className={cn("text-center", LEVEL_CLASS[day.contributionLevel])}
          >
            {GLYPH}
          </span>
        ))}
      </div>
    </div>
  )
}

export function Status({
  data,
  className,
}: {
  data: StatusData
  className?: string
}) {
  return (
    <section aria-labelledby="status-heading" className={className}>
      <h2 id="status-heading" className="text-body font-medium">
        {STATUS_COPY.title}
      </h2>
      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-body text-muted-foreground transition-colors hover:text-foreground"
          >
            <SiGithub className="h-4 w-4" aria-hidden="true" />
            <span>@{GITHUB_USER}</span>
          </Link>
          {data.heatmap && (
            <span className="text-caption text-muted-foreground tabular-nums">
              {data.heatmap.totalContributions.toLocaleString()} contributions
              this year
            </span>
          )}
        </div>

        {data.heatmap && (
          <div className="mt-5">
            <HeatmapGrid heatmap={data.heatmap} />
          </div>
        )}

        <ul className="mt-5 space-y-3">
          {data.events.length === 0 && (
            <li className="text-body text-muted-foreground">
              {STATUS_COPY.empty}
            </li>
          )}
          {data.events.map((e) => {
            const { kind, text } = describeEvent(e)
            const Icon = ICON[kind]
            return (
              <li
                key={e.id}
                className="flex items-baseline gap-3 text-body text-muted-foreground"
              >
                <Icon
                  className="h-4 w-4 shrink-0 translate-y-0.5 text-muted-foreground"
                  aria-hidden="true"
                />
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
                {/* The page is prerendered (ISR, 5 min), so the server's
                    "3m ago" is stale by the time the client hydrates and
                    recomputes it. The client value is the right one; suppress
                    the text-mismatch warning instead of forcing a match. */}
                <span
                  className="shrink-0 text-caption text-muted-foreground tabular-nums"
                  suppressHydrationWarning
                >
                  {timeAgo(e.created_at)}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
