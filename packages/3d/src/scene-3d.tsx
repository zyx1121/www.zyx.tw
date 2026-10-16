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
  useState,
  type ReactNode,
} from "react"
import * as THREE from "three"

import { Backdrop, BackdropEffect } from "./backdrop"
import { CameraView } from "./camera-view"
import {
  environmentControls,
  motionControls,
  stagingControls,
} from "./controls"
import { createDrift } from "./drift"
import { effects as effectPresets } from "./effects"
import { environments } from "./environments"
import { FloorShadow } from "./floor-shadow"
import { buildShapeGeometry } from "./geometry"
import { HoverMotion } from "./hover-motion"
import { materials } from "./materials"
import { resolveValues } from "./params"
import { findPreset, type EffectPreset, type StagingPreset } from "./registry"
import type { SceneV1 } from "./schema"
import { stagings } from "./stagings"

/** The editor at plump.zyx.tw serves the environment maps, with CORS open to other sites. */
export const DEFAULT_ENV_BASE_URL = "https://plump.zyx.tw/env/"

/** How far below its place a rising shape starts, in scene units, and how long it takes to arrive. */
const RISE_DEPTH = 2.6
const RISE_SECONDS = 2.4

/** Radians per second when autoRotate turns the shape. */
const SPIN_SPEED = 0.4

/** Where the camera looks from, in degrees: around the shape and above it. */
export type SceneView = { azimuth: number; elevation: number }

/** Oblique's view, the first staging's: from the left and above, so the depth and bevel show at a glance. */
export const DEFAULT_VIEW: SceneView = stagings[0].view

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
  /**
   * The camera angle, in place of the one the scene's staging sets. Either
   * way, the camera swings over when it changes.
   */
  view?: SceneView
  /**
   * On a touch screen, the device's turns stand in for the mouse of the
   * scene's hover motion: the shape holds still in the room while the device
   * turns around it. iOS asks the visitor first, on their first tap on the
   * canvas.
   */
  deviceTilt?: boolean
  /**
   * Leave the background out of the frame, so the page behind the canvas
   * shows through. Glass still refracts the staging background color. Has no
   * effect when the environment is shown as the background.
   */
  transparent?: boolean
  /**
   * Tumble the shape slowly about an axis that changes every 10 to 20
   * seconds, like the logo on dev.zyx.tw, at this multiple of its speed.
   * 0 leaves the shape still.
   */
  drift?: number
  /** Turn the shape by dragging it, and throw it into the drift. */
  grab?: boolean
  /** Bring the shape up from below when it first appears, instead of popping in. */
  rise?: boolean
  /**
   * An image for glass to refract, cropped like CSS `center / cover`. With
   * `transparent`, show the same image behind the canvas so the two match.
   */
  backgroundImage?: string
  /** Move the shape up by this fraction of the canvas height. */
  lift?: number
  /**
   * With `transparent` and `backgroundImage`, draw the image into the frame
   * and bend it around the shape like light past a black hole, this strong.
   */
  lens?: number
  /**
   * Light the shape with the environment map and the staging's light. A
   * material that ignores light, like a flat black, can skip both and the
   * map's download.
   */
  lighting?: boolean
  /** Device pixel ratio range; a lower top end draws fewer pixels on retina screens. */
  dpr?: [number, number]
}

