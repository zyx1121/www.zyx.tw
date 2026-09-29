import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef, type ReactNode } from "react"
import * as THREE from "three"

/**
 * How far the shape leans: toward a pointer at the canvas's edge, and at most
 * against a turn of the device.
 */
const MAX_TILT = THREE.MathUtils.degToRad(18)

/** The shape's size while the pointer is over it. */
const HOVER_SCALE = 1.06

/** How quickly the lean and size catch up, per second: settled in about half a second. */
const DAMPING = 8

/**
 * How quickly the device's rest follows its turns, per second: a turn held
 * for a few seconds becomes the new rest, and the shape faces front again.
 */
const REST_DRIFT = 0.5

/** Close enough to the target to stop, in radians or scale: far below a pixel. */
const SETTLED = 1e-4

type Pointer = {
  /** Where the mouse is over the canvas, -1 to 1 across and up; null once it leaves. */
  at: THREE.Vector2 | null
  /** A button is down, so the viewer is orbiting rather than pointing. */
  held: boolean
}

/** Which way the device's screen faces in the room, as its sensors last said. */
type Turn = {
  /** The latest reading; null before the first one and after the page was hidden. */
  now: THREE.Quaternion | null
  /** Where the shape faces front; it eases toward `now`. */
  rest: THREE.Quaternion | null
  /** The screen's rotation in the device when `rest` was set, in degrees: 0 upright, 90 or 270 on its side. */
  angle: number
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
const undone = new THREE.Quaternion()
const reading = new THREE.Euler()
const inDevice = new THREE.Quaternion()
const SCREEN_NORMAL = new THREE.Vector3(0, 0, 1)

/**
 * Leans its children toward a mouse over the canvas, up to MAX_TILT at the
 * edges, and grows them a little while the mouse is over them; both ease
 * back once it leaves. Touch is left alone, so a finger only orbits. While a
 * button is down the lean holds, so dragging to orbit doesn't swing the
 * shape after the pointer. With `deviceTilt`, a touch screen's turns stand in
 * for the mouse: the shape holds still in the room while the device turns
 * around it, and faces front again once the device rests.
 */
export function HoverMotion({
  enabled,
  deviceTilt = false,
  children,
}: {
  enabled: boolean
  deviceTilt?: boolean
  children: ReactNode
}) {
  const group = useRef<THREE.Group>(null)
  const pointer = usePointer()
  const turn = useDeviceTurn(enabled && deviceTilt)
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
      if (aim) {
        state.targetYaw = aim.x * MAX_TILT
        state.targetPitch = -aim.y * MAX_TILT
      } else if (!leanAgainst(turn.current, delta, state)) {
        state.targetYaw = 0
        state.targetPitch = 0
      }
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

/**
 * Aims the lean against the device's turn since its rest, so the shape holds
 * still in the room while the screen turns around it: the turn about the
 * screen's across and up axes, undone, giving way softly toward MAX_TILT. A
 * turn within the screen's own plane is left out. The rest eases toward the
 * device, so a turn that is held fades back to front. False without a reading.
 */
function leanAgainst(turn: Turn, delta: number, motion: Motion) {
  const { now, rest } = turn
  if (!now || !rest) return false
  rest.slerp(now, 1 - Math.exp(-REST_DRIFT * delta))
  // The rest as the screen sees it now: the turn since then, undone.
  undone.copy(now).invert().multiply(rest)
  if (undone.w < 0) undone.set(-undone.x, -undone.y, -undone.z, -undone.w)
  // Its rotation vector, the axis scaled by the angle, splits it by axis.
  const sin = Math.hypot(undone.x, undone.y, undone.z)
  const toAngle = sin > 1e-6 ? (2 * Math.atan2(sin, undone.w)) / sin : 2
  motion.targetPitch = soften(undone.x * toAngle)
  motion.targetYaw = soften(undone.y * toAngle)
  return true
}

/** The angle itself while small, easing into MAX_TILT as it grows. */
function soften(angle: number) {
  return MAX_TILT * Math.tanh(angle / MAX_TILT)
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

/**
 * Follows the orientation of a touch screen's device. iOS lets a page read it
 * only once the visitor allows it, and asks only on a tap: an answer given
 * earlier in the session comes back at once, and otherwise the first tap on
 * the canvas asks. Other browsers send readings without asking.
 */
function useDeviceTurn(enabled: boolean) {
  const connected = useThree((state) => state.events.connected)
  const canvas = useThree((state) => state.gl.domElement)
  const turn = useRef<Turn>({ now: null, rest: null, angle: 0 })
  useEffect(() => {
    if (!enabled || typeof DeviceOrientationEvent === "undefined") return
    if (!window.matchMedia("(pointer: coarse)").matches) return
    const element = connected instanceof HTMLElement ? connected : canvas
    const current = turn.current
    const onReading = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return
      const angle = screen.orientation?.angle ?? 0
      const radians = THREE.MathUtils.degToRad
      const now = current.now ?? new THREE.Quaternion()
      // The device in the room (alpha, beta and gamma turn it about Z, X'
      // and Y'', in that order), then the screen in the device.
      now
        .setFromEuler(
          reading.set(
            radians(event.beta),
            radians(event.gamma),
            radians(event.alpha ?? 0),
            "ZXY"
          )
        )
        .multiply(inDevice.setFromAxisAngle(SCREEN_NORMAL, -radians(angle)))
      current.now = now
      // A screen turned on its side starts over from where it is.
      if (!current.rest || angle !== current.angle) {
        current.rest = now.clone()
        current.angle = angle
      }
    }
    // Back from a hidden tab, the device may be anywhere: start over.
    const onVisibility = () => {
      current.now = null
      current.rest = null
    }
    const listen = () => {
      window.addEventListener("deviceorientation", onReading)
      document.addEventListener("visibilitychange", onVisibility)
    }
    const Orientation =
      DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<PermissionState>
      }
    const request = Orientation.requestPermission?.bind(Orientation)
    let live = true
    const ask = () =>
      (request ? request() : Promise.resolve<PermissionState>("granted")).then(
        (state) => {
          if (live && state === "granted") listen()
        }
      )
    const onTap = () => {
      ask().catch(() => {})
    }
    // Without a tap, iOS refuses a question not yet answered.
    ask().catch(() => {
      if (live) element.addEventListener("click", onTap, { once: true })
    })
    return () => {
      live = false
      window.removeEventListener("deviceorientation", onReading)
      document.removeEventListener("visibilitychange", onVisibility)
      element.removeEventListener("click", onTap)
      current.now = null
      current.rest = null
    }
  }, [enabled, connected, canvas])
  return turn
}
