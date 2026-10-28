/**
 * Something solid in the water, such as the home's mark. It is kept as a
 * signed distance field over a grid of cells, in CSS pixels: negative
 * inside, positive outside. Anything swimming reads how far it is from the
 * edge and which way is out, so it can turn along the edge instead of into
 * it.
 */
export class Obstacle {
  /** False until the first mask, and again once the obstacle is gone. */
  active = false
  private cols = 0
  private rows = 0
  private cellW = 1
  private cellH = 1
  private field = new Float32Array(0)
  private inside = new Float32Array(0)
  private outside = new Float32Array(0)

  /**
   * Rebuild from a mask: one byte per cell, row by row from the top, non-zero
   * where the obstacle is.
   */
  update(
    mask: Uint8Array,
    cols: number,
    rows: number,
    cellW: number,
    cellH: number
  ) {
    const size = cols * rows
    // Nothing in the water: no distance to measure.
    if (!mask.some((cell) => cell !== 0)) {
      this.active = false
      return
    }
    if (this.field.length !== size) {
      this.field = new Float32Array(size)
      this.inside = new Float32Array(size)
      this.outside = new Float32Array(size)
    }
    this.cols = cols
    this.rows = rows
    this.cellW = cellW
    this.cellH = cellH
    this.distance(mask, true, this.outside)
    this.distance(mask, false, this.inside)
    for (let i = 0; i < size; i++) {
      this.field[i] = this.outside[i]! - this.inside[i]!
    }
    this.active = true
  }

  clear() {
    this.active = false
  }

  /**
   * The signed distance at a point, and the unit direction out of the
   * obstacle there, written into `out`. Far away when inactive.
   */
  sample(x: number, y: number, out: { d: number; gx: number; gy: number }) {
    const { cols, rows, cellW, cellH, field } = this
    if (!this.active || !cols) {
      out.d = Infinity
      return out
    }
    const col = Math.min(cols - 1, Math.max(0, Math.floor(x / cellW)))
    const row = Math.min(rows - 1, Math.max(0, Math.floor(y / cellH)))
    const at = (c: number, r: number) =>
      field[
        Math.min(rows - 1, Math.max(0, r)) * cols +
          Math.min(cols - 1, Math.max(0, c))
      ]!
    // Off the grid the distance keeps growing, so nothing out there is near.
    const beyond = Math.max(-x, x - cols * cellW, -y, y - rows * cellH, 0)
    out.d = at(col, row) + beyond
    const gx = (at(col + 1, row) - at(col - 1, row)) / (2 * cellW)
    const gy = (at(col, row + 1) - at(col, row - 1)) / (2 * cellH)
    const length = Math.hypot(gx, gy)
    out.gx = length ? gx / length : 0
    out.gy = length ? gy / length : 0
    return out
  }

  /**
   * Two-pass chamfer distance, in pixels, from every cell to the nearest cell
   * whose mask is set (`toSet`) or clear.
   */
  private distance(mask: Uint8Array, toSet: boolean, out: Float32Array) {
    const { cols, rows, cellW: w, cellH: h } = this
    const diagonal = Math.hypot(w, h)
    for (let i = 0; i < out.length; i++) {
      out[i] = (mask[i]! !== 0) === toSet ? 0 : Infinity
    }
    const relax = (i: number, c: number, r: number, step: number) => {
      if (c < 0 || c >= cols || r < 0 || r >= rows) return
      const via = out[r * cols + c]! + step
      if (via < out[i]!) out[i] = via
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        relax(i, c - 1, r, w)
        relax(i, c - 1, r - 1, diagonal)
        relax(i, c, r - 1, h)
        relax(i, c + 1, r - 1, diagonal)
      }
    }
    for (let r = rows - 1; r >= 0; r--) {
      for (let c = cols - 1; c >= 0; c--) {
        const i = r * cols + c
        relax(i, c + 1, r, w)
        relax(i, c + 1, r + 1, diagonal)
        relax(i, c, r + 1, h)
        relax(i, c - 1, r + 1, diagonal)
      }
    }
  }
}

/** The home's mark, which the pond in the root layout swims around. */
export const markObstacle = new Obstacle()
