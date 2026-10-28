/**
 * The project window's picture: a screenshot drawn as characters on a
 * canvas, denser where the screenshot stands out from its own page color.
 * At rest the glyphs take the text color; engaged, each takes the hue of
 * its piece of the screenshot. Changes decode as the page's text does: a
 * frontier crosses from left to right, each column a little early or late,
 * each cell a little more, and cells about to resolve flicker through
 * random glyphs. The first picture decodes out of noise in its own shape,
 * and on leaving the page the picture scrambles back into noise from the
 * right, as the home's mark does.
 */
export const ART = {
  /** Glyphs from empty to full. */
  ramp: " .:-=+*#%@",
  /**
   * Distance from the page color, as a share of the stretch, drawn as space,
   * so a faint texture in the screenshot stays out of the picture.
   */
  floor: 0.15,
  /** Font size in CSS pixels. */
  font: 10,
  /** Milliseconds for the frontier to cross from the first column to the last. */
  sweep: 480,
  /** Up to this many milliseconds of lateness per column. */
  columnJitter: 110,
  /** Up to this many more per cell. */
  cellJitter: 60,
  /** Milliseconds a cell spends as noise before it resolves. */
  band: 130,
  /** Milliseconds between noise re-rolls, as the text's 50ms step. */
  tick: 50,
} as const

const LAST = ART.ramp.length - 1
// Brightness buckets for finding a screenshot's page color.
const BINS = 32
/** Milliseconds until the last cell of a decode has resolved. */
export const DECODE_LENGTH = ART.sweep + ART.columnJitter + ART.cellJitter

// A small integer hash to [0, 1), so every run is random but every frame of a
// run agrees with the one before it.
function hash(x: number, y: number, z: number) {
  let h =
    Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2246822519)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

// A pixel's hue and saturation at a lightness the theme's page can carry, so
// a dark screenshot's colors still show on a dark page, and a light one's on
// a light page.
function readable(r: number, g: number, b: number, dark: boolean) {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const delta = max - min
  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  let hue = 0
  if (delta) {
    const [red, green, blue] = [r / 255, g / 255, b / 255]
    hue =
      max === red
        ? ((green - blue) / delta) % 6
        : max === green
          ? (blue - red) / delta + 2
          : (red - green) / delta + 4
  }
  return `hsl(${Math.round(hue * 60)} ${Math.round(saturation * 100)}% ${dark ? 72 : 38}%)`
}

type Grid = {
  /** Ramp index per cell, row by row. */
  glyph: Uint8Array
  /** CSS color per cell; empty for the text color. */
  color: string[]
}

/** How far a paint is into a decode, or into the scramble out. */
type Motion =
  | {
      kind: "decode"
      /** What was on screen before; none decodes out of noise. */
      from: Grid | null
      elapsed: number
      run: number
    }
  | { kind: "leave"; duration: number; elapsed: number; run: number }

export type Source = {
  image: HTMLImageElement
  /** The CSS object-position that keeps the screenshot's content in frame. */
  focus: string
  /** Draw each glyph in its own color instead of the text color. */
  color: boolean
}

