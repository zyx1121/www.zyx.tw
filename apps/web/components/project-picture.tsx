"use client"

import { useEffect, useRef } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { LEAVE_EVENT, OUT } from "@workspace/ui/components/page-decode"
import { ScanPreview } from "@/lib/scan-preview"
import { useReducedMotion } from "@/lib/use-reduced-motion"

/**
 * A project page's screenshot, loading in from the top as in the works
 * window (lib/scan-preview.ts) and taken back from the bottom when the page
 * leaves. Reduced motion shows it at once. Decorative: the page's text says
 * what the project is.
 */
export function ProjectPicture({
  src,
  focus,
  className,
}: {
  src: string
  focus: string
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const preview = new ScanPreview(canvas)
    const resize = new ResizeObserver(() => preview.resize())
    resize.observe(canvas)
    let cancelled = false
    const image = new Image()
    image.src = src
    image
      .decode()
      .then(() => {
        if (!cancelled) preview.show({ image, focus }, !reducedMotion)
      })
      .catch(() => undefined)
    const leave = () => preview.leave(OUT)
    document.addEventListener(LEAVE_EVENT, leave)
    return () => {
      cancelled = true
      document.removeEventListener(LEAVE_EVENT, leave)
      resize.disconnect()
      preview.destroy()
    }
  }, [src, focus, reducedMotion])

  return (
    <div aria-hidden className={cn("relative aspect-4/3 w-full", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}
