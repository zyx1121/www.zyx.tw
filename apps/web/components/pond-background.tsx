"use client"

import { useEffect, useRef } from "react"

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

/**
 * ASCII koi swimming behind the page, dimmed so they stay a backdrop. Dark
 * theme only: the water is black. The canvas is hidden in light theme, and
 * the engine stops drawing while it is out of view.
 */
export function PondBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

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
      className="pointer-events-none fixed inset-0 -z-10 hidden size-full font-mono dark:block"
    />
  )
}