/** Renders a scene.json. Use it from a client component; it fills its parent. */
export function Scene3D({
  scene,
  envBaseUrl = DEFAULT_ENV_BASE_URL,
  className,
  controls = true,
  autoRotate = false,
  view: viewOverride,
  deviceTilt = false,
  transparent = false,
  drift = 0,
  grab = false,
  rise = false,
  backgroundImage,
  lift = 0,
  lens = 0,
  lighting = true,
  dpr = [1, 2],
}: Scene3DProps) {
  const view = viewOverride ?? stagingOf(scene).view
  return (
    <Canvas
      className={className}
      // Read once, when the canvas mounts; CameraView takes over from there.
      camera={{
        position: onSphere(view.azimuth, view.elevation, CAMERA_DISTANCE),
        fov: 35,
      }}
      dpr={dpr}
      // Every frame goes through the composer, which antialiases on its own.
      gl={{ antialias: false }}
    >
      <FitCamera />
      <Lift amount={lift} />
      <CameraView azimuth={view.azimuth} elevation={view.elevation} />
      {/* Glass that shows before its background image has loaded refracts
          the clear color, a dark flash; so the shape waits for the image. */}
      <Suspense fallback={null}>
        {backgroundImage && <BackgroundImage url={backgroundImage} />}
        <SceneContents
          scene={scene}
          envBaseUrl={envBaseUrl}
          autoRotate={autoRotate}
          deviceTilt={deviceTilt}
          transparent={transparent}
          drift={drift}
          grab={grab}
          rise={rise}
          backgroundImage={transparent ? backgroundImage : undefined}
          lens={lens}
          lighting={lighting}
        />
      </Suspense>
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
 * Shifts the camera's view window down, so the whole picture, shape and
 * background image alike, moves up without moving the canvas.
 */
function Lift({ amount }: { amount: number }) {
  const camera = useThree((state) => state.camera)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  useLayoutEffect(() => {
    if (!amount || !(camera instanceof THREE.PerspectiveCamera)) return
    camera.setViewOffset(width, height, 0, height * amount, width, height)
    return () => camera.clearViewOffset()
  }, [camera, width, height, amount])
  return null
}

/**
 * The background image laid under the frame, bent around the target like
 * light past a black hole when lens is above 0. The lens follows the
 * target's center on screen and scales with its bounding sphere.
 */
function ImageBackdrop({
  url,
  lens,
  target,
}: {
  url: string
  lens: number
  target: React.RefObject<THREE.Group | null>
}) {
  const texture = useLoader(THREE.TextureLoader, url)
  const effect = useRef<BackdropEffect>(null)
  const [scratch] = useState(() => ({
    center: new THREE.Vector3(),
    edge: new THREE.Vector3(),
    up: new THREE.Vector3(),
    uv: new THREE.Vector2(),
    sphere: new THREE.Sphere(),
  }))
  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
  }, [texture])
  useFrame(({ camera, size }) => {
    const backdrop = effect.current
    if (!backdrop) return
    backdrop.setAspect(size.width / size.height)
    const group = target.current
    if (!group || lens <= 0) {
      backdrop.setLens(scratch.uv.set(0.5, 0.5), 0.1, 0)
      return
    }
    const mesh = group.children.find(
      (child): child is THREE.Mesh => child instanceof THREE.Mesh
    )
    if (!mesh) return
    const { center, edge, up, uv, sphere } = scratch
    // The geometry's own sphere, so the lens holds its size as the shape turns.
    if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere()
    sphere.copy(mesh.geometry.boundingSphere!).applyMatrix4(mesh.matrixWorld)
    center.copy(sphere.center).project(camera)
    up.set(0, 1, 0).applyQuaternion(camera.quaternion)
    edge.copy(sphere.center).addScaledVector(up, sphere.radius).project(camera)
    uv.set(center.x * 0.5 + 0.5, center.y * 0.5 + 0.5)
    backdrop.setLens(uv, Math.abs(edge.y - center.y) * 0.5, lens)
  })
  return <Backdrop ref={effect} map={texture} />
}

const backgroundVertex = /* glsl */ `
uniform vec2 scale;
varying vec2 vUv;
void main() {
  vUv = (uv - 0.5) * scale + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`

const backgroundFragment = /* glsl */ `
uniform sampler2D map;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(map, vUv);
  #include <colorspace_fragment>
}
`

/**
 * three draws transmission into a mipmapped target, which nothing else in
 * this renderer uses; the composer's buffers are not mipmapped.
 */
function isTransmissionTarget(target: THREE.RenderTarget | null) {
  return target?.texture.minFilter === THREE.LinearMipmapLinearFilter
}

