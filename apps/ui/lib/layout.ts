import type { CSSProperties } from "react";

/**
 * The one column every page's content sits in: 576, 768 and 1024px wide at the
 * base, lg and 2xl breakpoints, with 20px gutters. The nav and the other links
 * sit in the viewport's corners instead (@workspace/ui corners). Width changes
 * between breakpoints ease over 300ms.
 */
export const column =
  "mx-auto w-full max-w-xl px-5 motion-safe:transition-[max-width] motion-safe:duration-300 lg:max-w-3xl 2xl:max-w-5xl";

/**
 * Enter fade (tw-animate-css): opacity 0 to 1 over 300ms ease-out, filled both
 * ways so a delayed row stays hidden until its turn. Under reduced motion none
 * of it applies and every row shows at once. Pair it with `enterDelay`.
 */
export const enter =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both motion-safe:animation-duration-300 motion-safe:ease-out";

/** Rows enter 25ms apart in document order; the footer comes in at 375ms. */
export const ENTER = { row: 25, footer: 375 } as const;

/** The delay for the row at `index`, counting the header as row 0. */
export function enterDelay(index: number): CSSProperties {
  return enterAfter(index * ENTER.row);
}

/**
 * Sets tw-animate-css's own delay variable rather than a `delay-*` class,
 * which would also delay the element's transitions.
 */
export function enterAfter(ms: number): CSSProperties {
  return { "--tw-animation-delay": `${ms}ms` } as CSSProperties;
}
