"use client"

import { GainMapLoader } from "@monogrid/gainmap-js"
import { Environment, OrbitControls, useEnvironment } from "@react-three/drei"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { EffectComposer, ToneMapping } from "@react-three/postprocessing"
import { RenderPass, ToneMappingMode } from "postprocessing"
import {
  Component,
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react"
import * as THREE from "three"

import { Backdrop } from "./backdrop"
import { environmentControls, stagingControls } from "./controls"
import { effects as effectPresets } from "./effects"
import { environments } from "./environments"
import { buildShapeGeometry } from "./geometry"
import { materials } from "./materials"
import { resolveValues } from "./params"
import { findPreset, type EffectPreset } from "./registry"
import type { SceneV1 } from "./schema"

/** The editor at 3d.zyx.tw serves the environment maps, with CORS open to other sites. */
export const DEFAULT_ENV_BASE_URL = "https://3d.zyx.tw/env/"

/** Radians per second when autoRotate turns the shape. */
const SPIN_SPEED = 0.4

/** Where the camera starts, in degrees: around the shape and above it. */
export type SceneView = { azimuth: number; elevation: number }

/** From the left and above, so the depth and bevel show at a glance. */
export const DEFAULT_VIEW: SceneView = { azimuth: -30, elevation: 30 }

const CAMERA_DISTANCE = 6

export type Scene3DProps = {
  scene: SceneV1
  /** Where environment files live; a preset's file paths are appended to it. */
  envBaseUrl?: string
  className?: string
  /** Orbit, zoom and turn with pointer or touch. */
  controls?: boolean
  /** Turn the shape slowly about its vertical axis, with or without controls. */
  autoRotate?: boolean
  /** The starting camera angle; read once, when the canvas mounts. */
  view?: SceneView
}

/** Renders a scene.json. Use it from a client component; it fills its parent. */
export function Scene3D({
  scene,
  envBaseUrl = DEFAULT_ENV_BASE_URL,
  className,
  controls = true,
  autoRotate = false,
  view = DEFAULT_VIEW,
}: Scene3DProps) {
  return (
    <Canvas
      className={className}
      camera={{
        position: onSphere(view.azimuth, view.elevation, CAMERA_DISTANCE),
        fov: 35,
      }}
      dpr={[1, 2]}
      // Every frame goes through the composer, which antialiases on its own.
      gl={{ antialias: false }}
    >
      <FitCamera />
      <SceneContents
        scene={scene}
        envBaseUrl={envBaseUrl}
        autoRotate={autoRotate}
      />
      {controls && (
        <OrbitControls
          enablePan={false}
          enableDamping
          minDistance={3}
          maxDistance={20}
        />
      )}
    </Canvas>
  )
}

/**
 * The camera distance frames the shape top to bottom; on a portrait screen
 * that crops it at the sides, so the camera backs off by the aspect ratio,
 * keeping its direction. It scales whatever distance the camera is at, so a
 * zoom the viewer chose survives resizing and rotating the screen.
 */
function FitCamera() {
  const camera = useThree((state) => state.camera)
  const aspect = useThree((state) => state.size.width / state.size.height)
  const applied = useRef(1)
  useLayoutEffect(() => {
    const fit = 1 / Math.min(1, aspect)
    camera.position.multiplyScalar(fit / applied.current)
    applied.current = fit
  }, [camera, aspect])
  return null
}

function SceneContents({
  scene,
  envBaseUrl,
  autoRotate,
}: {
  scene: SceneV1
  envBaseUrl: string
  autoRotate: boolean
}) {
  const geometry = useShapeGeometry(scene.shape)
  const spin = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (autoRotate && spin.current)
      spin.current.rotation.y += delta * SPIN_SPEED
  })

  const material = findPreset(materials, scene.material.id) ?? materials[0]
  const environment =
    findPreset(environments, scene.environment.id) ?? environments[0]
  const env = resolveValues(environmentControls, scene.environment)
  const staging = resolveValues(stagingControls, scene.staging)
  const envFiles = useMemo(
    () =>
      typeof environment.files === "string"
        ? envBaseUrl + environment.files
        : environment.files.map((file) => envBaseUrl + file),
    [environment, envBaseUrl]
  )
  const envKey = String(envFiles)
  const releasePreviousMap = useReleasePreviousMap()
  const envRotation: [number, number, number] = [
    0,
    THREE.MathUtils.degToRad(env.rotation),
    0,
  ]
  // Registry order and one of each, whatever order the file lists them in;
  // ids this version doesn't know are skipped.
  const active = effectPresets.flatMap((preset) => {
    const stored = scene.effects.find((effect) => effect.id === preset.id)
    return stored
      ? [{ preset, values: resolveValues(preset.params, stored.params) }]
      : []
  })
  const backdrop = !env.background
  useTransmissionBackground(staging.background)
  const effectsAt = (stage: EffectPreset["stage"]) =>
    active
      .filter(({ preset }) => preset.stage === stage)
      .map(({ preset, values }) => (
        <Fragment key={preset.id}>{preset.render(values)}</Fragment>
      ))

  return (
    <>
      {/* Keyed by URL, so picking another environment retries after a
          failed one. */}
      <EnvironmentBoundary key={envKey}>
        <Suspense fallback={null}>
          <EnvironmentMap
            files={envFiles}
            onReady={releasePreviousMap}
            background={env.background}
            intensity={env.intensity}
            rotation={envRotation}
          />
        </Suspense>
      </EnvironmentBoundary>
      <directionalLight
        position={onSphere(staging.lightAzimuth, staging.lightElevation, 10)}
        intensity={staging.lightIntensity}
      />
      <group ref={spin}>
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
      </group>
      {/* three.js tone maps only when it draws straight to the screen, and
          it never tone maps a plain background color. With the composer in
          between, the chain does both jobs itself, in that order: glow on
          the linear frame, ACES as three would apply it, then the
          background color untouched, then effects on the finished image. */}
      <EffectComposer
        // The render pass is fixed when a composer is made, so each mode
        // gets its own. Clearing is the render pass's job; three's own
        // clear would paint the frame opaque.
        key={backdrop ? "backdrop" : "environment"}
        autoClear={false}
        renderPass={backdrop ? transparentRenderPass : undefined}
      >
        {effectsAt("scene")}
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        {backdrop ? <Backdrop color={staging.background} /> : null}
        {effectsAt("display")}
      </EffectComposer>
    </>
  )
}

