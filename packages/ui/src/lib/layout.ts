/**
 * The one column every page's content sits in: 576, 768 and 1024px wide at
 * the base, lg and 2xl breakpoints, with 20px gutters. The nav and the other
 * links sit in the viewport's corners instead (corners.tsx). Width changes
 * between breakpoints ease over 300ms (`transition-column`).
 */
export const column =
  "mx-auto w-full max-w-xl px-5 motion-safe:transition-column lg:max-w-3xl 2xl:max-w-5xl"

/**
 * A page's space for the fixed corners: the title starts 120px down, and the
 * last line ends 100px up, 60px clear of the bottom corners.
 */
export const page = "pt-30 pb-25"

/**
 * Enter fade (tw-animate-css): opacity 0 to 1 over 300ms ease-out, filled
 * both ways so a delayed row stays hidden until its turn. Under reduced motion
 * none of it applies and every row shows at once.
 */
export const enter =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:fill-mode-both motion-safe:animation-duration-300 motion-safe:ease-out"

/**
 * The enter fade for the row at `index` in document order, 25ms apart,
 * counting the top corners as row 0: a page's title is row 1, its subtitle
 * row 2, and each block after them one row further. The delay is the
 * `enter-row-<n>` utility in globals.css, which sets tw-animate-css's own
 * delay variable rather than `delay-*`, so transitions are not delayed.
 */
export function enterRow(index: number) {
  return `${enter} ${rowDelay(index)}`
}

/** Only the delay of row `index`, for an animation other than the fade. */
export function rowDelay(index: number) {
  return `enter-row-${Math.min(Math.max(Math.round(index), 0), 40)}`
}

/** The bottom corners come in last, at 375ms. */
export const enterFooter = `${enter} enter-row-15`
