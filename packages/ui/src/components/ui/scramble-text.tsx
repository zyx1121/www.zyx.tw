"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import { cn } from "@workspace/ui/lib/utils"

const DEFAULT_CHARSET = "!#$%&*+-/<=>?@[]^{}~"
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
// Side of the scale probe in local px, as in its size-[100px] class.
const PROBE_SIZE = 100

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  )
}

const subscribeNothing = () => () => {}

// False while server rendering and hydrating, true once the client has taken over.
function useHydrated() {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  )
}

// User-perceived characters, so emoji and combining marks stay whole.
function graphemes(text: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    })
    return Array.from(segmenter.segment(text), (part) => part.segment)
  }
  return Array.from(text)
}

function isSpace(segment: string) {
  return segment.trim() === ""
}

function drawGlyphs(
  segments: string[],
  resolved: number,
  pool: string[],
  pick: (index: number) => number
) {
  return segments.map((segment, index) =>
    index < resolved || isSpace(segment)
      ? segment
      : (pool[pick(index) % pool.length] ?? segment)
  )
}

// The box each cell was last pinned to, so a frame where nothing moved writes
// no style.
const pinnedBoxes = new WeakMap<HTMLElement, string>()

// Rounds to a 1/64px layout unit, so float noise never rewrites a cell.
function snap(value: number) {
  return Math.round(value * 64) / 64
}

// Pins every cell onto its own character. Rects come in viewport px, which
// already include every transform and zoom above the element, while a cell's
// left, top, width and height are local px that those scale once more. So
// every rect is divided by the local scale: the probe's viewport size over its
// PROBE_SIZE local px.
function pinCells(
  root: HTMLElement | null,
  overlay: HTMLElement | null,
  probe: HTMLElement | null,
  text: string,
  segments: string[]
) {
  const node = root?.firstChild
  if (!overlay || !probe || !node || node.nodeType !== Node.TEXT_NODE) return
  // The frame loop of a previous text can run once after the text changed.
  if ((node as Text).data !== text) return
  const unit = probe.getBoundingClientRect()
  const scaleX = unit.width / PROBE_SIZE
  const scaleY = unit.height / PROBE_SIZE
  if (!scaleX || !scaleY) return
  const origin = overlay.getBoundingClientRect()
  const cells = new Map<number, HTMLElement>()
  for (const cell of Array.from(overlay.children) as HTMLElement[]) {
    cells.set(Number(cell.dataset.index), cell)
  }
  const range = document.createRange()
  let offset = 0
  segments.forEach((segment, index) => {
    const from = offset
    offset += segment.length
    const cell = cells.get(index)
    if (!cell) return
    range.setStart(node, from)
    range.setEnd(node, offset)
    const box = range.getClientRects()[0] ?? range.getBoundingClientRect()
    const left = snap((box.left - origin.left) / scaleX)
    const top = snap((box.top - origin.top) / scaleY)
    const width = snap(box.width / scaleX)
    const height = snap(box.height / scaleY)
    const pinned = `${left} ${top} ${width} ${height}`
    if (pinnedBoxes.get(cell) === pinned) return
    pinnedBoxes.set(cell, pinned)
    cell.style.left = `${left}px`
    cell.style.top = `${top}px`
    cell.style.width = `${width}px`
    cell.style.height = `${height}px`
    // A line box exactly the character's height has no leading to round, so
    // the glyph sits on the text's own baseline.
    cell.style.lineHeight = `${height}px`
  })
}

type Frame = {
  text: string
  glyphs: string[]
  resolved: number
  done: boolean
}

interface ScrambleTextProps extends Omit<
  React.ComponentProps<"span">,
  "children" | "ref"
> {
  /** The final text. Changing it plays the effect again. */
  text: string
  /** Milliseconds per resolved character. */
  speed?: number
  /** Glyphs drawn for characters that have not resolved yet. */
  charset?: string
  /** Start on mount, or the first time the element is half in view. */
  trigger?: "mount" | "in-view"
  /** The element to render, e.g. "h1" or "p". It keeps its own display. */
  element?: React.ElementType
}

