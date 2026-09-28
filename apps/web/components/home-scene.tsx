"use client"

import {
  parseScene,
  Scene3D,
  type SceneV1,
  type SceneView,
} from "@workspace/3d"

import sceneFile from "@/lib/home-scene.json"
import { useReducedMotion } from "@/lib/use-reduced-motion"

/** The zyx mark, as saved from 3d.zyx.tw. */
const SCENE = parseScene(sceneFile)

/** Straight on, so the mark sits square until the mouse tilts it. */
const FRONT: SceneView = { azimuth: 0, elevation: 0 }

/**
 * The same scene with its hover motion off. A renderer that has no hover
 * motion ignores the field, so this holds whether or not it has one.
 */
const STILL = { ...SCENE, motion: { hover: false } } as SceneV1

/**
 * The mark in the middle of the viewport, facing the viewer; it leans toward
 * the mouse where the renderer does that, and holds still for visitors who
 * ask for reduced motion. No orbit controls: the page is to look at, not to
 * edit.
 */
export function HomeScene() {
  const reduced = useReducedMotion()
  return (
    <Scene3D
      scene={reduced ? STILL : SCENE}
      view={FRONT}
      controls={false}
      className="size-full"
    />
  )
}
