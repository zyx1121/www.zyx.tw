import data from "./map.json"

/** A note (planet) or a course (station) in a system. */
export type Body = {
  slug: string
  name: string
  /** What it says, in one or two sentences. */
  line: string
  kind?: "station"
  /** The bodies to read first, by slug, from any system. */
  needs?: string[]
  /** Its page, once it is written. A body without one is planned. */
  href?: string
}

export type System = {
  slug: string
  name: string
  line: string
  /** Where it sits on the chart: x and y from 0 to 1, then its height. */
  at: [number, number, number]
  bodies: Body[]
}

/** Every system and the lanes between them, from lib/map.json. */
export const systems = data.systems as System[]
export const lanes = data.lanes as [string, string][]

export function systemPath({ slug }: Pick<System, "slug">) {
  return `/map/${slug}`
}

export function findSystem(slug: string) {
  return systems.find((system) => system.slug === slug)
}

/** A body and the system it belongs to, by the body's slug. */
export function findBody(slug: string) {
  for (const system of systems) {
    const body = system.bodies.find((item) => item.slug === slug)
    if (body) return { body, system }
  }
}

/*
 * The charts are text: a grid of character cells, drawn here and rendered as
 * rows of spans (components/star-chart.tsx). A cell is muted or lit, and a
 * run of cells can be a link.
 */

export type Segment = { text: string; lit: boolean; href?: string }

type Cell = { glyph: string; lit: boolean; href?: string; fixed?: boolean }

class Grid {
  private cells: Cell[]

  constructor(
    readonly cols: number,
    readonly rows: number
  ) {
    this.cells = Array.from({ length: cols * rows }, () => ({
      glyph: " ",
      lit: false,
    }))
  }

  /** Writes `text` from (col, row). `fixed` cells are never drawn over. */
  put(
    col: number,
    row: number,
    text: string,
    { lit = false, href, fixed = false }: Partial<Omit<Cell, "glyph">> = {}
  ) {
    Array.from(text).forEach((glyph, index) => {
      const at = col + index
      if (at < 0 || at >= this.cols || row < 0 || row >= this.rows) return
      const cell = this.cells[row * this.cols + at]!
      if (cell.fixed) return
      this.cells[row * this.cols + at] = { glyph, lit, href, fixed }
    })
  }

  /** The grid as rows of runs that share a tone and a link. */
  segments(): Segment[][] {
    return Array.from({ length: this.rows }, (_, row) => {
      const out: Segment[] = []
      for (let col = 0; col < this.cols; col++) {
        const { glyph, lit, href } = this.cells[row * this.cols + col]!
        const last = out.at(-1)
        if (last && last.lit === lit && last.href === href) last.text += glyph
        else out.push({ text: glyph, lit, href })
      }
      return out
    })
  }
}

/** A small seeded generator, so a chart is the same on every render. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Distant stars: one cell in `one in`, as a dot, a tick or a plus. */
function scatter(grid: Grid, seed: number, oneIn: number) {
  const next = random(seed)
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      if (next() * oneIn < 1)
        grid.put(col, row, ".'.+"[Math.floor(next() * 4)]!)
    }
  }
}

/** A dotted lane from one cell to another, clear of both ends. */
function lane(grid: Grid, from: [number, number], to: [number, number]) {
  const [c0, r0] = from
  const [c1, r1] = to
  // A row is 2.5 cells tall, so a step of two cells reads as even dots.
  const steps = Math.round(Math.hypot(c1 - c0, (r1 - r0) * 2.5) / 2)
  for (let step = 2; step < steps - 1; step++) {
    const t = step / steps
    grid.put(
      Math.round(c0 + (c1 - c0) * t),
      Math.round(r0 + (r1 - r0) * t),
      "."
    )
  }
}

/**
 * Every system on one chart, each a link to its own chart. Flat is the view
 * from above. Tilted lays the systems on a plane seen from the side: each
 * star stands on a stalk as tall as its height.
 */
