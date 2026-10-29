/**
 * The project window's picture: the screenshot itself, arriving as an image
 * did over a dial-up line. A new picture clears the window and paints in from
 * the top, a band of rows at a time, with now and then a stall while the
 * line catches up. On leaving the page the picture is taken back from the
 * bottom up.
 */
export const SCAN = {
  /** Milliseconds between bands. */
  tick: 25,
  /** Band height in CSS pixels, from this... */
  minBand: 12,
  /** ...to this. */
  maxBand: 20,
  /** Chance that a band waits on the line first. */
  stallChance: 0.08,
  /** Up to this many milliseconds of a stall. */
  maxStall: 160,
} as const

export type Source = {
  image: HTMLImageElement
  /** The CSS object-position that keeps the screenshot's content in frame. */
  focus: string
}

/** Milliseconds from the start and the CSS rows shown by then. */
type Step = { at: number; rows: number }

export class ScanPreview {
  private ctx: CanvasRenderingContext2D
  private width = 0
  private height = 0
  private dpr = 1
  private source: Source | null = null
  /** Rows shown, in CSS pixels; the whole height once a scan is done. */
  private rows = 0
  private raf = 0

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("2D canvas unavailable")
    this.ctx = ctx
  }

  /** Fit the canvas to its box; what was shown stays shown. */
  resize() {
    const { width, height } = this.canvas.getBoundingClientRect()
    const done = this.rows >= this.height
    this.dpr = window.devicePixelRatio || 1
    this.width = width
    this.height = height
    this.canvas.width = Math.round(width * this.dpr)
    this.canvas.height = Math.round(height * this.dpr)
    if (done) this.rows = height
    this.paint()
  }

  /** Put a picture on stage: scanned in from the top, or at once. */
  show(source: Source, animate: boolean) {
    if (this.source?.image === source.image) return
    this.source = source
    cancelAnimationFrame(this.raf)
    if (!animate) {
      this.rows = this.height
      this.paint()
      return
    }
    this.rows = 0
    this.paint()
    this.play(this.schedule())
  }

  /** Take the picture back from the bottom up over `duration` ms. */
  leave(duration: number) {
    cancelAnimationFrame(this.raf)
    const from = this.rows
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // Whole bands, so it steps as the scan did.
      this.rows = Math.floor((from * (1 - t)) / SCAN.minBand) * SCAN.minBand
      this.paint()
      if (t < 1) this.raf = requestAnimationFrame(step)
    }
    this.raf = requestAnimationFrame(step)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
  }

  // Bands of random height down the window, each a tick after the last,
  // some after a stall.
  private schedule() {
    const steps: Step[] = []
    let at = 0
    let rows = 0
    while (rows < this.height) {
      at += SCAN.tick
      if (Math.random() < SCAN.stallChance) at += Math.random() * SCAN.maxStall
      rows += SCAN.minBand + Math.random() * (SCAN.maxBand - SCAN.minBand)
      steps.push({ at, rows: Math.min(this.height, Math.round(rows)) })
    }
    return steps
  }

  private play(steps: Step[]) {
    const start = performance.now()
    let next = 0
    const step = (now: number) => {
      const elapsed = now - start
      let changed = false
      while (next < steps.length && steps[next]!.at <= elapsed) {
        this.rows = steps[next]!.rows
        next += 1
        changed = true
      }
      if (changed) this.paint()
      // The window may have grown while scanning.
      if (next < steps.length) this.raf = requestAnimationFrame(step)
      else if (this.rows < this.height) {
        this.rows = this.height
        this.paint()
      }
    }
    this.raf = requestAnimationFrame(step)
  }

  private paint() {
    const { ctx, width, height, dpr, source } = this
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    if (!source || this.rows <= 0) return
    const { image, focus } = source
    const [fx, fy] = focus
      .split(/\s+/)
      .map((part) => (Number.parseFloat(part) || 0) / 100)
    // Match the 16:10 captures without cropping other sources, such as OG cards.
    const scale = Math.min(
      width / image.naturalWidth,
      height / image.naturalHeight
    )
    const w = image.naturalWidth * scale
    const h = image.naturalHeight * scale
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, width, Math.min(this.rows, height))
    ctx.clip()
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(
      image,
      (width - w) * (fx ?? 0.5),
      (height - h) * (fy ?? 0.5),
      w,
      h
    )
    ctx.restore()
  }
}