export class AsciiPreview {
  private ctx: CanvasRenderingContext2D
  private sampler = document.createElement("canvas")
  private cols = 0
  private rows = 0
  private cw = 0
  private ch = 0
  private dpr = 1
  private shown: Grid | null = null
  /** The grid last drawn, which a decode may not have finished. */
  private drawn: Grid | null = null
  private source: Source | null = null
  private raf = 0
  private run = 0
  private leaving = false

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("2D canvas unavailable")
    this.ctx = ctx
  }

  /** Fit the grid to the canvas's box; the picture redraws without a decode. */
  resize() {
    const { width, height } = this.canvas.getBoundingClientRect()
    if (width < 1 || height < 1 || this.leaving) return
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.round(width * this.dpr)
    this.canvas.height = Math.round(height * this.dpr)
    const ctx = this.ctx
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.font = this.font()
    const metrics = ctx.measureText("M")
    this.cw = metrics.width
    this.ch = Math.ceil(
      metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent ||
        ART.font * 1.2
    )
    if (!(this.cw > 0)) return
    this.cols = Math.max(1, Math.floor(width / this.cw))
    this.rows = Math.max(1, Math.floor(height / this.ch))
    cancelAnimationFrame(this.raf)
    this.shown = this.source ? this.sample(this.source) : null
    this.paint(this.shown)
  }

  /** Show a source, decoding from what is on screen unless `animate` is off. */
  show(source: Source, animate: boolean) {
    this.source = source
    if (this.leaving) return
    if (!this.cols) this.resize()
    const target = this.sample(source)
    cancelAnimationFrame(this.raf)
    if (!animate) {
      this.shown = target
      this.paint(target)
      return
    }
    const from = this.shown
    const run = ++this.run
    let start: number | undefined
    const frame = (now: number) => {
      start ??= now
      const elapsed = now - start
      if (elapsed >= DECODE_LENGTH) {
        this.shown = target
        this.paint(target)
        return
      }
      this.paint(target, { kind: "decode", from, elapsed, run })
      this.raf = requestAnimationFrame(frame)
    }
    this.raf = requestAnimationFrame(frame)
  }

  /**
   * Scramble what is on screen into noise over `duration`, from the right,
   * each cell a little early or late; the noise moves until the canvas goes.
   */
  leave(duration: number) {
    const shown = this.drawn
    if (!shown || this.leaving) return
    this.leaving = true
    cancelAnimationFrame(this.raf)
    const run = ++this.run
    let start: number | undefined
    const frame = (now: number) => {
      start ??= now
      this.paint(shown, { kind: "leave", duration, elapsed: now - start, run })
      this.raf = requestAnimationFrame(frame)
    }
    this.raf = requestAnimationFrame(frame)
  }

  /** Sample again (after a theme change) and redraw at once. */
  refresh() {
    if (!this.source || this.leaving) return
    cancelAnimationFrame(this.raf)
    this.shown = this.sample(this.source)
    this.paint(this.shown)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
  }

  private font() {
    return `${ART.font}px ${getComputedStyle(this.canvas).fontFamily}`
  }

  private blank(): Grid {
    const size = this.cols * this.rows
    return { glyph: new Uint8Array(size), color: new Array(size).fill("") }
  }

  /** The screenshot cropped like object-fit: cover, one pixel per cell. */
  private sample({ image, focus, color }: Source): Grid {
    const { cols, rows, cw, ch } = this
    const grid = this.blank()
    const iw = image.naturalWidth
    const ih = image.naturalHeight
    if (!iw || !ih) return grid
    const aspect = (cols * cw) / (rows * ch)
    let sw = iw
    let sh = iw / aspect
    if (sh > ih) {
      sh = ih
      sw = ih * aspect
    }
    const [fx = 50, fy = 50] = focus.split(" ").map((part) => parseFloat(part))
    const sx = ((iw - sw) * fx) / 100
    const sy = ((ih - sh) * fy) / 100
    this.sampler.width = cols
    this.sampler.height = rows
    const sctx = this.sampler.getContext("2d", { willReadFrequently: true })
    if (!sctx) return grid
    sctx.imageSmoothingQuality = "high"
    sctx.drawImage(image, sx, sy, sw, sh, 0, 0, cols, rows)
    const data = sctx.getImageData(0, 0, cols, rows).data

    // The screenshot's most common brightness is its page, drawn as space;
    // a cell is denser the further it is from that, in either direction, so
    // light and dark screenshots read the same in either theme. The distance
    // stretches to its 98th percentile, so faint content still spans the ramp.
    const size = cols * rows
    const light = new Float32Array(size)
    const bins = new Uint32Array(BINS)
    for (let i = 0; i < size; i++) {
      const value =
        (0.2126 * data[i * 4]! +
          0.7152 * data[i * 4 + 1]! +
          0.0722 * data[i * 4 + 2]!) /
        255
      light[i] = value
      bins[Math.min(BINS - 1, Math.floor(value * BINS))]!++
    }
    const page = (bins.indexOf(Math.max(...bins)) + 0.5) / BINS
    const distance = light.map((value) => Math.abs(value - page))
    const sorted = Float32Array.from(distance).sort()
    const range = Math.max(sorted[Math.floor(size * 0.98)] ?? 1, 0.05)
    const dark = document.documentElement.classList.contains("dark")
    for (let i = 0; i < size; i++) {
      const level = Math.min(1, distance[i]! / range)
      grid.glyph[i] =
        level < ART.floor ? 0 : Math.max(1, Math.round(level * LAST))
      if (color) {
        grid.color[i] = readable(
          data[i * 4]!,
          data[i * 4 + 1]!,
          data[i * 4 + 2]!,
          dark
        )
      }
    }
    return grid
  }

  /**
   * Draw `target`, or a moment of a motion over it. A decode `elapsed` ms in
   * shows the target where the frontier has passed, flickers within `band`
   * of it, and shows `from` beyond; from nothing, the target's own cells
   * flicker until the frontier reaches them. Leaving, the target's cells turn
   * to noise from the right over `duration`.
   */
  private paint(target: Grid | null, motion?: Motion) {
    const { ctx, cols, rows, cw, ch } = this
    const width = this.canvas.width / this.dpr
    const height = this.canvas.height / this.dpr
    ctx.clearRect(0, 0, width, height)
    this.drawn = target
    if (!target) return
    ctx.font = this.font()
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    const ink = getComputedStyle(this.canvas).color
    const left = (width - cols * cw) / 2 + cw / 2
    const top = (height - rows * ch) / 2 + ch / 2
    const run = motion?.run ?? 0
    const elapsed = motion?.elapsed ?? 0
    const tick = Math.floor(elapsed / ART.tick)
    let fill = ""
    for (let col = 0; col < cols; col++) {
      const x = cols > 1 ? col / (cols - 1) : 0
      const columnAt = x * ART.sweep + hash(col, 0, run) * ART.columnJitter
      for (let row = 0; row < rows; row++) {
        const i = row * cols + col
        let glyph = target.glyph[i]!
        let color = target.color[i]!
        const noise = 1 + Math.floor(hash(col, row, tick + run * 7919) * LAST)
        if (motion?.kind === "decode") {
          const at = columnAt + hash(col, row, run + 1) * ART.cellJitter
          if (elapsed >= at) {
            // Resolved.
          } else if (!motion.from) {
            if (glyph) glyph = noise
          } else if (elapsed < at - ART.band) {
            glyph = motion.from.glyph[i]!
            color = motion.from.color[i]!
          } else {
            glyph = noise
          }
        } else if (motion && glyph) {
          const at =
            ((1 - x) * 0.75 + hash(col, row, run + 1) * 0.25) * motion.duration
          if (elapsed >= at) glyph = noise
        }
        if (!glyph) continue
        const style = color || ink
        if (style !== fill) {
          ctx.fillStyle = style
          fill = style
        }
        ctx.fillText(ART.ramp[glyph]!, left + col * cw, top + row * ch)
      }
    }
  }
}
