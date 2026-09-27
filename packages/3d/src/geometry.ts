import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"
import {
  mergeGeometries,
  toCreasedNormals,
} from "three/examples/jsm/utils/BufferGeometryUtils.js"

import { shapeControls } from "./controls"
import { defaultValues, resolveValues } from "./params"
import type { SceneV1 } from "./schema"

/** Length of the shape's longer side, in scene units. Depth and bevel are measured against it. */
export const SHAPE_SIZE = 2

/** Faces meeting at a sharper angle keep a hard edge; gentler ones, like bevel steps and curves, shade smooth. */
const CREASE_ANGLE = THREE.MathUtils.degToRad(40)

/** ExtrudeGeometry's group material index for the front and back faces. */
const LID_GROUP = 0

/** Extrudes the SVG's filled areas into a mesh centred on the origin. Throws when the SVG has nothing to extrude. */
export function buildShapeGeometry(
  shape: SceneV1["shape"]
): THREE.BufferGeometry {
  const { paths } = new SVGLoader().parse(shape.svg)
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
  const scale = SHAPE_SIZE / longest

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
  })
  extruded.scale(scale, scale, scale)
  // SVG's y axis points down. A half turn around x stands the shape upright
  // without mirroring it, which a negative scale would.
  extruded.rotateX(Math.PI)
  extruded.center()

  const geometry = smoothSides(extruded)
  extruded.dispose()
  return geometry
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
    buildShapeGeometry({ svg, ...defaultValues(shapeControls) }).dispose()
    return null
  } catch (error) {
    return error instanceof Error ? error.message : "The SVG could not be read"
  }
}
