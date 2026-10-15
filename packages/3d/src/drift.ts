import * as THREE from "three"

/** Seconds a new drift takes to settle in. */
const SETTLE = 6

/** A slow turn about a random axis: 0.055 to 0.11 radians per second. */
function randomVelocity() {
  return new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    (Math.random() - 0.5) * 0.35
  )
    .normalize()
    .multiplyScalar(0.055 + Math.random() * 0.055)
}

/**
 * A slow tumble whose axis changes every 10 to 20 seconds, easing from one
 * turn into the next, like the logo on dev.zyx.tw. Call the returned step
 * every frame with the object to turn and the frame's seconds.
 */
export function createDrift() {
  const velocity = randomVelocity()
  const target = velocity.clone()
  const excess = new THREE.Vector3()
  const turn = new THREE.Vector3()
  const step = new THREE.Quaternion()
  let elapsed = 0
  let next = 10 + Math.random() * 10

  return (object: THREE.Object3D, delta: number) => {
    elapsed += delta
    if (elapsed >= next) {
      target.copy(randomVelocity())
      next = elapsed + 10 + Math.random() * 10
    }
    // Integrated exactly, so the turn is the same at any frame rate.
    const decay = Math.exp(-delta / SETTLE)
    excess.copy(velocity).sub(target)
    turn
      .copy(target)
      .multiplyScalar(delta)
      .addScaledVector(excess, SETTLE * (1 - decay))
    velocity.copy(target).addScaledVector(excess, decay)
    const angle = turn.length()
    if (angle < 1e-9) return
    step.setFromAxisAngle(turn.divideScalar(angle), angle)
    object.quaternion.premultiply(step).normalize()
  }
}