/**
 * An image behind the shape that only glass sees: a quad over the whole
 * canvas, cropped like CSS `center / cover`, drawn into three's
 * transmission target and left out of the frame. The composer's render pass
 * clears scene.background for the whole render, transmission included, so
 * this can't be scene.background. The quad sits in screen space, so it
 * lines up with the page behind the canvas whatever the camera does.
 */
function BackgroundImage({ url }: { url: string }) {
  const texture = useLoader(THREE.TextureLoader, url)
  const aspect = useThree((state) => state.size.width / state.size.height)
  const scale = useMemo(() => new THREE.Vector2(1, 1), [])
  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        scale: { value: scale },
      },
      vertexShader: backgroundVertex,
      fragmentShader: backgroundFragment,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    })
  }, [texture, scale])
  useEffect(() => () => material.dispose(), [material])
  useLayoutEffect(() => {
    const image = texture.image as HTMLImageElement
    const ratio = aspect / (image.width / image.height)
    scale.set(ratio > 1 ? 1 : ratio, ratio > 1 ? 1 / ratio : 1)
  }, [scale, texture, aspect])
  return (
    <mesh
      frustumCulled={false}
      renderOrder={-1}
      material={material}
      onBeforeRender={(renderer) => {
        material.colorWrite = isTransmissionTarget(renderer.getRenderTarget())
      }}
    >
      <planeGeometry args={[2, 2]} />
    </mesh>
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
  deviceTilt,
  transparent,
  drift,
  grab,
  rise,
  backgroundImage,
  lens,
  lighting,
}: {
  scene: SceneV1
  envBaseUrl: string
  autoRotate: boolean
  deviceTilt: boolean
  transparent: boolean
  drift: number
  grab: boolean
  rise: boolean
  backgroundImage: string | undefined
  lens: number
  lighting: boolean
}) {
  const geometry = useShapeGeometry(scene.shape)
  const spin = useRef<THREE.Group>(null)
  const [tumble] = useState(() => createDrift(drift))
  const lifted = useRef<THREE.Group>(null)
  const risen = useRef(rise ? 0 : 1)
  const canvas = useThree((state) => state.gl.domElement)
  useEffect(() => tumble.setSpeed(drift), [tumble, drift])
  useFrame((_, delta) => {
    if (autoRotate && spin.current)
      spin.current.rotation.y += delta * SPIN_SPEED
    if ((drift || grab) && spin.current) tumble.step(spin.current, delta)
    if (lifted.current && risen.current < 1) {
      // A long frame, like a shader compiling, doesn't jump the rise ahead.
      risen.current = Math.min(
        1,
        risen.current + Math.min(delta, 1 / 30) / RISE_SECONDS
      )
      // Ease out: fast from below, settling gently at its place.
      const left = 1 - risen.current
      lifted.current.position.y = -RISE_DEPTH * left * left * left
    }
  })
  useEffect(() => {
    if (!grab) return
    let pointer: number | null = null
    let x = 0
    let y = 0
    const down = (event: PointerEvent) => {
      if (pointer !== null) return
      pointer = event.pointerId
      x = event.clientX
      y = event.clientY
      // Keeps the drag when the pointer leaves the canvas; a pointer the
      // browser no longer tracks can't be captured, and still drags.
      try {
        canvas.setPointerCapture(pointer)
      } catch {}
      canvas.style.cursor = "grabbing"
      tumble.grab()
    }
    const move = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return
      tumble.drag(event.clientX - x, event.clientY - y)
      x = event.clientX
      y = event.clientY
    }
    const up = (event: PointerEvent) => {
      if (event.pointerId !== pointer) return
      pointer = null
      canvas.style.cursor = "grab"
      tumble.release()
    }
    canvas.style.cursor = "grab"
    canvas.style.touchAction = "none"
    canvas.addEventListener("pointerdown", down)
    canvas.addEventListener("pointermove", move)
    canvas.addEventListener("pointerup", up)
    canvas.addEventListener("pointercancel", up)
    return () => {
      canvas.removeEventListener("pointerdown", down)
      canvas.removeEventListener("pointermove", move)
      canvas.removeEventListener("pointerup", up)
      canvas.removeEventListener("pointercancel", up)
      canvas.style.cursor = ""
      canvas.style.touchAction = ""
    }
  }, [grab, canvas, tumble])

  const material = findPreset(materials, scene.material.id) ?? materials[0]
  const environment =
    findPreset(environments, scene.environment.id) ?? environments[0]
  const env = resolveValues(environmentControls, scene.environment)
  const staging = resolveValues(stagingControls, scene.staging)
  const stage = stagingOf(scene)
  const motion = resolveValues(motionControls, scene.motion)
  const placed = useRef<THREE.Group>(null)
  const placement = usePlacement(stage.object)
  const floorCenter = useFloorCenter(geometry, placement, stage.floor)
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
      {lighting && (
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
            position={onSphere(stage.light.azimuth, stage.light.elevation, 10)}
            intensity={stage.light.intensity}
          />
        </>
      )}
      {/* Starts below its place when rising; useFrame brings it up. */}
      <group ref={lifted} position-y={rise ? -RISE_DEPTH : 0}>
        <group
          ref={placed}
          position={placement.position}
          quaternion={placement.quaternion}
        >
          <HoverMotion enabled={motion.hover} deviceTilt={deviceTilt}>
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
          </HoverMotion>
        </group>
      </group>
      {stage.floor && floorCenter && (
        <FloorShadow
          target={placed}
          center={floorCenter}
          opacity={stage.floor.opacity}
          blur={stage.floor.blur}
        />
      )}
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
        {backgroundImage ? (
          <ImageBackdrop url={backgroundImage} lens={lens} target={spin} />
        ) : backdrop && !transparent ? (
          <Backdrop color={staging.background} />
        ) : null}
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
  // A decoded map belongs to one WebGL context. Like drei's own gain map
  // loading, drop it from the cache when the context is lost, so a remounted
  // canvas decodes it again rather than reusing a dead texture. The listener
  // is never removed: R3F loses the context only after the canvas unmounts.
  useLayoutEffect(() => {
    gl.domElement.addEventListener(
      "webglcontextlost",
      () => useLoader.clear(GainMapLoader, [files] as never),
      { once: true }
    )
  }, [gl, files])
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

