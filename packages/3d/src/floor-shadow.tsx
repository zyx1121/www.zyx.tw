import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef, type RefObject } from "react"
import * as THREE from "three"

import { SHAPE_SIZE } from "./geometry"

/** The floor's side, in scene units: room for the shape turning and the blur around it. */
const FLOOR_SIZE = SHAPE_SIZE * 2.5

/** Texels along each side of the shadow map. It is blurred, so few are enough. */
const RESOLUTION = 256

/** How far above the floor the shape still darkens it, in scene units. */
const REACH = SHAPE_SIZE / 2

/** Taps on each side of a blur pass's centre. */
const BLUR_TAPS = 12

const depthShader = {
  uniforms: { floorY: { value: 0 }, reach: { value: REACH } },
  vertexShader: /* glsl */ `
    uniform float floorY;
    varying float height;

    void main() {
      vec4 world = modelMatrix * vec4(position, 1.0);
      height = world.y - floorY;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float reach;
    varying float height;

    void main() {
      gl_FragColor = vec4(0.0, 0.0, 0.0, clamp(1.0 - height / reach, 0.0, 1.0));
    }
  `,
}

// A Gaussian along one direction; a pass across and then one along make the
// round blur.
const blurShader = {
  uniforms: {
    map: { value: null as THREE.Texture | null },
    step: { value: new THREE.Vector2() },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D map;
    uniform vec2 step;
    varying vec2 vUv;

    void main() {
      // Three standard deviations span the taps.
      float spread = float(TAPS) / 3.0;
      vec4 sum = texture2D(map, vUv);
      float total = 1.0;
      for (int i = 1; i <= TAPS; i++) {
        float weight = exp(-0.5 * float(i * i) / (spread * spread));
        vec2 offset = step * float(i);
        sum += (texture2D(map, vUv + offset) + texture2D(map, vUv - offset)) * weight;
        total += 2.0 * weight;
      }
      gl_FragColor = sum / total;
    }
  `,
}

type FloorShadowProps = {
  /** What casts the shadow: every mesh inside it. */
  target: RefObject<THREE.Object3D | null>
  /** The middle of the floor, under the shape. */
  center: THREE.Vector3
  /** How dark the shadow is where the shape comes closest, from 0 to 1. */
  opacity: number
  /** How far the shadow spreads past the shape's outline, in scene units. */
  blur: number
}

/**
 * A soft shadow on an invisible floor, darker where the shape comes closer.
 * The shape is drawn looking up from the floor, as its height above it,
 * blurred, and laid on the floor as black at that alpha. Over the Backdrop
 * that darkens the background color by the alpha, and over an environment
 * background it darkens the environment: either way only the shadow shows.
 * It is redrawn only when a mesh moves or changes.
 */
export function FloorShadow({
  target,
  center,
  opacity,
  blur,
}: FloorShadowProps) {
  const gl = useThree((state) => state.gl)
  const resources = useMemo(() => createResources(), [])
  useEffect(() => () => disposeResources(resources), [resources])
  const drawn = useRef<Drawn>({
    center: new THREE.Vector3(NaN, NaN, NaN),
    blur: NaN,
    meshes: [],
  })

  useFrame(() => {
    const root = target.current
    if (!root) return
    root.updateMatrixWorld()
    const meshes: THREE.Mesh[] = []
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object)
    })
    if (!remember(drawn.current, meshes, center, blur)) return
    drawShadow(gl, resources, root, meshes, center, blur)
  })

  return (
    // The shadow map looks up from below, so the plane is flipped along the
    // floor's depth to line it up with the shape.
    <mesh position={center} rotation-x={-Math.PI / 2} scale={[1, -1, 1]}>
      <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
      <meshBasicMaterial
        color="#000000"
        map={resources.shadow.texture}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  )
}

type Resources = ReturnType<typeof createResources>

function createResources() {
  // The shape's height above the floor is drawn here, then blurred back
  // into it by way of `across`.
  const shadow = new THREE.WebGLRenderTarget(RESOLUTION, RESOLUTION, {
    type: THREE.HalfFloatType,
  })
  const across = new THREE.WebGLRenderTarget(RESOLUTION, RESOLUTION, {
    type: THREE.HalfFloatType,
    depthBuffer: false,
  })
  // The floor, looking up: its right is the scene's +x and its up the
  // scene's +z. It also sees below the floor, so a shape dipping into it
  // still darkens it.
  const camera = new THREE.OrthographicCamera(
    -FLOOR_SIZE / 2,
    FLOOR_SIZE / 2,
    FLOOR_SIZE / 2,
    -FLOOR_SIZE / 2,
    -REACH,
    REACH
  )
  camera.up.set(0, 0, 1)
  const heights = new THREE.ShaderMaterial({
    ...depthShader,
    uniforms: THREE.UniformsUtils.clone(depthShader.uniforms),
    side: THREE.DoubleSide,
    blending: THREE.NoBlending,
  })
  const blur = new THREE.ShaderMaterial({
    ...blurShader,
    uniforms: THREE.UniformsUtils.clone(blurShader.uniforms),
    defines: { TAPS: BLUR_TAPS },
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
  })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blur)
  quad.frustumCulled = false
  return { shadow, across, camera, heights, blur, quad }
}

function disposeResources(resources: Resources) {
  resources.shadow.dispose()
  resources.across.dispose()
  resources.heights.dispose()
  resources.blur.dispose()
  resources.quad.geometry.dispose()
}

/** What the shadow map was last drawn from. */
type Drawn = {
  center: THREE.Vector3
  blur: number
  meshes: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }[]
}

/** Records what the shadow is about to be drawn from; false when nothing changed since the last time. */
function remember(
  drawn: Drawn,
  meshes: THREE.Mesh[],
  center: THREE.Vector3,
  blur: number
) {
  const same =
    drawn.center.equals(center) &&
    drawn.blur === blur &&
    drawn.meshes.length === meshes.length &&
    meshes.every(
      (mesh, i) =>
        drawn.meshes[i]?.geometry === mesh.geometry &&
        drawn.meshes[i].matrix.equals(mesh.matrixWorld)
    )
  if (same) return false
  drawn.center.copy(center)
  drawn.blur = blur
  drawn.meshes = meshes.map((mesh, i) => ({
    geometry: mesh.geometry,
    matrix: (drawn.meshes[i]?.matrix ?? new THREE.Matrix4()).copy(
      mesh.matrixWorld
    ),
  }))
  return true
}

const savedClearColor = new THREE.Color()

function drawShadow(
  gl: THREE.WebGLRenderer,
  { shadow, across, camera, heights, blur: blurring, quad }: Resources,
  root: THREE.Object3D,
  meshes: THREE.Mesh[],
  center: THREE.Vector3,
  blur: number
) {
  const previousTarget = gl.getRenderTarget()
  gl.getClearColor(savedClearColor)
  const savedClearAlpha = gl.getClearAlpha()

  camera.position.copy(center)
  camera.lookAt(center.x, center.y + 1, center.z)
  camera.updateMatrixWorld()
  heights.uniforms.floorY!.value = center.y

  // Heights, over nothing: the renderer clears to the background color,
  // which would read as shadow everywhere.
  const materials = meshes.map((mesh) => mesh.material)
  for (const mesh of meshes) mesh.material = heights
  gl.setRenderTarget(shadow)
  gl.setClearColor(0x000000, 0)
  gl.clear(true, true, false)
  gl.render(root, camera)
  meshes.forEach((mesh, i) => (mesh.material = materials[i]!))

  // One tap apart, in texture coordinates, so the last tap, three standard
  // deviations out, lands `blur` away.
  const stride = blur / FLOOR_SIZE / BLUR_TAPS
  blurring.uniforms.map!.value = shadow.texture
  blurring.uniforms.step!.value.set(stride, 0)
  gl.setRenderTarget(across)
  gl.render(quad, camera)
  blurring.uniforms.map!.value = across.texture
  blurring.uniforms.step!.value.set(0, stride)
  gl.setRenderTarget(shadow)
  gl.render(quad, camera)

  gl.setRenderTarget(previousTarget)
  gl.setClearColor(savedClearColor, savedClearAlpha)
}