export function galaxyChart({
  cols,
  rows,
  tilt = false,
}: {
  cols: number
  rows: number
  tilt?: boolean
}) {
  const grid = new Grid(cols, rows)
  const longest = Math.max(...systems.map(({ name }) => name.length))
  const places = new Map<string, [number, number]>()

  for (const system of systems) {
    const [x, y, z] = system.at
    const col = Math.round(x * (cols - longest - 3))
    if (!tilt) {
      places.set(system.slug, [col, Math.round(y * (rows - 1))])
      continue
    }
    const lift = Math.round(rows * 0.34)
    const ground = lift + Math.round(y * (rows - 1 - lift))
    const row = ground - Math.round(z * lift)
    // The plane is sheared, so the far edge sits to the right.
    const shear = Math.round((1 - y) * 4)
    places.set(system.slug, [col + shear, row])
    for (let at = row + 1; at < ground; at++) grid.put(col + shear, at, "|")
    grid.put(col + shear - 1, ground, "-+-")
  }

  scatter(grid, 7, tilt ? 60 : 34)
  for (const [from, to] of lanes) {
    lane(grid, places.get(from)!, places.get(to)!)
  }
  for (const system of systems) {
    const [col, row] = places.get(system.slug)!
    // Clear a cell on each side, so no dot touches the name.
    grid.put(col - 1, row, " ".repeat(system.name.length + 4))
    grid.put(col, row, `* ${system.name.toUpperCase()}`, {
      lit: true,
      href: systemPath(system),
      fixed: true,
    })
  }
  return grid.segments()
}

/**
 * One system: its star in the middle and its bodies on orbits, two to an
 * orbit on opposite sides. A planet is an "o" and a station a "#". With
 * `names` each body carries its name; without, its number in the list.
 */
export function systemChart(
  system: System,
  {
    cols,
    step,
    stretch,
    names,
  }: {
    cols: number
    /** Rows between one orbit and the next. */
    step: number
    /** Cells of width for each row of an orbit's height. */
    stretch: number
    names: boolean
  }
) {
  const orbits = Math.ceil(system.bodies.length / 2)
  const rows = orbits * step * 2 + 3
  const grid = new Grid(cols, rows)
  const cx = Math.floor(cols / 2)
  const cy = Math.floor(rows / 2)

  scatter(grid, system.slug.length * 13, 70)
  for (let orbit = 1; orbit <= orbits; orbit++) {
    const ry = orbit * step
    const rx = ry * stretch
    for (let degree = 0; degree < 360; degree += 3) {
      const angle = (degree * Math.PI) / 180
      grid.put(
        Math.round(cx + Math.cos(angle) * rx),
        Math.round(cy + Math.sin(angle) * ry),
        "."
      )
    }
  }
  grid.put(cx - 1, cy, "(*)", { lit: true, fixed: true })

  system.bodies.forEach((body, index) => {
    const orbit = Math.floor(index / 2) + 1
    // Odd orbits hold their pair top right and bottom left, even ones the
    // other way, so every body has a row to itself.
    const side = (orbit % 2 ? 1 : -1) * (index % 2 ? -1 : 1)
    const up = index % 2 ? 1 : -1
    const col = Math.round(cx + side * 0.5 * orbit * step * stretch)
    const row = Math.round(cy + up * 0.87 * orbit * step)
    const glyph = body.kind === "station" ? "#" : "o"
    const label = names ? body.name : String(index + 1)
    const tone = { lit: Boolean(body.href), href: body.href, fixed: true }
    if (side > 0) {
      grid.put(col - 1, row, " ".repeat(label.length + 4))
      grid.put(col, row, `${glyph} ${label}`, tone)
    } else {
      grid.put(col - label.length - 2, row, " ".repeat(label.length + 4))
      grid.put(col - label.length - 1, row, `${label} ${glyph}`, tone)
    }
  })
  return grid.segments()
}
