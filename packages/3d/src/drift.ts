import * as THREE from "three"

/** Seconds a new drift, or a throw, takes to settle in. */
const SETTLE = 6

/** Radians a drag turns the shape per pixel. */
const DRAG_TURN = 0.01

/** Radians per second at speed 1: a turn about every 80 seconds. */
const TURN_RATE = 0.08

/** The widest swing, in radians, of the axis from one drift to the next. */
const MAX_SWING = 0.9

/** A slow turn about a random axis, mostly upright, at a steady rate. */
function randomVelocity(speed: number) {
  return new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    (Math.random() - 0.5) * 0.35
  )
    .normalize()
    .multiplyScalar(TURN_RATE * speed)
}

/**
 * The next drift: the current axis swung by up to MAX_SWING about a random
 * axis across it, at the same rate. A fresh random axis can point nearly
 * backwards, and easing into it slows the shape to a stop and turns it back.
 */
function nextVelocity(current: THREE.Vector3, speed: number) {
  if (current.lengthSq() < 1e-12) return randomVelocity(speed)
  const axis = current.clone().normalize()
  const across = new THREE.Vector3()
    .randomDirection()
    .projectOnPlane(axis)
    .normalize()
  const swing = (0.3 + Math.random() * 0.7) * MAX_SWING
  return axis.applyAxisAngle(across, swing).multiplyScalar(TURN_RATE * speed)
}

/**
 * A slow tumble whose axis swings a little every 10 to 20 seconds, easing
 * from one turn into the next, so it never stops or turns back. A drag turns the shape
 * by hand; let go mid-drag and it keeps the throw, then eases back into the
 * drift.
 */
export function createDrift(initialSpeed = 1) {
  let speed = initialSpeed
  const velocity = randomVelocity(speed)
  const target = velocity.clone()
  const excess = new THREE.Vector3()
  const turn = new THREE.Vector3()
  const step = new THREE.Quaternion()
  const dragTurn = new THREE.Vector3()
  const driftTurn = new THREE.Vector3()
  let elapsed = 0
  let next = 10 + Math.random() * 10
  let dragging = false

  const rotate = (object: THREE.Object3D, rotation: THREE.Vector3) => {
    const angle = rotation.length()
    if (angle < 1e-9) return
    step.setFromAxisAngle(turn.copy(rotation).divideScalar(angle), angle)
    object.quaternion.premultiply(step).normalize()
  }

  return {
    /** Advance by a frame's seconds. */
    step(object: THREE.Object3D, delta: number) {
      elapsed += delta
      if (dragging) {
        // The hand's turn this frame, as a velocity for when it lets go.
        rotate(object, dragTurn)
        if (delta > 0) velocity.copy(dragTurn).divideScalar(delta)
        dragTurn.set(0, 0, 0)
        return
      }
      if (elapsed >= next) {
        target.copy(nextVelocity(target, speed))
        next = elapsed + 10 + Math.random() * 10
      }
      // Integrated exactly, so the turn is the same at any frame rate.
      const decay = Math.exp(-delta / SETTLE)
      excess.copy(velocity).sub(target)
      driftTurn
        .copy(target)
        .multiplyScalar(delta)
        .addScaledVector(excess, SETTLE * (1 - decay))
      velocity.copy(target).addScaledVector(excess, decay)
      rotate(object, driftTurn)
    },
    grab() {
      dragging = true
      dragTurn.set(0, 0, 0)
    },
    /** A pointer move in screen pixels turns the shape about the screen's axes. */
    drag(dx: number, dy: number) {
      dragTurn.x += dy * DRAG_TURN
      dragTurn.y += dx * DRAG_TURN
    },
    /** A new speed, eased into like any change of drift. */
    setSpeed(next: number) {
      if (next === speed) return
      speed = next
      target.copy(nextVelocity(target, speed))
    },
    release() {
      dragging = false
      // Keep the throw's axis for the drift that follows, at the drift's rate.
      if (velocity.lengthSq() > 1e-6)
        target.copy(velocity).setLength(TURN_RATE * speed)
    },
  }
}
