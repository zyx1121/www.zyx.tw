"use client"

import { useEffect, useRef } from "react"

import type { SceneV1 } from "@workspace/3d"

import { LEAVE_EVENT, OUT } from "@workspace/ui/components/page-decode"
import { POND_CELL_SCALE } from "@/components/pond-background"
import type { AsciiMark } from "@/lib/ascii-mark"
import sceneFile from "@/lib/home-scene.json"
import { markObstacle } from "@/lib/pond/obstacle"
import { glyphFont } from "@/lib/pond/renderer"
import { useReducedMotion } from "@/lib/use-reduced-motion"

/** The mark as saved from 3d.zyx.tw, with the rounder edges the home uses. */
const SHAPE = { ...sceneFile.shape, bevel: 0.12 } as SceneV1["shape"]

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

/**
 * The zyx mark in characters on the pond's grid, swaying slowly over the
 * water; a drag on it turns it and throws it. The fish and koi swim around
 * it (lib/ascii-mark.ts). It decodes in once three.js is up, and scrambles
 * out with the page when a link leaves the home. three.js loads after the page, and without WebGL
 * the home is the pond alone. Decorative: the page's heading names the site.
 */
export function HomeMark() {
  const ref = useRef<HTMLCanvasElement>(null)
  const markRef = useRef<AsciiMark | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let cancelled = false
    let stop = () => {}
    void import("@/lib/ascii-mark").then(({ AsciiMark }) => {
      if (cancelled) return
      let mark: AsciiMark
      try {
        mark = new AsciiMark(canvas, SHAPE, markObstacle, POND_CELL_SCALE)
      } catch {
        return
      }
      const family = getComputedStyle(canvas).fontFamily
      const paint = () =>
        mark.setColors(
          getComputedStyle(canvas).color,
          getComputedStyle(document.documentElement).getPropertyValue(
            "--background"
          )
        )
      const resize = new ResizeObserver(() => mark.resize(family))
      resize.observe(canvas)
      const theme = new MutationObserver(paint)
      theme.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      })
      paint()
      mark.resize(family)
      // Glyphs drawn on a canvas cannot start a webfont load; once the face
      // is in, draw them again. The load rejects when a fallback face is
      // missing (no Arial on Linux), and the face is in all the same.
      document.fonts
        ?.load(glyphFont(16, family))
        .catch(() => undefined)
        .then(() => {
          if (!cancelled) mark.resize(family)
        })
      mark.setMotion(!window.matchMedia(REDUCED_MOTION).matches)
      mark.enter()
      const leave = () => mark.leave(OUT)
      document.addEventListener(LEAVE_EVENT, leave)
      markRef.current = mark
      stop = () => {
        document.removeEventListener(LEAVE_EVENT, leave)
        resize.disconnect()
        theme.disconnect()
        mark.destroy()
        markRef.current = null
      }
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [])

  useEffect(() => {
    markRef.current?.setMotion(!reducedMotion)
  }, [reducedMotion])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="size-full touch-pinch-zoom font-mono text-foreground data-dragging:cursor-grabbing data-over:cursor-grab"
    />
  )
}
