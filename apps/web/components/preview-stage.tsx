"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"
import { MaskReveal } from "@workspace/ui/components/ui/mask-reveal"

import { useShowcase } from "@/components/showcase"
import { runDecode } from "@/lib/decode"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Every layer fills the box and crops around its project's focus (an
// object-position the canvas decode reads too, so the layers line up).
const LAYER = "absolute inset-0 size-full object-cover"

// Layers appear at once and fade out over 300 ms. A transition takes the
// timing of the state it moves to, so only the hidden state carries one.
const FADE_OUT =
  "opacity-0 motion-safe:transition-opacity motion-safe:duration-overlay"

type Layer = { id: number; index: number }

function load(src: string) {
  const image = new Image()
  image.src = src
  return image.decode().catch(() => undefined)
}

/**
 * The negative space between the hero and the project list. At rest it shows
 * the active project's dithered screenshot, wiping each new one in; a hovered
 * or focused row decodes it to the color screenshot. Decorative: the list
 * carries the links, so the whole stage is hidden from assistive tech.
 */
export function PreviewStage({ className }: { className?: string }) {
  const { projects, active, decoded, engagement, requested, toggleHold } =
    useShowcase()
  const reducedMotion = useReducedMotion()

  // The dither layers, oldest first: the one on screen and the new one wiping
  // over it. Each wipe gets a fresh id, so it remounts and replays, while the
  // layer it covers keeps its element. The first dither never wipes; it is
  // painted with the page and is the stage's LCP candidate.
  const [layers, setLayers] = useState<Layer[]>(() => [
    { id: 0, index: active },
  ])
  const shown = layers[layers.length - 1]?.index ?? active
  useEffect(() => {
    if (active === shown) return
    let live = true
    const src = projects[active]?.preview.dither
    if (!src) return
    // Decode the next dither first, so a wipe never reveals an empty box.
    load(src).then(() => {
      if (!live) return
      setLayers((previous) => {
        const top = previous[previous.length - 1]
        return top ? [top, { id: top.id + 1, index: active }] : previous
      })
    })
    return () => {
      live = false
    }
  }, [active, shown, projects])

  // Dithers are small: fetch the rest once the page is idle.
  useEffect(() => {
    const fetchAll = () =>
      projects.forEach((project) => void load(project.preview.dither))
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(fetchAll, { timeout: 3000 })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(fetchAll, 1500)
    return () => clearTimeout(id)
  }, [projects])

  // Which engagement has its decode on the canvas, and which has finished.
  const [started, setStarted] = useState(-1)
  const [done, setDone] = useState(-1)
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colorRefs = useRef(new Map<number, HTMLImageElement>())

  const focus = projects[active]?.preview.focus ?? "50% 50%"
  useEffect(() => {
    if (!decoded || reducedMotion) return
    const image = colorRefs.current.get(active)
    const canvas = canvasRef.current
    if (!image || !canvas) return
    let live = true
    let stop = () => {}
    image
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (!live) return
        stop = runDecode(canvas, image, {
          focus,
          onStart: () => setStarted(engagement),
          onDone: () => setDone(engagement),
        })
      })
    return () => {
      live = false
      stop()
    }
  }, [decoded, reducedMotion, active, engagement, focus])

  const colorVisible = reducedMotion
    ? decoded && loaded.has(active)
    : decoded && done === engagement
  const canvasVisible =
    decoded && !reducedMotion && started === engagement && done !== engagement

  const ditherOf = (index: number) => projects[index]?.preview.dither ?? ""
  const focusOf = (index: number) => ({
    objectPosition: projects[index]?.preview.focus,
  })

  return (
    <div
      aria-hidden
      data-slot="preview-stage"
      data-decoded={colorVisible ? "" : undefined}
      className={cn(
        "relative isolate overflow-hidden rounded-control bg-background ring-1 ring-foreground/10",
        className
      )}
      onPointerUp={(event) => {
        if (event.pointerType !== "mouse") toggleHold(active)
      }}
    >
      {layers.map(({ id, index }) =>
        id === 0 ? (
          // eslint-disable-next-line @next/next/no-img-element -- the dither must reach the screen unresampled, and the canvas reads these elements
          <img
            key={id}
            src={ditherOf(index)}
            alt=""
            fetchPriority="high"
            className={LAYER}
            style={focusOf(index)}
          />
        ) : (
          <MaskReveal key={id} className="absolute inset-0 size-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
            <img
              src={ditherOf(index)}
              alt=""
              className={LAYER}
              style={focusOf(index)}
            />
          </MaskReveal>
        )
      )}
      {[...requested].map((index) => (
        // eslint-disable-next-line @next/next/no-img-element -- see above
        <img
          key={`color-${index}`}
          ref={(element) => {
            if (element) colorRefs.current.set(index, element)
            else colorRefs.current.delete(index)
          }}
          src={projects[index]?.preview.image}
          alt=""
          decoding="async"
          onLoad={() => setLoaded((previous) => new Set(previous).add(index))}
          className={cn(
            LAYER,
            colorVisible && index === active ? "opacity-100" : FADE_OUT
          )}
          style={focusOf(index)}
        />
      ))}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 size-full",
          canvasVisible ? "opacity-100" : FADE_OUT
        )}
      />
    </div>
  )
}
