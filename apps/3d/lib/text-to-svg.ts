import {
  Clipper64,
  ClipType,
  FillRule,
  PathType,
  PolyTree64,
  type Path64,
  type PolyPath64,
} from "@countertype/clipper2-ts"
import { create, type Font, type Glyph } from "fontkit"

import type { TextFont } from "@/lib/fonts"

/** What a text becomes: its outlines as an SVG, and what the font can't draw. */
export type TextOutline = {
  /** null when the font draws none of the text. */
  svg: string | null
  /** Characters the font has no glyph for, in the order they appear; they're left out. */
  missing: string[]
}

/** The font couldn't be fetched or read. */
export class FontLoadError extends Error {}

const CSS_API = "https://fonts.googleapis.com/css2"

/**
 * The outlines' longer side, in SVG units. Points snap to this integer grid,
 * which the union works on, and it is far finer than any screen.
 */
const GRID = 10_000

/** Curves become lines at most this far from the curve, in grid units. */
const TOLERANCE = 1.5

/**
 * The most a curve turns along one line. Well under the walls' 40 degree
 * crease angle, so curves shade smooth however small the text is.
 */
const MAX_TURN = (12 * Math.PI) / 180

const MAX_CURVE_SEGMENTS = 32

/** Rings smaller than this, in square grid units, are union slivers. */
const MIN_AREA = 4

/**
 * Sets the text in the font and returns its outlines: each line centred,
 * glyphs kerned, overlapping contours merged, so the SVG extrudes cleanly.
 * Only the glyphs the text uses are fetched.
 */
export async function textToSvg(
  text: string,
  font: TextFont
): Promise<TextOutline> {
  const lines = text.split("\n").map((line) => line.trim())
  const chars = [...new Set(lines.join(""))].sort()
  if (chars.length === 0) return { svg: null, missing: [] }

  const face = await loadFace(font, chars)
  const { placements, missing } = setLines(
    face,
    lines,
    font.lineHeight * face.unitsPerEm
  )
  const drawn = placements.filter(({ glyph }) => glyph.path.commands.length > 0)
  const scale = gridScale(drawn)
  const rings = scale ? drawn.flatMap((glyph) => contours(glyph, scale)) : []
  return { svg: rings.length > 0 ? toSvg(union(rings)) : null, missing }
}

/**
 * The fonts parsed so far, newest last. A subset serves any text within its
 * characters, so deleting never fetches.
 */
const faces: { font: string; chars: Set<string>; face: Promise<Font> }[] = []

const CACHED_FACES = 8

function loadFace(font: TextFont, chars: string[]): Promise<Font> {
  const cached = faces.find(
    (entry) =>
      entry.font === font.id && chars.every((char) => entry.chars.has(char))
  )
  if (cached) return cached.face
  const entry = {
    font: font.id,
    chars: new Set(chars),
    face: fetchFace(font, chars),
  }
  faces.push(entry)
  if (faces.length > CACHED_FACES) faces.shift()
  // A failed fetch isn't kept, so the next try fetches again.
  entry.face.catch(() => {
    const index = faces.indexOf(entry)
    if (index >= 0) faces.splice(index, 1)
  })
  return entry.face
}

/**
 * The CSS2 API subsets a family to the characters in `text=`, so a few
 * glyphs cost a few kilobytes even in a Chinese font. It answers with a
 * stylesheet that points at the file.
 */
async function fetchFace(font: TextFont, chars: string[]): Promise<Font> {
  try {
    const query = new URLSearchParams({
      family: font.family,
      text: chars.join(""),
    })
    const css = await (await request(`${CSS_API}?${query}`)).text()
    const url = /url\((https:\/\/fonts\.gstatic\.com\/[^)\s]+)\)/.exec(css)?.[1]
    if (!url) throw new FontLoadError(`The stylesheet lists no file`)
    const bytes = new Uint8Array(await (await request(url)).arrayBuffer())
    // fontkit reads any byte array; its types ask for a Node Buffer.
    const face = create(bytes as unknown as Buffer)
    if (!("layout" in face)) throw new FontLoadError(`Not a single font`)
    return face
  } catch (error) {
    throw error instanceof FontLoadError
      ? error
      : new FontLoadError(`${font.label} could not be loaded`, {
          cause: error,
        })
  }
}

async function request(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new FontLoadError(`${new URL(url).host} answered ${response.status}`)
  }
  return response
}

