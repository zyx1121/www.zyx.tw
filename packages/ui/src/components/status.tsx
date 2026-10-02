"use client"
import { T, useLocale, useT } from "@workspace/ui/components/locale-provider"

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
import { cn } from "@workspace/ui/lib/utils"

const ICON: Record<EventKind, IconType> = {
  commit: VscGitCommit,
  "pull-request": VscGitPullRequest,
  issue: VscIssues,
  star: VscStarFull,
  fork: VscRepoForked,
  repo: VscRepo,
  tag: VscTag,
}

const LEVEL_CLASS: Record<HeatmapDay["contributionLevel"], string> = {
  NONE: "bg-muted",
  FIRST_QUARTILE: "bg-foreground/25",
  SECOND_QUARTILE: "bg-foreground/50",
  THIRD_QUARTILE: "bg-foreground/75",
  FOURTH_QUARTILE: "bg-foreground",
}

function HeatmapGrid({ heatmap }: { heatmap: Heatmap }) {
  const locale = useLocale()
  const t = useT()
  const dateFmt = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
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
          title={t("{date}: {count} contributions", {
            date: dateFmt.format(new Date(day.date)),
            count: day.contributionCount,
          })}
          className={cn(
            "aspect-square rounded-[2px]",
            LEVEL_CLASS[day.contributionLevel]
          )}
        />
      ))}
    </div>
  )
}

export function Status({
  data,
  className,
  style,
}: {
  data: StatusData
  className?: string
  style?: React.CSSProperties
}) {
  const locale = useLocale()
  const t = useT()
  return (
    <section
      aria-labelledby="status-heading"
      className={className}
      style={style}
    >
      <h2 id="status-heading" className="text-sm/6 font-medium">
        <T>{STATUS_COPY.title}</T>
      </h2>
      <div className="mt-5 rounded-lg bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <SiGithub className="h-4 w-4" aria-hidden="true" />
            <span>
              @<T>{GITHUB_USER}</T>
            </span>
          </Link>
          {data.heatmap && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {t("{count} contributions this year", {
                count: data.heatmap.totalContributions.toLocaleString(locale),
              })}
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
            <li className="text-sm text-muted-foreground">
              <T>{STATUS_COPY.empty}</T>
            </li>
          )}
          {data.events.map((e) => {
            const { kind, text } = describeEvent(e, locale)
            const Icon = ICON[kind]
            return (
              <li
                key={e.id}
                className="flex items-baseline gap-3 text-sm text-muted-foreground"
              >
                <Icon
                  className="h-4 w-4 shrink-0 translate-y-0.5 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">
                  <span className="text-foreground">
                    <T>{text}</T>
                  </span>
                  <span>
                    <T>{" in "}</T>
                  </span>
                  <Link
                    href={`https://github.com/${e.repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 transition-colors hover:text-foreground"
                  >
                    <T>{e.repo.name}</T>
                  </Link>
                </span>
                {/* The page is prerendered (ISR, 5 min), so the server's
                    "3m ago" is stale by the time the client hydrates and
                    recomputes it. The client value is the right one; suppress
                    the text-mismatch warning instead of forcing a match. */}
                <span
                  className="shrink-0 text-xs text-muted-foreground tabular-nums"
                  suppressHydrationWarning
                >
                  <T>{timeAgo(e.created_at, Date.now(), locale)}</T>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
