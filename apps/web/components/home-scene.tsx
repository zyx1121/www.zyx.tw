"use client"

import {
  parseScene,
  Scene3D,
  type SceneV1,
  type SceneView,
} from "@workspace/3d"

import sceneFile from "@/lib/home-scene.json"
import { useReducedMotion } from "@/lib/use-reduced-motion"

/**
 * The zyx mark, as saved from 3d.zyx.tw, in liquid glass with rounder
 * edges. It turns by itself and by hand, so it doesn't follow the pointer.
 */
const SCENE = (() => {
  const scene = parseScene(sceneFile)
  return {
    ...scene,
    shape: { ...scene.shape, bevel: 0.08 },
    material: { id: "liquid", params: {} },
    motion: { hover: false },
  } as SceneV1
})()

/** Straight on, so the mark starts square. */
const FRONT: SceneView = { azimuth: 0, elevation: 0 }

/**
 * The mark a little above the middle of the viewport, half behind the hills,
 * tumbling slowly; a drag turns it and throws it. Visitors who ask for
 * reduced motion get no tumble, only the drag.
 */
export function HomeScene() {
  const reduced = useReducedMotion()
  return (
    <Scene3D
      scene={SCENE}
      view={FRONT}
      controls={false}
      transparent
      drift={reduced ? 0 : 1.6}
      grab
      backgroundImage="/bliss.webp"
      lift={0.04}
      className="size-full"
    />
  )
}