/** A glyph and where its origin sits, in font units with y pointing up. */
type Placement = { glyph: Glyph; x: number; y: number }

/** Missing characters worth naming; spaces and control characters aren't. */
const VISIBLE = /[\p{L}\p{M}\p{N}\p{P}\p{S}]/u

function setLines(face: Font, lines: string[], lineHeight: number) {
  const placements: Placement[] = []
  const missing = new Set<string>()
  lines.forEach((line, row) => {
    const run = face.layout(line)
    const placed: Placement[] = []
    let pen = 0
    run.glyphs.forEach((glyph, index) => {
      const position = run.positions[index]
      if (!position) return
      // Glyph 0 is .notdef, drawn for characters the font lacks.
      if (glyph.id === 0) {
        for (const codePoint of glyph.codePoints) {
          const char = String.fromCodePoint(codePoint)
          if (VISIBLE.test(char)) missing.add(char)
        }
        return
      }
      placed.push({
        glyph,
        x: pen + position.xOffset,
        y: position.yOffset - row * lineHeight,
      })
      pen += position.xAdvance
    })
    // Centred on the advances, the way centred type sits.
    for (const placement of placed) {
      placements.push({ ...placement, x: placement.x - pen / 2 })
    }
  })
  return { placements, missing: [...missing] }
}

/** Font units to grid units, from the glyphs' control boxes. */
function gridScale(placements: Placement[]): number | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const { glyph, x, y } of placements) {
    const box = glyph.path.cbox
    minX = Math.min(minX, x + box.minX)
    maxX = Math.max(maxX, x + box.maxX)
    minY = Math.min(minY, y + box.minY)
    maxY = Math.max(maxY, y + box.maxY)
  }
  const longest = Math.max(maxX - minX, maxY - minY)
  return longest > 0 && Number.isFinite(longest) ? GRID / longest : null
}

type Point = { x: number; y: number }

/** A glyph's contours on the grid, y flipped to point down as SVG's does. */
function contours({ glyph, x, y }: Placement, scale: number): Path64[] {
  const rings: Path64[] = []
  let ring: Path64 = []
  let current: Point = { x: 0, y: 0 }
  const toGrid = (px = 0, py = 0): Point => ({
    x: (x + px) * scale,
    y: -(y + py) * scale,
  })
  const add = (point: Point) => {
    const snapped = { x: Math.round(point.x), y: Math.round(point.y) }
    const last = ring.at(-1)
    if (!last || last.x !== snapped.x || last.y !== snapped.y) {
      ring.push(snapped)
    }
    current = point
  }
  const close = () => {
    if (ring.length > 2) rings.push(ring)
    ring = []
  }

  for (const { command, args } of glyph.path.commands) {
    const [a, b, c, d, e, f] = args
    switch (command) {
      case "moveTo":
        close()
        add(toGrid(a, b))
        break
      case "lineTo":
        add(toGrid(a, b))
        break
      case "quadraticCurveTo": {
        const from = current
        const control = toGrid(a, b)
        const to = toGrid(c, d)
        const count = segments([from, control, to])
        for (let i = 1; i <= count; i++) {
          add(bezier([from, control, to], i / count))
        }
        break
      }
      case "bezierCurveTo": {
        const points = [current, toGrid(a, b), toGrid(c, d), toGrid(e, f)]
        const count = segments(points)
        for (let i = 1; i <= count; i++) add(bezier(points, i / count))
        break
      }
      case "closePath":
        close()
        break
    }
  }
  close()
  return rings
}

/**
 * Enough lines to keep within TOLERANCE of the curve and turn at most
 * MAX_TURN each. The distance bound comes from the curve's second
 * derivative, which is largest where its control polygon bends most.
 */
function segments(points: Point[]): number {
  let bend = 0
  for (let i = 2; i < points.length; i++) {
    const [p, q, r] = [points[i - 2]!, points[i - 1]!, points[i]!]
    bend = Math.max(bend, Math.hypot(p.x - 2 * q.x + r.x, p.y - 2 * q.y + r.y))
  }
  // |B''| is 2 * bend for a quadratic and at most 6 * bend for a cubic; a
  // line over parameter step h strays at most h^2 * |B''| / 8.
  const degree = points.length - 1
  const byDistance = Math.sqrt((degree * (degree - 1) * bend) / (8 * TOLERANCE))
  const byTurn = turning(points) / MAX_TURN
  return Math.min(
    MAX_CURVE_SEGMENTS,
    Math.max(1, Math.ceil(Math.max(byDistance, byTurn)))
  )
}

