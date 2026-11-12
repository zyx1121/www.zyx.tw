"use client"

import { useEffect, useRef } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { LEAVE_EVENT, OUT } from "@workspace/ui/components/page-decode"
import { ScanPreview } from "@/lib/scan-preview"
import { useReducedMotion } from "@/lib/use-reduced-motion"

/**
 * A project page's screenshot, loading in from the top as in the works
 * window (lib/scan-preview.ts) and taken back from the bottom when the page
 * leaves. Reduced motion shows it at once. The lead picture is decorative,
 * since the page's text says what the project is; a section's picture
 * carries its own description in `alt`.
 */
export function ProjectPicture({
  src,
  focus = "50% 50%",
  ratio = "standard",
  alt,
  className,
}: {
  src: string
  focus?: string
  /** The box before the file loads: 4:3, or 16:9 for a wide picture. */
  ratio?: "standard" | "wide"
  /** Names the picture when the text beside it does not. */
  alt?: string
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
    <div
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={cn(
        "relative w-full",
        ratio === "wide" ? "aspect-video" : "aspect-4/3",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 size-full"
      />
    </div>
  )
}
