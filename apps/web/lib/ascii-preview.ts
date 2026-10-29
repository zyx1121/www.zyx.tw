/**
 * The decode timing that the page's characters share: the home's mark
 * (lib/ascii-mark.ts) and the works window's frame (lib/ascii-frame.ts)
 * resolve on it. A frontier crosses from left to right, each column a little
 * early or late, each cell a little more, and cells about to resolve flicker
 * through random glyphs.
 */
export const ART = {
  /** Milliseconds for the frontier to cross from the first column to the last. */
  sweep: 480,
  /** Up to this many milliseconds of lateness per column. */
  columnJitter: 110,
  /** Up to this many more per cell. */
  cellJitter: 60,
  /** Milliseconds between noise re-rolls, as the text's 50ms step. */
  tick: 50,
} as const

/** Milliseconds until the last cell of a decode has resolved. */
export const DECODE_LENGTH = ART.sweep + ART.columnJitter + ART.cellJitter
