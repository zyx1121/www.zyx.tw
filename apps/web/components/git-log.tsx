"use client"

import { HeatmapGrid } from "@workspace/ui/components/status"
import { describeEvent, type StatusData } from "@workspace/ui/lib/github-events"
import { STATUS_COPY } from "@workspace/ui/lib/profile"
import { timeAgo } from "@workspace/ui/lib/time-ago"

import { SectionTitle } from "@workspace/ui/components/section-title"
import { Command } from "@workspace/ui/components/shell"

const LINK =
  "terminal-link underline decoration-muted-foreground/40 underline-offset-4"

/**
 * About's GitHub status as terminal output: `git log` with one line per
 * recent event in About's columns (when, what, where), then the year's
 * contributions as a character heatmap.
 */
export function GitLog({
  data,
  className,
}: {
  data: StatusData
  className?: string
}) {
  const profile = `https://github.com/${data.user}`
  return (
    <section aria-labelledby="status-heading" className={className}>
      <SectionTitle id="status-heading" title={STATUS_COPY.title} />
      <Command className="mt-5">git log</Command>
      <ol className="mt-3 flex flex-col gap-y-3">
        {data.events.length === 0 && (
          <li className="text-muted-foreground">{STATUS_COPY.empty}</li>
        )}
        {data.events.map((event) => (
          <li key={event.id} className="flex gap-x-5">
            {/* The page is prerendered (ISR, 5 min), so the server's
                "3m ago" is stale by the time the client hydrates; the
                client's value is the right one. */}
            <span
              className="w-28 shrink-0 text-caption whitespace-nowrap text-muted-foreground tabular-nums"
              suppressHydrationWarning
            >
              {timeAgo(event.created_at)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-x-5 sm:flex-row sm:justify-between">
              <span>{describeEvent(event).text}</span>
              <span className="min-w-0 truncate text-muted-foreground">
                <a
                  href={`https://github.com/${event.repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  {event.repo.name}
                </a>
              </span>
            </div>
          </li>
        ))}
      </ol>
      {data.heatmap && (
        <>
          <div className="mt-10">
            <HeatmapGrid heatmap={data.heatmap} />
          </div>
          <p className="mt-3 flex justify-between gap-x-5 text-caption text-muted-foreground">
            <a
              href={profile}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
            >
              @{data.user}
            </a>
            <span className="tabular-nums">
              {data.heatmap.totalContributions.toLocaleString("en-US")}{" "}
              contributions this year
            </span>
          </p>
        </>
      )}
    </section>
  )
}
