import type { CSSProperties } from "react"

/**
 * The one column every page's content sits in: 576, 768 and 1024 px wide at
 * the base, lg and 2xl breakpoints, with 20 px gutters. The nav and the other
 * links sit in the viewport's corners instead (@workspace/ui corners). Width
 * changes between breakpoints ease over 300 ms.
 */
export const column =
  "mx-auto w-full max-w-xl px-5 motion-safe:transition-[max-width] motion-safe:duration-300 lg:max-w-3xl 2xl:max-w-5xl"

/**
 * A page's space for the fixed corners: the title starts 120 px down, and the
 * last line ends 100 px up, 60 px clear of the bottom corners.
 */
export const page = "pt-30 pb-25"

/**
 * Stagger fade-in (tw-animate-css): 300 ms ease-out, filled both ways so a
 * delayed block stays hidden until its turn. Nothing moves under reduced
 * motion. Pair it with `enterDelay`.
 */
export const enter =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both motion-safe:animation-duration-300 motion-safe:ease-out"

/**
 * The delay goes through tw-animate-css's own variable rather than a
 * `delay-*` class, which would also delay the element's transitions.
 */
export function enterDelay(ms: number): CSSProperties {
  return { "--tw-animation-delay": `${ms}ms` } as CSSProperties
}

/** Enter delays in ms: 25 between rows, 375 for the bottom corners. */
export const ENTER = { row: 25, footer: 375 } as const

/**
 * The delay for the row at `index` in document order, counting the top
 * corners as row 0: a page's title is row 1, its subtitle row 2, and each
 * block after them one row further.
 */
export function enterRow(index: number): CSSProperties {
  return enterDelay(index * ENTER.row)
}
