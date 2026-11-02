/**
 * The project window's picture: the screenshot itself, arriving as an image
 * did over a dial-up line. A new picture clears the window and paints in from
 * the top, a band of rows at a time, with now and then a stall while the
 * line catches up. On leaving the page the picture is taken back from the
 * bottom up.
 */
export const SCAN = {
  /**
   * Milliseconds for a whole picture, whatever its size, so the works window
   * and every project page scan at the same pace. Stalls add a little.
   */
  duration: 400,
  /** Bands per picture, one every duration / bands ms. */
  bands: 16,
  /** Each band is the average height times 1 plus or minus this. */
  jitter: 0.3,
  /** Chance that a band waits on the line first. */
  stallChance: 0.08,
  /**
   * A stall lasts from this many milliseconds to the next. A narrow range
   * reads as a slow line; a wide one read as a hitch.
   */
  minStall: 20,
  maxStall: 40,
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
  /** A scan asked for before the canvas had a size: it starts on resize. */
  private pending = false

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("2D canvas unavailable")
    this.ctx = ctx
  }

  /** Fit the canvas to its box; what was shown stays shown. */
  resize() {
    const { width, height } = this.canvas.getBoundingClientRect()
    // A pending scan has not started, so it is not done either.
    const done = !this.pending && this.rows >= this.height
    this.dpr = window.devicePixelRatio || 1
    this.width = width
    this.height = height
    this.canvas.width = Math.round(width * this.dpr)
    this.canvas.height = Math.round(height * this.dpr)
    if (done) this.rows = height
    this.paint()
    if (this.pending && height > 0) {
      this.pending = false
      this.rows = 0
      this.play(this.schedule())
    }
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
    // A cached picture can decode before the first resize; scanning a
    // zero-height canvas would finish at once and then show it whole.
    if (this.height <= 0) {
      this.pending = true
      return
    }
    this.play(this.schedule())
  }

  /** Take the picture back from the bottom up over `duration` ms. */
  leave(duration: number) {
    cancelAnimationFrame(this.raf)
    this.pending = false
    const from = this.rows
    const band = Math.max(1, this.height / SCAN.bands)
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // Whole bands, so it steps as the scan did.
      this.rows = Math.floor((from * (1 - t)) / band) * band
      this.paint()
      if (t < 1) this.raf = requestAnimationFrame(step)
    }
    this.raf = requestAnimationFrame(step)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
  }

  // SCAN.bands bands of jittered height down the window, one a tick apart,
  // some after a stall. Heights are scaled so the last band ends at the
  // bottom, so every picture takes SCAN.duration plus its stalls.
  private schedule() {
    const tick = SCAN.duration / SCAN.bands
    const sizes = Array.from(
      { length: SCAN.bands },
      () => 1 + (Math.random() * 2 - 1) * SCAN.jitter
    )
    const total = sizes.reduce((sum, size) => sum + size, 0)
    const steps: Step[] = []
    let at = 0
    let rows = 0
    for (const size of sizes) {
      at += tick
      if (Math.random() < SCAN.stallChance)
        at += SCAN.minStall + Math.random() * (SCAN.maxStall - SCAN.minStall)
      rows += (size / total) * this.height
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
    // Match the 4:3 captures without cropping other sources, such as OG cards.
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
