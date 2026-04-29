"use client"

import { useEffect, useState } from "react"

const MS_PER_DAY = 86_400_000

type DaysAliveProps = {
  birthday: string
}

export function DaysAlive({ birthday }: DaysAliveProps) {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    const compute = () => {
      const ms = Date.now() - new Date(birthday).getTime()
      setDays(Math.max(0, Math.floor(ms / MS_PER_DAY)))
    }
    compute()
    const id = setInterval(compute, 60_000)
    return () => clearInterval(id)
  }, [birthday])

  return (
    <span className="fixed bottom-4 left-4 z-50 font-mono text-sm text-muted-foreground tabular-nums">
      {days === null ? "" : days.toLocaleString()}
    </span>
  )
}
