/**
 * The preview stage's dither-to-color decode: the image version of
 * scramble-text. The stage is cut into square cells; a frontier crosses it
 * from left to right, each column a little early or late, each cell a little
 * more. Cells ahead of the frontier stay transparent, so the dither image under
 * the canvas shows through. Cells about to resolve flicker with random pieces
 * of the color image, like scrambled glyphs. Resolved cells show their own
 * piece. The last frame is the whole color image, drawn in one call.
 */
export const DECODE = {
  /** Cell size in CSS pixels. */
  cell: 24,
  /** Milliseconds for the frontier to cross from the first column to the last. */
  sweep: 480,
  /** Up to this many milliseconds of lateness per column. */
  columnJitter: 110,
  /** Up to this many more per cell. */
  cellJitter: 60,
  /** Milliseconds a cell spends as noise before it resolves. */
  band: 130,
  /** Milliseconds between noise re-rolls. */
  tick: 50,
} as const

/** The decode's length: the last cell resolves at sweep + both jitters. */
export const DECODE_MS = DECODE.sweep + DECODE.columnJitter + DECODE.cellJitter

// A small integer hash to [0, 1), so every run is random but every frame of a
// run agrees with the one before it.
function hash(x: number, y: number, z: number) {
  let h =
    Math.imul(x, 0x27d4eb2d) ^
    Math.imul(y + 0x9e37, 0x165667b1) ^
    Math.imul(z, 0x9e3779b1)
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

type Options = {
  /** The image layers' object-position, as two percentages ("50% 0%"). */
  focus: string
  /** The first frame is on the canvas. */
  onStart: () => void
  /** The canvas holds the exact color image. */
  onDone: () => void
}

/**
 * An object-position of two percentages as fractions, [x, y]. Anything else
 * falls back to the center, which is also CSS's default.
 */
export function parseFocus(focus: string): [number, number] {
  const fraction = (part: string | undefined) => {
    const value = part?.endsWith("%") ? Number.parseFloat(part) / 100 : NaN
    return Number.isFinite(value) ? value : 0.5
  }
  const [x, y] = focus.trim().split(/\s+/)
  return [fraction(x), fraction(y)]
}

/**
 * Plays the decode of `image` onto `canvas`, sized to the canvas's CSS box and
 * placed like `object-fit: cover` at `focus`, so it lines up with the image
 * layers under it. Returns a function that stops it.
 */
export function runDecode(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  { focus, onStart, onDone }: Options
): () => void {
  const context = canvas.getContext("2d")
  const rect = canvas.getBoundingClientRect()
  if (!context || !image.naturalWidth || !rect.width || !rect.height) {
    onDone()
    return () => {}
  }

  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const width = Math.round(rect.width * ratio)
  const height = Math.round(rect.height * ratio)
  canvas.width = width
  canvas.height = height
  context.imageSmoothingQuality = "high"

  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight
  )
  const drawnWidth = image.naturalWidth * scale
  const drawnHeight = image.naturalHeight * scale
  // object-position: a percentage aligns that point of the image with the
  // same point of the box.
  const [focusX, focusY] = parseFocus(focus)
  const offsetX = (width - drawnWidth) * focusX
  const offsetY = (height - drawnHeight) * focusY
  const size = Math.max(1, Math.round(DECODE.cell * ratio))
  const columns = Math.ceil(width / size)
  const rows = Math.ceil(height / size)
  const seed = Math.floor(Math.random() * 0x7fffffff)

  const resolveAt = new Float32Array(columns * rows)
  let end = 0
  for (let column = 0; column < columns; column++) {
    const front = columns > 1 ? (column / (columns - 1)) * DECODE.sweep : 0
    const late = hash(column, -1, seed) * DECODE.columnJitter
    for (let row = 0; row < rows; row++) {
      const at = front + late + hash(column, row, seed) * DECODE.cellJitter
      resolveAt[row * columns + column] = at
      end = Math.max(end, at)
    }
  }

  // Copies the image under cell (fromColumn, fromRow) into cell (column, row).
  const copy = (
    column: number,
    row: number,
    fromColumn: number,
    fromRow: number
  ) => {
    context.drawImage(
      image,
      (fromColumn * size - offsetX) / scale,
      (fromRow * size - offsetY) / scale,
      size / scale,
      size / scale,
      column * size,
      row * size,
      size,
      size
    )
  }

  let frame = 0
  let start: number | undefined
  const draw = (now: number) => {
    start ??= now
    const elapsed = now - start
    context.clearRect(0, 0, width, height)
    if (elapsed >= end) {
      context.drawImage(image, offsetX, offsetY, drawnWidth, drawnHeight)
      onDone()
      return
    }
    const roll = Math.floor(elapsed / DECODE.tick)
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const at = resolveAt[row * columns + column] ?? 0
        if (elapsed >= at) {
          copy(column, row, column, row)
        } else if (elapsed >= at - DECODE.band) {
          const cell = row * columns + column
          copy(
            column,
            row,
            Math.floor(hash(cell, roll, seed) * columns),
            Math.floor(hash(roll, cell, seed) * rows)
          )
        }
      }
    }
    if (elapsed === 0) onStart()
    frame = requestAnimationFrame(draw)
  }
  frame = requestAnimationFrame(draw)

  return () => cancelAnimationFrame(frame)
}
