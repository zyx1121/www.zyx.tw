import { ART, DECODE_LENGTH } from "@/lib/ascii-preview"

/** Glyphs a frame flickers through, all as wide as the lines they replace. */
const NOISE = Array.from("─│╭╮╰╯├┤┬┴┼╴╵╶╷")
/** A text node of box-drawing characters alone, spaces aside. */
const FRAME = /^[─-╿\s]+$/u
const SPACE = /\s/u

type Line = {
  node: Text
  text: string
  chars: string[]
  /** Milliseconds at which each glyph resolves (in) or turns to noise (out). */
  at: Float32Array
  noise: Uint8Array
}

/**
 * A box-drawn frame's own motion, in step with the picture inside it
 * (lib/ascii-preview.ts). Entering, each glyph flickers through box glyphs
 * until the picture's frontier, sweeping left to right, reaches it. Leaving,
 * glyphs turn to noise from the right over `duration`, a little early or
 * late each, and keep moving until cancelled. Where a glyph sits is read
 * from its line's box: across a single row, or down a bar one glyph wide.
 * Returns a cancel that puts the frame back.
 */
export function scrambleFrame(
  root: HTMLElement,
  direction: "in" | "out",
  duration = DECODE_LENGTH
) {
  const box = root.getBoundingClientRect()
  const lines: Line[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text
    const rect = text.parentElement?.getBoundingClientRect()
    if (!rect || !FRAME.test(text.data) || box.width < 1) continue
    const chars = Array.from(text.data)
    const tall = rect.height > rect.width
    const at = Float32Array.from(chars, (_, index) => {
      const center = tall
        ? rect.left + rect.width / 2
        : rect.left + ((index + 0.5) * rect.width) / chars.length
      const x = Math.min(1, Math.max(0, (center - box.left) / box.width))
      return direction === "in"
        ? x * ART.sweep + Math.random() * (ART.columnJitter + ART.cellJitter)
        : ((1 - x) * 0.75 + Math.random() * 0.25) * duration
    })
    lines.push({
      node: text,
      text: text.data,
      chars,
      at,
      noise: new Uint8Array(chars.length),
    })
  }

  let raf = 0
  let start: number | undefined
  let lastTick = -1
  const frame = (now: number) => {
    start ??= now
    const elapsed = now - start
    if (direction === "in" && elapsed >= DECODE_LENGTH) {
      for (const line of lines) line.node.data = line.text
      return
    }
    const tick = Math.floor(elapsed / ART.tick)
    const reroll = tick !== lastTick
    lastTick = tick
    for (const line of lines) {
      if (reroll) {
        for (let i = 0; i < line.noise.length; i++)
          line.noise[i] = Math.floor(Math.random() * NOISE.length)
      }
      let out = ""
      for (let i = 0; i < line.chars.length; i++) {
        const char = line.chars[i]!
        const scrambled =
          direction === "in" ? elapsed < line.at[i]! : elapsed >= line.at[i]!
        out += scrambled && !SPACE.test(char) ? NOISE[line.noise[i]!] : char
      }
      if (line.node.data !== out) line.node.data = out
    }
    raf = requestAnimationFrame(frame)
  }
  frame(performance.now())

  return () => {
    cancelAnimationFrame(raf)
    for (const line of lines) line.node.data = line.text
  }
}
