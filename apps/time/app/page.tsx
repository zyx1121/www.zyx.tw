"use client"

import { useEffect, useState } from "react"

function formatTime(date: Date): string {
  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

function formatTitleTime(date: Date): string {
  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export default function Page() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(formatTime(now))
      document.title = formatTitleTime(now)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex min-h-dvh w-dvw items-center justify-center">
      <span className="text-[clamp(3rem,12vw,18rem)] font-bold tabular-nums">
        {time ?? "—"}
      </span>
    </div>
  )
}