/** The scene's staging preset; an unknown id gets the first. */
function stagingOf(scene: SceneV1) {
  return findPreset(stagings, scene.staging.id) ?? stagings[0]
}

type Placement = { position: THREE.Vector3; quaternion: THREE.Quaternion }

/** Where the staging puts the shape. */
function usePlacement(object: StagingPreset["object"]): Placement {
  const [x = 0, y = 0, z = 0] = object?.position ?? []
  const [turnX = 0, turnY = 0, turnZ = 0] = object?.rotation ?? []
  return useMemo(() => {
    const turn = new THREE.Euler(
      THREE.MathUtils.degToRad(turnX),
      THREE.MathUtils.degToRad(turnY),
      THREE.MathUtils.degToRad(turnZ)
    )
    return {
      position: new THREE.Vector3(x, y, z),
      quaternion: new THREE.Quaternion().setFromEuler(turn),
    }
  }, [x, y, z, turnX, turnY, turnZ])
}

/** The middle of the staging's floor: under the shape as placed, its gap below the lowest point. */
function useFloorCenter(
  geometry: THREE.BufferGeometry | null,
  { position, quaternion }: Placement,
  floor: StagingPreset["floor"]
) {
  const gap = floor?.gap
  return useMemo(() => {
    // buildShapeGeometry centres the shape, which leaves its bounds computed.
    const bounds = geometry?.boundingBox
    if (!bounds || gap === undefined) return null
    const placed = new THREE.Matrix4().compose(
      position,
      quaternion,
      new THREE.Vector3(1, 1, 1)
    )
    const lowest = bounds.clone().applyMatrix4(placed).min.y
    return new THREE.Vector3(position.x, lowest - gap, position.z)
  }, [geometry, position, quaternion, gap])
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
