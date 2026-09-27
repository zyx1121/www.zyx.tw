"use client"

import { Environment, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { EffectComposer, ToneMapping } from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"
import { Fragment, Suspense, useEffect, useMemo } from "react"
import * as THREE from "three"

import { environmentControls, stagingControls } from "./controls"
import { effects as effectPresets } from "./effects"
import { environments } from "./environments"
import { buildShapeGeometry } from "./geometry"
import { materials } from "./materials"
import { resolveValues } from "./params"
import { findPreset } from "./registry"
import type { SceneV1 } from "./schema"
import { untoneMap } from "./tone"

/** The editor at 3d.zyx.tw serves the environment maps, with CORS open to other sites. */
export const DEFAULT_ENV_BASE_URL = "https://3d.zyx.tw/env/"

export type Scene3DProps = {
  scene: SceneV1
  /** Where environment files live; a preset's file name is appended to it. */
  envBaseUrl?: string
  className?: string
  /** Orbit with pointer or touch. */
  controls?: boolean
  autoRotate?: boolean
}

/** Renders a scene.json. Use it from a client component. */
export function Scene3D({
  scene,
  envBaseUrl = DEFAULT_ENV_BASE_URL,
  className,
  controls = true,
  autoRotate = false,
}: Scene3DProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 6], fov: 35 }}
      dpr={[1, 2]}
    >
      <SceneContents scene={scene} envBaseUrl={envBaseUrl} />
      {controls && (
        <OrbitControls
          enablePan={false}
          enableDamping
          autoRotate={autoRotate}
          minDistance={3}
          maxDistance={14}
        />
      )}
    </Canvas>
  )
}

function SceneContents({
  scene,
  envBaseUrl,
}: {
  scene: SceneV1
  envBaseUrl: string
}) {
  const geometry = useShapeGeometry(scene.shape)
  const material = findPreset(materials, scene.material.id) ?? materials[0]
  const environment =
    findPreset(environments, scene.environment.id) ?? environments[0]
  const env = resolveValues(environmentControls, scene.environment)
  const staging = resolveValues(stagingControls, scene.staging)
  const envRotation: [number, number, number] = [
    0,
    THREE.MathUtils.degToRad(env.rotation),
    0,
  ]
  const activeEffects = scene.effects.flatMap((effect) => {
    const preset = findPreset(effectPresets, effect.id)
    return preset
      ? [{ preset, values: resolveValues(preset.params, effect.params) }]
      : []
  })
  const composing = activeEffects.length > 0
  // With a composer the background goes through tone mapping too, so hand it
  // the color that comes out as the one picked.
  const background = composing
    ? untoneMap(new THREE.Color(staging.background))
    : new THREE.Color(staging.background)

  return (
    <>
      {!env.background && (
        <color
          attach="background"
          args={[background.r, background.g, background.b]}
        />
      )}
      <Suspense fallback={null}>
        <Environment
          files={envBaseUrl + environment.file}
          background={env.background}
          environmentIntensity={env.intensity}
          environmentRotation={envRotation}
          backgroundRotation={envRotation}
        />
      </Suspense>
      <directionalLight
        position={lightPosition(staging.lightAzimuth, staging.lightElevation)}
        intensity={staging.lightIntensity}
      />
      {geometry && (
        <mesh geometry={geometry}>
          {/* Keyed so switching presets starts from a fresh material
              instead of inheriting the last preset's settings. */}
          <Fragment key={material.id}>
            {material.render(
              resolveValues(material.params, scene.material.params)
            )}
          </Fragment>
        </mesh>
      )}
      {composing && (
        <EffectComposer>
          {activeEffects.map(({ preset, values }) => (
            <Fragment key={preset.id}>{preset.render(values)}</Fragment>
          ))}
          {/* three.js only tone maps when it draws straight to the screen,
              so with a composer in between the effects chain has to end with
              the same ACES curve, or turning on any effect washes the
              scene out. */}
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </>
  )
}

function useShapeGeometry({
  svg,
  depth,
  bevel,
  bevelSegments,
  curveSegments,
}: SceneV1["shape"]) {
  const geometry = useMemo(
    () => tryBuild({ svg, depth, bevel, bevelSegments, curveSegments }),
    [svg, depth, bevel, bevelSegments, curveSegments]
  )
  useEffect(() => () => geometry?.dispose(), [geometry])
  return geometry
}

/** An unreadable SVG renders nothing rather than taking the page down. */
function tryBuild(shape: SceneV1["shape"]) {
  try {
    return buildShapeGeometry(shape)
  } catch {
    return null
  }
}

/** Degrees in, a point on a sphere around the shape out. */
function lightPosition(
  azimuth: number,
  elevation: number
): [number, number, number] {
  const theta = THREE.MathUtils.degToRad(azimuth)
  const phi = THREE.MathUtils.degToRad(elevation)
  const distance = 10
  return [
    distance * Math.cos(phi) * Math.sin(theta),
    distance * Math.sin(phi),
    distance * Math.cos(phi) * Math.cos(theta),
  ]
}
