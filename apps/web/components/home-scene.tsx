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
 * The zyx mark, as saved from 3d.zyx.tw, as a black hole: flat black that
 * ignores light, with rounder edges. It turns by itself and by hand, so it
 * doesn't follow the pointer, and glow and a vignette would tint the
 * picture the frame now carries.
 */
const SCENE = (() => {
  const scene = parseScene(sceneFile)
  return {
    ...scene,
    shape: { ...scene.shape, bevel: 0.12 },
    material: { id: "void", params: {} },
    effects: [],
    motion: { hover: false },
  } as SceneV1
})()

/** Straight on, so the mark starts square. */
const FRONT: SceneView = { azimuth: 0, elevation: 0 }

/**
 * The mark a little above the middle of the viewport, half behind the hills,
 * tumbling slowly while the sky drifts and bends around it; a drag turns it
 * and throws it. Visitors who ask for reduced motion get no tumble, drift or
 * parallax, only the drag and the bending.
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
      rise={!reduced}
      // The sky alone: the hills are in front of the hole, not behind it.
      backgroundImage="/bliss-sky.webp"
      lift={0.04}
      lens={0.2}
      lighting={false}
      // One pixel per CSS pixel holds 60 fps; the mark is a silhouette.
      dpr={[1, 1]}
      ambient={!reduced}
      className="size-full"
    />
  )
}
