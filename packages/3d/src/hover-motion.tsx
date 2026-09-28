import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef, type ReactNode } from "react"
import * as THREE from "three"

/** How far the shape leans toward a pointer at the canvas's edge. */
const MAX_TILT = THREE.MathUtils.degToRad(12)

/** The shape's size while the pointer is over it. */
const HOVER_SCALE = 1.06

/** How quickly the lean and size catch up, per second: settled in about half a second. */
const DAMPING = 8

/** Close enough to the target to stop, in radians or scale: far below a pixel. */
const SETTLED = 1e-4

type Pointer = {
  /** Where the mouse is over the canvas, -1 to 1 across and up; null once it leaves. */
  at: THREE.Vector2 | null
  /** A button is down, so the viewer is orbiting rather than pointing. */
  held: boolean
}

type Motion = {
  yaw: number
  pitch: number
  scale: number
  targetYaw: number
  targetPitch: number
  over: boolean
}

const raycaster = new THREE.Raycaster()
const tilt = new THREE.Euler()
const lean = new THREE.Quaternion()
const view = new THREE.Quaternion()
const parent = new THREE.Quaternion()

/**
 * Leans its children toward a mouse over the canvas, up to MAX_TILT at the
 * edges, and grows them a little while the mouse is over them; both ease
 * back once it leaves. Touch is left alone, so a finger only orbits. While a
 * button is down the lean holds, so dragging to orbit doesn't swing the
 * shape after the pointer.
 */
export function HoverMotion({
  enabled,
  children,
}: {
  enabled: boolean
  children: ReactNode
}) {
  const group = useRef<THREE.Group>(null)
  const pointer = usePointer()
  const motion = useRef<Motion>({
    yaw: 0,
    pitch: 0,
    scale: 1,
    targetYaw: 0,
    targetPitch: 0,
    over: false,
  })
  useFrame(({ camera }, delta) => {
    const node = group.current
    if (!node) return
    const { at, held } = pointer.current
    const state = motion.current
    if (!held) {
      const aim = enabled ? at : null
      state.targetYaw = aim ? aim.x * MAX_TILT : 0
      state.targetPitch = aim ? -aim.y * MAX_TILT : 0
      state.over = aim !== null && isOver(node, aim, camera)
    }
    state.yaw = ease(state.yaw, state.targetYaw, delta)
    state.pitch = ease(state.pitch, state.targetPitch, delta)
    state.scale = ease(state.scale, state.over ? HOVER_SCALE : 1, delta)
    node.scale.setScalar(state.scale)
    if (state.yaw === 0 && state.pitch === 0) {
      node.quaternion.identity()
      return
    }
    // The lean turns about the camera's own axes, so it points at the
    // pointer from any view: into camera space, lean, back out. The parent,
    // which a staging may have turned, is undone around that.
    lean.setFromEuler(tilt.set(state.pitch, state.yaw, 0))
    camera.getWorldQuaternion(view)
    if (node.parent) node.parent.getWorldQuaternion(parent)
    else parent.identity()
    node.quaternion
      .copy(parent)
      .invert()
      .multiply(view)
      .multiply(lean)
      .multiply(view.invert())
      .multiply(parent)
  })
  return <group ref={group}>{children}</group>
}

/**
 * Damped toward the target, and onto it once within SETTLED: damping alone
 * only ever gets closer, which would keep the shape, and the floor shadow
 * drawn from it, changing for a minute and more.
 */
function ease(value: number, target: number, delta: number) {
  const next = THREE.MathUtils.damp(value, target, DAMPING, delta)
  return Math.abs(next - target) < SETTLED ? target : next
}

/** Whether the pointer is over any mesh inside the object. */
function isOver(
  object: THREE.Object3D,
  at: THREE.Vector2,
  camera: THREE.Camera
) {
  raycaster.setFromCamera(at, camera)
  return raycaster.intersectObject(object, true).length > 0
}

/**
 * Follows the mouse over the canvas's wrapper, where R3F and the orbit
 * controls listen too. The controls follow a drag on the document once it
 * starts, so a button released outside the canvas is caught on the window.
 */
function usePointer() {
  const connected = useThree((state) => state.events.connected)
  const canvas = useThree((state) => state.gl.domElement)
  const pointer = useRef<Pointer>({ at: null, held: false })
  useEffect(() => {
    const element = connected instanceof HTMLElement ? connected : canvas
    const current = pointer.current
    const place = (event: PointerEvent) => {
      const box = element.getBoundingClientRect()
      return new THREE.Vector2(
        ((event.clientX - box.left) / box.width) * 2 - 1,
        -((event.clientY - box.top) / box.height) * 2 + 1
      )
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      current.at = place(event)
      current.held = event.buttons !== 0
    }
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      current.held = true
    }
    const onUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      current.held = false
    }
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      current.at = null
    }
    element.addEventListener("pointermove", onMove)
    element.addEventListener("pointerdown", onDown)
    element.addEventListener("pointerleave", onLeave)
    window.addEventListener("pointerup", onUp)
    return () => {
      element.removeEventListener("pointermove", onMove)
      element.removeEventListener("pointerdown", onDown)
      element.removeEventListener("pointerleave", onLeave)
      window.removeEventListener("pointerup", onUp)
    }
  }, [connected, canvas])
  return pointer
}
