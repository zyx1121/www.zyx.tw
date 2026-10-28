"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { OceanEngine } from "@/lib/pond/engine"
import type { SharkSpec } from "@/lib/pond/world"

/** Two koi of random variety and pattern, the second a little smaller. */
function randomKoi(): SharkSpec[] {
  const pick = () => Math.floor(Math.random() * 1000)
  return [
    { kind: "koi", size: 1, variety: pick(), pattern: pick() },
    { kind: "koi", size: 0.85, variety: pick(), pattern: pick() },
  ]
}

/** The pages the pond swims behind. */
const POND_PATHS = ["/works", "/about"]

/**
 * ASCII koi swimming behind the page, dimmed so they stay a backdrop. It
 * lives in the root layout, so the same pond carries on across the pages
 * above instead of restarting on each. Elsewhere the canvas is hidden, and
 * the engine stops drawing while it is out of view. The water is
 * transparent; in light theme the canvas is inverted, with the hue turned
 * back, so light ink on dark becomes dark ink on paper.
 */
export function PondBackground() {
  const ref = useRef<HTMLCanvasElement>(null)
  const pathname = usePathname()
  const shown = POND_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const engine = new OceanEngine(canvas, randomKoi(), {
      cellScale: 0.6,
      intensity: 0.75,
      glyphOnly: true,
      grid: false,
      speed: 0.6,
    })
    return () => engine.destroy()
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 size-full font-mono hue-rotate-180 invert dark:hue-rotate-0 dark:invert-0",
        !shown && "hidden"
      )}
    />
  )
}
