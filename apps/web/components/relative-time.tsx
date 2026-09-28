"use client"

import { useEffect, useState } from "react"

import { timeAgo } from "@workspace/ui/lib/time-ago"
import { cn } from "@workspace/ui/lib/utils"

/**
 * "3h ago" for `date`. The first render counts from `renderedAt`, the moment
 * the server rendered the page, so it hydrates to the same text; then it
 * counts from the visitor's clock, once a minute. The widest value it
 * normally shows sits invisible in the same grid cell, so a longer or
 * shorter value never moves what is beside it.
 */
export function RelativeTime({
  date,
  renderedAt,
  className,
}: {
  date: string
  renderedAt: number
  className?: string
}) {
  const [now, setNow] = useState(renderedAt)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      className={cn("inline-grid justify-items-end tabular-nums", className)}
    >
      <span aria-hidden className="invisible [grid-area:1/1]">
        00m ago
      </span>
      <time dateTime={date} className="[grid-area:1/1]">
        {timeAgo(date, now)}
      </time>
    </span>
  )
}
