import Link from "next/link"

import { cn } from "@workspace/ui/lib/utils"

import type { Segment } from "@/lib/map"

/**
 * A chart drawn in lib/map.ts, one block per row of cells. Only the links
 * are read out: the stars, lanes and orbits are decoration.
 */
export function StarChart({
  rows,
  label,
  className,
}: {
  rows: Segment[][]
  /** What the chart shows, for a screen reader's list of landmarks. */
  label: string
  className?: string
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "mx-auto w-fit whitespace-pre text-muted-foreground select-none",
        className
      )}
    >
      {rows.map((row, index) => (
        <span key={index} className="block">
          {row.map(({ text, lit, href }, at) =>
            href ? (
              // The link is one row tall; its tap target reaches a row up
              // and down without moving the grid.
              <Link
                key={at}
                href={href}
                className="relative terminal-link text-foreground after:absolute after:inset-x-0 after:-inset-y-2"
              >
                {text}
              </Link>
            ) : (
              <span
                key={at}
                aria-hidden
                className={cn(lit && "text-foreground")}
              >
                {text}
              </span>
            )
          )}
        </span>
      ))}
    </nav>
  )
}

/** The same chart at the three column widths: one is shown at a time. */
export function StarCharts({
  narrow,
  wide,
  widest,
  label,
  className,
}: {
  narrow: Segment[][]
  wide: Segment[][]
  widest: Segment[][]
  label: string
  className?: string
}) {
  return (
    <div className={className}>
      <StarChart rows={narrow} label={label} className="lg:hidden" />
      <StarChart
        rows={wide}
        label={label}
        className="hidden lg:block 2xl:hidden"
      />
      <StarChart rows={widest} label={label} className="hidden 2xl:block" />
    </div>
  )
}
