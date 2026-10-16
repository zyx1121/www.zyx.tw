"use client"

import { useEffect, useRef } from "react"

import { useReducedMotion } from "@/lib/use-reduced-motion"

/** Pixels the hills shift with the mouse at the window's edge; the sky shifts much less. */
const SHIFT_X = 14
const SHIFT_Y = 8

/**
 * The Bliss hills in front of the mark. With a mouse, they shift a little
 * against the pointer, more than the sky does, for depth. The layer is
 * larger than the window so the shift never shows an edge.
 */
export function HomeHill() {
  const image = useRef<HTMLImageElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const element = image.current
    if (!element || reduced) return
    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let last = performance.now()
    let frame = 0

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      targetX = (event.clientX / window.innerWidth) * 2 - 1
      targetY = (event.clientY / window.innerHeight) * 2 - 1
    }
    const leave = () => {
      targetX = 0
      targetY = 0
    }
    // The same easing as the sky's, so the layers move together.
    const tick = (now: number) => {
      const ease = 1 - Math.exp(((now - last) / 1000) * -4)
      last = now
      x += (targetX - x) * ease
      y += (targetY - y) * ease
      element.style.translate = `${(-x * SHIFT_X).toFixed(2)}px ${(-y * SHIFT_Y).toFixed(2)}px`
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", move)
    document.documentElement.addEventListener("pointerleave", leave)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", move)
      document.documentElement.removeEventListener("pointerleave", leave)
      element.style.translate = ""
    }
  }, [reduced])

  return (
    <div className="pointer-events-none absolute -inset-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- a cover layer over the scene, not a photo. */}
      <img
        ref={image}
        src="/bliss-hill.webp"
        alt=""
        className="size-full max-w-none object-cover"
      />
    </div>
  )
}