// How it stays still: the final text is always one untouched text node, so
// line breaks, kerning and size are exactly those of the finished text at
// every moment. While running, that text is painted transparent (screen
// readers and copies still get it, once) and an aria-hidden, unselectable
// overlay draws one cell per character. Each cell is pinned onto its own
// character's measured box before paint, glyphs centered and resolved letters
// on their exact origin, so nothing in the flow ever changes. Pins are measured
// again on every frame, so a resize, a rewrap or a font swap between steps is
// followed at once, and in the overlay's local px, so scaled or zoomed parents
// line up too.
function ScrambleText({
  text,
  speed = 50,
  charset = DEFAULT_CHARSET,
  trigger = "mount",
  element = "span",
  className,
  ...props
}: ScrambleTextProps) {
  // Checked as a span: the props below suit every HTML element, and in a
  // project that adds JSX elements of its own (React Three Fiber adds three's)
  // the union of every element's props would accept none of them.
  const Comp = element as "span"
  const ref = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLSpanElement>(null)
  const probeRef = useRef<HTMLSpanElement>(null)
  const hydrated = useHydrated()
  const reducedMotion = useReducedMotion()
  const [inView, setInView] = useState(false)
  const [frame, setFrame] = useState<Frame | null>(null)

  useEffect(() => {
    const node = ref.current
    if (trigger !== "in-view" || inView || !node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [trigger, inView])

  const animate = hydrated && !reducedMotion && (trigger === "mount" || inView)

  useEffect(() => {
    if (!animate) return
    const segments = graphemes(text)
    const pool = Array.from(charset)
    const step = Math.max(1, speed)
    const random = () => Math.floor(Math.random() * pool.length)
    let raf = 0
    let start: number | undefined
    let last = -1
    const tick = (now: number) => {
      // Between steps too, so any reflow is followed before this frame paints.
      pinCells(
        ref.current,
        overlayRef.current,
        probeRef.current,
        text,
        segments
      )
      start ??= now
      const resolved = Math.floor((now - start) / step)
      if (resolved >= segments.length) {
        setFrame({ text, glyphs: segments, resolved, done: true })
        return
      }
      if (resolved !== last) {
        last = resolved
        setFrame({
          text,
          glyphs: drawGlyphs(segments, resolved, pool, random),
          resolved,
          done: false,
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [animate, text, speed, charset])

  const segments = graphemes(text)
  let state: "idle" | "running" | "done" = reducedMotion ? "done" : "idle"
  let glyphs: string[] = []
  let resolved = 0
  if (animate) {
    if (frame?.text === text && frame.done) {
      state = "done"
    } else if (frame?.text === text) {
      state = "running"
      glyphs = frame.glyphs
      resolved = frame.resolved
    } else {
      // A new text draws its first frame during render, so the final text never
      // flashes before the scramble starts. Deterministic, so render stays pure.
      state = "running"
      glyphs = drawGlyphs(
        segments,
        0,
        Array.from(charset),
        (index) => index * 7 + 3
      )
    }
  }
  const running = state === "running"

  // The overlay needs a containing block that scrolls and clips with the text.
  useLayoutEffect(() => {
    const root = ref.current
    if (!running || !root || getComputedStyle(root).position !== "static") {
      return
    }
    root.style.position = "relative"
    return () => {
      root.style.position = ""
    }
  }, [running])

  // Pin every cell onto its character before the frame is painted.
  useLayoutEffect(() => {
    pinCells(ref.current, overlayRef.current, probeRef.current, text, segments)
  })

  return (
    <Comp
      ref={ref}
      data-slot="scramble-text"
      data-state={state}
      className={cn(
        // Hide the server-rendered text until the client starts the effect.
        // The hold ends on its own after 1.5s, so the text still shows if
        // scripts fail.
        "motion-safe:data-[state=idle]:animate-[scramble-text-hold_1.5s]",
        "data-[state=running]:[-webkit-text-fill-color:transparent]",
        className
      )}
      {...props}
    >
      {text}
      {running && (
        <>
          <span
            ref={overlayRef}
            aria-hidden
            className="pointer-events-none absolute select-none [-webkit-text-fill-color:currentcolor]"
          >
            {segments.map((segment, index) =>
              isSpace(segment) ? null : (
                <span
                  key={index}
                  data-index={index}
                  className={cn(
                    "absolute flex items-center whitespace-pre",
                    index < resolved ? "justify-start" : "justify-center"
                  )}
                >
                  {glyphs[index]}
                </span>
              )
            )}
          </span>
          {/* The scale probe, clipped to 0 by 0 so it adds no overflow. */}
          <span
            aria-hidden
            className="absolute size-0 overflow-hidden select-none"
          >
            <span ref={probeRef} className="block size-[100px]" />
          </span>
        </>
      )}
    </Comp>
  )
}

export { ScrambleText }
