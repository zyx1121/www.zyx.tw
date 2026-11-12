"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import type { Diagram } from "@/lib/projects"
import { useReducedMotion } from "@/lib/use-reduced-motion"

/** Milliseconds a step stays lit while the figure plays by itself. */
const STEP_MS = 2400

type Segment = { text: string; steps: number[] }

/**
 * A line cut where any step's words begin or end, so the text nodes never
 * change: stepping only recolors them, and the page's decoder keeps the
 * nodes it started with.
 */
function segments(line: string, lit: string[][]): Segment[] {
  const owners: number[][] = Array.from(line, () => [])
  lit.forEach((words, step) => {
    for (const word of words) {
      for (
        let at = line.indexOf(word);
        at !== -1;
        at = line.indexOf(word, at + word.length)
      ) {
        for (let cell = at; cell < at + word.length; cell++) {
          if (!owners[cell]!.includes(step)) owners[cell]!.push(step)
        }
      }
    }
  })
  const out: Segment[] = []
  for (let cell = 0; cell < line.length; cell++) {
    const steps = owners[cell]!
    const last = out.at(-1)
    if (last && last.steps.join() === steps.join()) last.text += line[cell]
    else out.push({ text: line[cell]!, steps })
  }
  return out
}

function Lines({
  lines,
  lit,
  active,
  className,
}: {
  lines: string[]
  lit: string[][]
  active: number
  className?: string
}) {
  const rows = useMemo(
    () => lines.map((line) => segments(line, lit)),
    [lines, lit]
  )
  return (
    <div aria-hidden className={cn("diagram", className)}>
      {rows.map((row, index) => (
        // An empty line still takes its row.
        <span key={index} className="block">
          {row.length === 0
            ? " "
            : row.map(({ text, steps }, at) => (
                <span
                  key={at}
                  className={cn(
                    "motion-safe:transition-colors motion-safe:duration-state",
                    steps.includes(active) && "text-foreground"
                  )}
                >
                  {text}
                </span>
              ))}
        </span>
      ))}
    </div>
  )
}

/**
 * A drawing in box-drawing characters (app/globals.css, `diagram`): real
 * text in the page's own face, so it is exactly as legible as the paragraphs
 * beside it and decodes in with them. Phones get the narrow drawing.
 *
 * Every figure with steps works the same way: while it is on screen it
 * lights one step after another, with that step's line under the drawing;
 * picking a step holds it, and picking it again lets the figure play on.
 * Reduced motion never plays by itself.
 */
export function ProjectDiagram({
  diagram,
  className,
}: {
  diagram: Diagram
  className?: string
}) {
  const steps = useMemo(() => diagram.steps ?? [], [diagram.steps])
  const lit = useMemo(() => steps.map((step) => step.lit), [steps])
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.5 }
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const playing = steps.length > 1 && visible && !held && !reducedMotion
  useEffect(() => {
    if (!playing) return
    const id = setInterval(
      () => setActive((step) => (step + 1) % steps.length),
      STEP_MS
    )
    return () => clearInterval(id)
  }, [playing, steps.length])

  return (
    <div ref={rootRef} className={className}>
      <div
        role="img"
        aria-label={diagram.alt}
        className="overflow-x-auto text-muted-foreground"
      >
        <Lines
          lines={diagram.wide}
          lit={lit}
          active={active}
          className="max-sm:hidden"
        />
        <Lines
          lines={diagram.narrow}
          lit={lit}
          active={active}
          className="sm:hidden"
        />
      </div>
      {steps.length > 0 && (
        <>
          <ol className="mt-5 flex flex-wrap gap-x-2 gap-y-1">
            {steps.map(({ label }, index) => {
              const current = index === active
              return (
                <li key={label} className="flex">
                  <button
                    type="button"
                    aria-pressed={current && held}
                    aria-current={current ? "step" : undefined}
                    onClick={() => {
                      setHeld(!(current && held))
                      setActive(index)
                    }}
                    className={cn(
                      "cursor-pointer uppercase outline-offset-4 focus-visible:outline-2",
                      "motion-safe:transition-colors motion-safe:duration-state",
                      current
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span aria-hidden className={cn(!current && "invisible")}>
                      {held ? "[" : ">"}
                    </span>
                    {label}
                    <span
                      aria-hidden
                      className={cn(!(current && held) && "invisible")}
                    >
                      ]
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          {/* Every step's line shares one cell, so the tallest sets the
              height and nothing below moves as the steps change. */}
          <div className="mt-3 grid max-w-2xl">
            {steps.map(({ label, text }, index) => (
              <p
                key={label}
                aria-hidden={index !== active}
                className={cn(
                  "col-start-1 row-start-1 text-pretty",
                  index !== active && "invisible"
                )}
              >
                {text}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
