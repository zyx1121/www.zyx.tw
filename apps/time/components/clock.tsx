"use client"
import { T } from "@workspace/ui/components/locale-provider"

import { useEffect, useState } from "react"

import { SITE_DESC, SITE_NAME } from "@/lib/site"

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

export function Clock() {
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
    <main className="flex min-h-dvh w-dvw items-center justify-center px-5">
      <h1 className="sr-only">
        <T>{SITE_NAME}</T>
      </h1>
      <p className="sr-only">
        <T>{SITE_DESC}</T>
      </p>
      <span className="max-w-full text-center text-display font-bold tabular-nums">
        {time
          ? time.split(":").map((part, index) => (
              <span key={index} className="inline-block">
                <T>{part}</T>
                <T>{index < 2 ? ":" : ""}</T>
                <wbr />
              </span>
            ))
          : "…"}
      </span>
    </main>
  )
}
