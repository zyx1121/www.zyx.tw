"use client"

import { useEffect, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/ui/tooltip"

const MS_PER_DAY = 86_400_000
const BIRTHDAY = "2002-11-21"

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

export function DaysAlive() {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const birthDate = new Date(BIRTHDAY)
  const elapsedMs = now === null ? null : now - birthDate.getTime()
  const days =
    elapsedMs === null ? null : Math.max(0, Math.floor(elapsedMs / MS_PER_DAY))

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="fixed bottom-4 left-4 z-50 cursor-default font-mono text-sm text-muted-foreground tabular-nums">
            {days === null ? "" : days.toLocaleString()}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="start">
          <span className="tabular-nums">
            {now === null ? "—" : formatBreakdown(birthDate, new Date(now))}
          </span>
          <br />
          <span className="text-background/60">since {BIRTHDAY}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
