"use client"

import { useEffect, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip"
import { BIRTHDAY, daysAlive } from "@workspace/ui/lib/profile"
import { cn } from "@workspace/ui/lib/utils"

// Anniversary-based breakdown — leap-year safe.
function formatBreakdown(birthday: Date, now: Date) {
  let years = now.getFullYear() - birthday.getFullYear()
  const anniversary = new Date(birthday)
  anniversary.setFullYear(now.getFullYear())
  if (now < anniversary) {
    years -= 1
    anniversary.setFullYear(anniversary.getFullYear() - 1)
  }

  const totalSec = Math.floor((now.getTime() - anniversary.getTime()) / 1000)
  const days = Math.floor(totalSec / 86_400)
  const h = Math.floor((totalSec % 86_400) / 3_600)
  const m = Math.floor((totalSec % 3_600) / 60)
  const s = totalSec % 60
  return `${years}y ${days}d ${h}h ${m}m ${s}s`
}

/** Days since the birthday; the tooltip breaks it down to the second. */
export function DaysAlive({ className }: { className?: string }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const birthDate = new Date(BIRTHDAY)
  const days = now === null ? null : daysAlive(now)

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              "cursor-default text-muted-foreground tabular-nums",
              className
            )}
          />
        }
      >
        {days === null ? "" : days.toLocaleString()}
      </TooltipTrigger>
      <TooltipContent side="top">
        <span>
          <span className="tabular-nums">
            {now === null ? "" : formatBreakdown(birthDate, new Date(now))}
          </span>
          <br />
          <span className="text-background/60">since {BIRTHDAY}</span>
        </span>
      </TooltipContent>
    </Tooltip>
  )
}
