"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { decodeText } from "@/components/page-decode"
import { useShowcase } from "@/components/showcase"
import { AsciiPreview } from "@/lib/ascii-preview"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Long enough to outrun any frame; the boxes clip the rest.
const HORIZONTAL = "─".repeat(400)
const VERTICAL = "│".repeat(200)

/**
 * The works page's terminal window: a box-drawn frame whose title bar names
 * the project on stage and its purpose, around the project's screenshot drawn
 * in characters (lib/ascii-preview.ts). At rest the picture takes the text
 * color; a hovered or focused row, or a tap on touch screens, decodes it to
 * the screenshot's colors. Decorative: the list carries the links, so the
 * whole window is hidden from assistive tech.
 */
export function ProjectWindow({ className }: { className?: string }) {
  const { projects, active, decoded, engagement, toggleHold } = useShowcase()
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<AsciiPreview | null>(null)
  const images = useRef<(HTMLImageElement | undefined)[]>([])
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set())
  const [theme, setTheme] = useState(0)
  const project = projects[active]

  // One image per project, the one on stage first and the rest when idle.
  useEffect(() => {
    const load = (index: number) => {
      if (images.current[index]) return
      const src = projects[index]?.preview.image
      if (!src) return
      const image = new Image()
      images.current[index] = image
      image.src = src
      image
        .decode()
        .then(() => setLoaded((previous) => new Set(previous).add(index)))
        .catch(() => undefined)
    }
    load(active)
    const loadAll = () => projects.forEach((_, index) => load(index))
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(loadAll, { timeout: 3000 })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(loadAll, 1500)
    return () => clearTimeout(id)
  }, [projects, active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const preview = new AsciiPreview(canvas)
    previewRef.current = preview
    const resize = new ResizeObserver(() => preview.resize())
    resize.observe(canvas)
    // The ramp runs the other way in light theme.
    const themeObserver = new MutationObserver(() => setTheme((n) => n + 1))
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    // Canvas text cannot start a webfont load; once the face is in, redraw.
    // The load rejects when a fallback face is missing (no Arial on Linux),
    // and the face is in all the same.
    document.fonts
      ?.load(`10px ${getComputedStyle(canvas).fontFamily}`)
      .catch(() => undefined)
      .then(() => preview.resize())
    return () => {
      resize.disconnect()
      themeObserver.disconnect()
      preview.destroy()
      previewRef.current = null
    }
  }, [])

  // Show the project on stage, decoding from the one before.
  const isLoaded = loaded.has(active)
  useEffect(() => {
    const image = images.current[active]
    const preview = previewRef.current
    if (!isLoaded || !image || !preview) return
    preview.show(
      { image, focus: project?.preview.focus ?? "50% 50%", color: decoded },
      !reducedMotion
    )
  }, [active, isLoaded, decoded, engagement, reducedMotion, project])

  useEffect(() => {
    previewRef.current?.refresh()
  }, [theme])

  // A new project's title decodes in with its picture. The first one decodes
  // with the rest of the page.
  const first = useRef(true)
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const title = titleRef.current
    if (!title || reducedMotion) return
    return decodeText(title)
  }, [active, reducedMotion])

  return (
    <div
      aria-hidden
      data-slot="project-window"
      className={cn(
        "flex min-w-0 flex-col bg-background leading-none text-muted-foreground select-none",
        className
      )}
      onPointerUp={(event) => {
        if (event.pointerType !== "mouse") toggleHold()
      }}
    >
      <div ref={titleRef} className="flex whitespace-nowrap">
        <span>{"┌─ "}</span>
        <span key={`name-${active}`} className="text-foreground">
          {project?.name}
        </span>
        <Rule className="ml-2 min-w-4" />
        <span key={`purpose-${active}`} className="ml-2 truncate max-sm:hidden">
          {project?.purpose}
        </span>
        <span className="sm:ml-2">{"─┐"}</span>
      </div>
      {/* The bars and the canvas are absolute in their boxes, so neither
          the long bars nor the canvas's own pixel size can grow the frame. */}
      <div className="flex min-h-0 flex-1">
        <span className="relative w-2 shrink-0 overflow-hidden">
          <span className="absolute inset-x-0 top-0 break-all">{VERTICAL}</span>
        </span>
        <span className="relative min-w-0 flex-1">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 size-full text-foreground"
          />
        </span>
        <span className="relative w-2 shrink-0 overflow-hidden">
          <span className="absolute inset-x-0 top-0 break-all">{VERTICAL}</span>
        </span>
      </div>
      <div className="flex whitespace-nowrap">
        <span>{"└"}</span>
        <Rule />
        <span>{"┘"}</span>
      </div>
    </div>
  )
}

/** A horizontal bar that fills its row without adding to the row's width. */
function Rule({ className }: { className?: string }) {
  return (
    <span className={cn("relative min-w-0 flex-1 overflow-hidden", className)}>
      <span className="absolute inset-x-0 top-0">{HORIZONTAL}</span>
    </span>
  )
}
