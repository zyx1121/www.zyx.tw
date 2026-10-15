import * as THREE from "three"

/** Seconds a new drift, or a throw, takes to settle in. */
const SETTLE = 6

/** Radians a drag turns the shape per pixel. */
const DRAG_TURN = 0.01

/** A slow turn about a random axis: 0.055 to 0.11 radians per second, times speed. */
function randomVelocity(speed: number) {
  return new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    (Math.random() - 0.5) * 0.35
  )
    .normalize()
    .multiplyScalar((0.055 + Math.random() * 0.055) * speed)
}

/**
 * A slow tumble whose axis changes every 10 to 20 seconds, easing from one
 * turn into the next, like the logo on dev.zyx.tw. A drag turns the shape
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
        target.copy(randomVelocity(speed))
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
      target.copy(randomVelocity(speed))
    },
    release() {
      dragging = false
      // Keep the throw's axis for the drift that follows.
      if (velocity.lengthSq() > 1e-6)
        target.copy(velocity).setLength(target.length())
    },
  }
}
