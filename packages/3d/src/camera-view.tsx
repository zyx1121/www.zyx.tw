import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import * as THREE from "three"

import type { SceneView } from "./scene-3d"

/** Seconds the camera takes to swing to a new view. */
const SWING_SECONDS = 0.8

type Swing = { from: THREE.Spherical; to: THREE.Spherical; progress: number }

/**
 * Swings the camera to a new view when the view changes, around the shape
 * and at the distance it already has, so the portrait fit and the viewer's
 * zoom stay. The canvas starts at the first view, so that one needs no
 * swing; orbit controls carry on from wherever a swing ends.
 */
export function CameraView({ azimuth, elevation }: SceneView) {
  const camera = useThree((state) => state.camera)
  const shown = useRef({ azimuth, elevation })
  const swing = useRef<Swing | null>(null)
  useLayoutEffect(() => {
    const last = shown.current
    if (last.azimuth === azimuth && last.elevation === elevation) return
    shown.current = { azimuth, elevation }
    const from = new THREE.Spherical().setFromVector3(camera.position)
    const to = new THREE.Spherical(
      1,
      THREE.MathUtils.degToRad(90 - elevation),
      THREE.MathUtils.degToRad(azimuth)
    )
    // The short way around.
    to.theta = from.theta + wrapAngle(to.theta - from.theta)
    swing.current = { from, to, progress: 0 }
  }, [camera, azimuth, elevation])
  useFrame((_, delta) => {
    const current = swing.current
    if (!current) return
    current.progress = Math.min(1, current.progress + delta / SWING_SECONDS)
    const t = easeInOut(current.progress)
    camera.position.setFromSphericalCoords(
      camera.position.length(),
      THREE.MathUtils.lerp(current.from.phi, current.to.phi, t),
      THREE.MathUtils.lerp(current.from.theta, current.to.theta, t)
    )
    camera.lookAt(0, 0, 0)
    if (current.progress === 1) swing.current = null
  })
  return null
}

/** The same angle, between -π and π. */
function wrapAngle(radians: number) {
  return radians - 2 * Math.PI * Math.round(radians / (2 * Math.PI))
}

/** Cubic ease in and out: starts and stops gently. */
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (2 - 2 * t) ** 3 / 2
}
