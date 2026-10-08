"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@workspace/ui/components/ui/button"

import { FILM } from "@/lib/content"

/*
 * The 30-second product film, silent. It plays on its own unless the
 * visitor asks for reduced motion, and it can always be paused.
 */
export function Film({ id, className }: { id?: string; className?: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const element = video.current
    if (!element) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    element.play().catch(() => {})
  }, [])

  return (
    <figure id={id} className={className}>
      <video
        ref={video}
        src="/stamp-promo.mp4"
        poster="/stamp-promo-poster.jpg"
        width={1920}
        height={1080}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={FILM.caption}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="aspect-video w-full rounded-control bg-muted"
      />
      <figcaption className="mt-3 flex items-start justify-between gap-5">
        <p className="text-caption text-muted-foreground">{FILM.caption}</p>
        <Button
          variant="ghost"
          className="-my-2.5 -mr-4"
          onClick={() => {
            const element = video.current
            if (!element) return
            if (element.paused) element.play().catch(() => {})
            else element.pause()
          }}
        >
          {playing ? "Pause" : "Play"}
        </Button>
      </figcaption>
    </figure>
  )
}
