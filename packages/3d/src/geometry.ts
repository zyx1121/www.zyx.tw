import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"
import {
  mergeGeometries,
  toCreasedNormals,
} from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { shapeControls } from "./controls"
import { resolveValues } from "./params"
import type { SceneV1 } from "./schema"

/** Length of the shape's longer side, in scene units. Depth and bevel are measured against it. */
export const SHAPE_SIZE = 2

/** Faces meeting at a sharper angle keep a hard edge; gentler ones, like bevel steps and curves, shade smooth. */
const CREASE_ANGLE = THREE.MathUtils.degToRad(40)

/** The shape's longer side while its normals are computed. */
const SMOOTHING_SIZE = 2000

/** ExtrudeGeometry's group material index for the front and back faces. */
const LID_GROUP = 0

/** Extrudes the SVG's filled areas into a mesh centred on the origin. Throws when the SVG has nothing to extrude. */
export function buildShapeGeometry(
  shape: SceneV1["shape"]
): THREE.BufferGeometry {
  const { shapes, scale, bounds } = readShapes(shape.svg)

  const { depth, bevel, bevelSegments, curveSegments } = resolveValues(
    shapeControls,
    shape
  )
  // Extrude in SVG units so curve sampling follows the drawing, then scale
  // down to scene units.
  const extruded = new THREE.ExtrudeGeometry(shapes, {
    depth: depth / scale,
    bevelEnabled: bevel > 0,
    bevelSize: bevel / scale,
    bevelThickness: bevel / scale,
    bevelSegments: Math.round(bevelSegments),
    curveSegments: Math.round(curveSegments),
    UVGenerator: shapeUVs(bounds),
  })
  // toCreasedNormals finds shared vertices on a 0.01 grid. At scene size the
  // bevel's rings sit about 0.004 apart, so it would merge neighbours and
  // streak the reflections; at SMOOTHING_SIZE the grid is far finer than
  // any vertex spacing.
  const toSmoothing = (scale * SMOOTHING_SIZE) / SHAPE_SIZE
  extruded.scale(toSmoothing, toSmoothing, toSmoothing)
  // SVG's y axis points down. A half turn around x stands the shape upright
  // without mirroring it, which a negative scale would.
  extruded.rotateX(Math.PI)

  const geometry = smoothSides(extruded)
  extruded.dispose()
  const toScene = SHAPE_SIZE / SMOOTHING_SIZE
  geometry.scale(toScene, toScene, toScene)
  geometry.center()
  return geometry
}

/** The SVG's outlines, their bounds, and the factor that brings the longer side to SHAPE_SIZE. */
function readShapes(svg: string): {
  shapes: THREE.Shape[]
  scale: number
  bounds: THREE.Box2
} {
  const { paths } = new SVGLoader().parse(svg)
  // A path with fill="none" is a stroke, not an area. Use those only when
  // nothing is filled, so a line-art SVG still becomes something.
  const filled = paths.filter((path) => fillOf(path) !== "none")
  const shapes = (filled.length > 0 ? filled : paths).flatMap((path) =>
    path.toShapes()
  )
  if (shapes.length === 0) {
    throw new Error("The SVG has no closed shapes to extrude")
  }

  const bounds = new THREE.Box2()
  for (const outline of shapes) {
    for (const point of outline.getPoints()) bounds.expandByPoint(point)
  }
  const size = bounds.getSize(new THREE.Vector2())
  const longest = Math.max(size.x, size.y)
  if (!(longest > 0)) throw new Error("The SVG's shapes have no area")
  return { shapes, scale: SHAPE_SIZE / longest, bounds }
}

/**
 * ExtrudeGeometry's own UVs are coordinates in SVG units, so a texture would
 * tile once per unit, thousands of times on a large drawing. These measure
 * the same projections in lengths of the shape's longer side, from its bottom
 * left corner: an image spans every shape once and lands upright on the
 * front, lids and walls at the same scale. The lids project straight on; each
 * wall, as in three's own generator, along the axis it runs closest to and
 * down the depth.
 */
function shapeUVs(bounds: THREE.Box2): THREE.UVGenerator {
  const size = bounds.getSize(new THREE.Vector2())
  const unit = 1 / Math.max(size.x, size.y)
  // Across and up the shape; SVG's y axis points down, a texture's v up.
  const across = (x: number) => (x - bounds.min.x) * unit
  const up = (y: number) => (bounds.max.y - y) * unit
  const point = (vertices: number[], i: number) =>
    new THREE.Vector3().fromArray(vertices, i * 3)
  return {
    generateTopUV(_geometry, vertices, a, b, c) {
      return [a, b, c].map((i) => {
        const { x, y } = point(vertices, i)
        return new THREE.Vector2(across(x), up(y))
      })
    },
    generateSideWallUV(_geometry, vertices, a, b, c, d) {
      // a to b runs along the outline.
      const run = point(vertices, b).sub(point(vertices, a))
      const alongX = Math.abs(run.x) > Math.abs(run.y)
      return [a, b, c, d].map((i) => {
        const { x, y, z } = point(vertices, i)
        return new THREE.Vector2(alongX ? across(x) : up(y), z * unit)
      })
    },
  }
}

/**
 * ExtrudeGeometry shades every face flat, which shows as facets in
 * reflections. The walls and bevel get creased normals: smooth along curves,
 * hard at real corners. The lids stay flat; smoothing them with the bevel
 * would tilt every outline vertex and streak the face.
 */
function smoothSides(extruded: THREE.BufferGeometry): THREE.BufferGeometry {
  const parts = extruded.groups.map(({ start, count, materialIndex }) => {
    const part = slice(extruded, start, count)
    return materialIndex === LID_GROUP
      ? part
      : toCreasedNormals(part, CREASE_ANGLE)
  })
  const merged = parts.length > 0 ? mergeGeometries(parts) : null
  for (const part of parts) part.dispose()
  if (!merged) throw new Error("The extruded shape could not be assembled")
  return merged
}

/** A copy of vertices [start, start + count) of a non-indexed geometry. */
function slice(
  geometry: THREE.BufferGeometry,
  start: number,
  count: number
): THREE.BufferGeometry {
  const part = new THREE.BufferGeometry()
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    if (!(attribute instanceof THREE.BufferAttribute)) continue
    const { itemSize, normalized } = attribute
    const array = attribute.array.slice(
      start * itemSize,
      (start + count) * itemSize
    )
    part.setAttribute(
      name,
      new THREE.BufferAttribute(array, itemSize, normalized)
    )
  }
  return part
}

/** SVGLoader puts each path's computed style in userData, which its types leave untyped. */
function fillOf(path: THREE.ShapePath): string | undefined {
  const style = path.userData?.style as { fill?: unknown } | undefined
  return typeof style?.fill === "string" ? style.fill : undefined
}

/** Why this SVG can't become a shape, or null when it can. */
export function checkSvg(svg: string): string | null {
  try {
    // Reading the outlines catches an SVG with nothing to extrude without
    // paying for the extrusion; the preview builds the mesh right after.
    readShapes(svg)
    return null
  } catch (error) {
    return error instanceof Error ? error.message : "The SVG could not be read"
  }
}