/**
 * Glass samples whatever three clears its transmission target to: the
 * renderer's clear color when that is opaque, a half-transparent white when
 * it isn't. So the renderer clears to the background color, and the frame
 * itself is cleared by transparentRenderPass.
 */
function useTransmissionBackground(background: string) {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    gl.setClearColor(new THREE.Color(background), 1)
  }, [gl, background])
}

/**
 * Clears the frame to transparent black instead of the renderer's clear
 * color, which is how the Backdrop effect tells the shape's pixels from the
 * background's. It also hides scene.background while it renders, so it is
 * only for scenes whose environment isn't shown as the background.
 */
function transparentRenderPass(scene: THREE.Scene, camera: THREE.Camera) {
  const pass = new RenderPass(scene, camera)
  pass.clearPass.overrideClearColor = new THREE.Color(0, 0, 0)
  pass.clearPass.overrideClearAlpha = 0
  return pass
}

type LoadedMap = { key: string; release: () => void }

/**
 * drei caches every environment map it decodes for the life of the page, and
 * a 4k gain map holds about 90 MB of GPU memory once three has built its
 * reflection maps from it. So only the map in use is kept: once a new one is
 * up, the one before it is released. Waiting for that, rather than releasing
 * on unmount, also keeps React's double-mounted effects from freeing a map
 * that is still on screen.
 */
function useReleasePreviousMap() {
  const current = useRef<LoadedMap | null>(null)
  return useCallback((next: LoadedMap) => {
    const previous = current.current
    if (previous && previous.key !== next.key) previous.release()
    current.current = next
  }, [])
}

type EnvironmentMapProps = {
  onReady: (map: LoadedMap) => void
  background: boolean
  intensity: number
  rotation: [number, number, number]
}

/** A preset's map, whichever form its files take. */
function EnvironmentMap({
  files,
  ...props
}: EnvironmentMapProps & { files: string | string[] }) {
  return typeof files === "string" ? (
    <FileEnvironment file={files} {...props} />
  ) : (
    <GainMapEnvironment files={files} {...props} />
  )
}

/**
 * A gain map decodes into a render target, and three never frees the
 * reflection map it builds from a render target's texture, since it only
 * listens for disposal on ordinary textures. So this builds the reflection
 * map itself, where it can free both render targets on release.
 */
function GainMapEnvironment({
  files,
  onReady,
  ...props
}: EnvironmentMapProps & { files: string[] }) {
  const gl = useThree((state) => state.gl)
  // One load of the three files together, hence the extra array.
  const [decoded] = useLoader(GainMapLoader, [files] as never, (loader) =>
    loader.setRenderer(gl)
  ) as unknown as [GainMapResult]
  const reflections = useMemo(() => {
    // fromEquirectangular reads any non-cube texture as equirectangular,
    // so the decoded texture needs no mapping set.
    const generator = new THREE.PMREMGenerator(gl)
    const target = generator.fromEquirectangular(decoded.renderTarget.texture)
    generator.dispose()
    return target
  }, [decoded, gl])
  useLayoutEffect(() => {
    onReady({
      key: String(files),
      release: () => {
        reflections.dispose()
        decoded.dispose()
        useLoader.clear(GainMapLoader, [files] as never)
      },
    })
  }, [files, decoded, reflections, onReady])
  return <EnvironmentTexture texture={reflections.texture} {...props} />
}

/** What GainMapLoader resolves to: the decoded render target and its owner. */
type GainMapResult = {
  renderTarget: THREE.WebGLRenderTarget
  dispose: () => void
}

/** A plain .hdr becomes an ordinary texture, which three frees in full on dispose. */
function FileEnvironment({
  file,
  onReady,
  ...props
}: EnvironmentMapProps & { file: string }) {
  const texture = useEnvironment({ files: file })
  useLayoutEffect(() => {
    onReady({
      key: file,
      release: () => {
        texture.dispose()
        useEnvironment.clear({ files: file })
      },
    })
  }, [file, texture, onReady])
  return <EnvironmentTexture texture={texture} {...props} />
}

function EnvironmentTexture({
  texture,
  background,
  intensity,
  rotation,
}: Omit<EnvironmentMapProps, "onReady"> & { texture: THREE.Texture }) {
  return (
    <Environment
      map={texture}
      background={background}
      environmentIntensity={intensity}
      environmentRotation={rotation}
      backgroundRotation={rotation}
    />
  )
}

/** A missing or blocked environment map leaves the scene without it rather than taking the page down. */
class EnvironmentBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
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
function onSphere(
  azimuth: number,
  elevation: number,
  distance: number
): [number, number, number] {
  const theta = THREE.MathUtils.degToRad(azimuth)
  const phi = THREE.MathUtils.degToRad(elevation)
  return [
    distance * Math.cos(phi) * Math.sin(theta),
    distance * Math.sin(phi),
    distance * Math.cos(phi) * Math.cos(theta),
  ]
}