/** How far the control polygon turns in total, which bounds the curve's turn. */
function turning(points: Point[]): number {
  const steps: Point[] = []
  for (let i = 1; i < points.length; i++) {
    const step = {
      x: points[i]!.x - points[i - 1]!.x,
      y: points[i]!.y - points[i - 1]!.y,
    }
    if (step.x !== 0 || step.y !== 0) steps.push(step)
  }
  let total = 0
  for (let i = 1; i < steps.length; i++) {
    const [u, v] = [steps[i - 1]!, steps[i]!]
    total += Math.abs(Math.atan2(u.x * v.y - u.y * v.x, u.x * v.x + u.y * v.y))
  }
  return total
}

/** A point on the Bézier curve with these control points, by de Casteljau. */
function bezier(points: Point[], t: number): Point {
  let level = points
  while (level.length > 1) {
    level = level.slice(1).map((point, i) => ({
      x: level[i]!.x + (point.x - level[i]!.x) * t,
      y: level[i]!.y + (point.y - level[i]!.y) * t,
    }))
  }
  return level[0]!
}

/**
 * Glyphs are drawn with overlapping contours, within a glyph (strokes of a
 * Chinese character, a serif on a stem) and between them (the joins of a
 * script). They fill by the nonzero rule, which extruding each contour on
 * its own gets wrong: lids stack and walls cross. The union leaves the
 * filled area as simple outlines, each with its holes.
 */
function union(rings: Path64[]): PolyTree64 {
  const clipper = new Clipper64()
  clipper.addPaths(rings, PathType.Subject)
  const tree = new PolyTree64()
  clipper.execute(ClipType.Union, FillRule.NonZero, tree)
  return tree
}

/**
 * One path per outline with its holes, so three.js pairs them without
 * searching. Outlines wind with positive area and holes with negative, the
 * pairing three.js reads for the nonzero rule and the one ExtrudeGeometry
 * checks and reorders its holes by.
 */
function toSvg(tree: PolyTree64): string | null {
  const paths: string[] = []
  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  }
  const ringData = (ring: Path64 | null, sign: 1 | -1) => {
    const signed = ring ? area(ring) : 0
    if (!ring || Math.abs(signed) < MIN_AREA) return null
    const points = signed * sign > 0 ? ring : [...ring].reverse()
    const [first, ...rest] = points
    if (!first) return null
    let previous = first
    let data = `M${first.x} ${first.y}l`
    rest.forEach((point, i) => {
      const dx = point.x - previous.x
      const dy = point.y - previous.y
      // A minus sign separates numbers on its own.
      data += `${i > 0 && dx >= 0 ? " " : ""}${dx}${dy >= 0 ? " " : ""}${dy}`
      previous = point
    })
    for (const { x, y } of points) {
      bounds.minX = Math.min(bounds.minX, x)
      bounds.maxX = Math.max(bounds.maxX, x)
      bounds.minY = Math.min(bounds.minY, y)
      bounds.maxY = Math.max(bounds.maxY, y)
    }
    return `${data}z`
  }
  const addOutline = (node: PolyPath64) => {
    const outline = ringData(node.polygon, 1)
    if (!outline) return
    let data = outline
    for (let i = 0; i < node.count; i++) {
      const hole = node.child(i)
      data += ringData(hole.polygon, -1) ?? ""
      // An outline inside a hole, like the inner square of 回, is its own shape.
      for (let j = 0; j < hole.count; j++) addOutline(hole.child(j))
    }
    paths.push(`<path d="${data}"/>`)
  }
  for (let i = 0; i < tree.count; i++) addOutline(tree.child(i))
  if (paths.length === 0) return null

  const margin = GRID / 100
  const viewBox = [
    bounds.minX - margin,
    bounds.minY - margin,
    bounds.maxX - bounds.minX + 2 * margin,
    bounds.maxY - bounds.minY + 2 * margin,
  ]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.join(" ")}">${paths.join("")}</svg>`
}

/** Shoelace area; positive runs counter-clockwise in y-up terms, as ShapeUtils has it. */
function area(ring: Path64): number {
  let sum = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += ring[j]!.x * ring[i]!.y - ring[i]!.x * ring[j]!.y
  }
  return sum / 2
}
