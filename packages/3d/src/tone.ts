import * as THREE from "three"

// three.js's ACESFilmicToneMapping (ShaderChunk tonemapping_pars_fragment),
// which postprocessing's ToneMappingEffect also calls. GLSL's mat3() takes
// columns; Matrix3.set() takes rows, so these read transposed from the shader.
const ACES_INPUT = new THREE.Matrix3().set(
  0.59719,
  0.35458,
  0.04823,
  0.076,
  0.90834,
  0.01566,
  0.0284,
  0.13383,
  0.83777
)
const ACES_OUTPUT = new THREE.Matrix3().set(
  1.60475,
  -0.53108,
  -0.07367,
  -0.10208,
  1.10813,
  -0.00605,
  -0.00327,
  -0.07276,
  1.07602
)
const ACES_INPUT_INVERSE = ACES_INPUT.clone().invert()
const ACES_OUTPUT_INVERSE = ACES_OUTPUT.clone().invert()

/** The shader's pre-scale at toneMappingExposure 1, "for a brighter viewing environment". */
const EXPOSURE_SCALE = 1 / 0.6

/** RRTAndODTFit approaches 1 / 0.983729 and never reaches it. */
const FIT_LIMIT = 1 / 0.983729 - 1e-6

/**
 * The linear color that ACES filmic tone mapping turns into `color`.
 *
 * three.js leaves a plain background color alone, but once a postprocessing
 * composer sits in between, its ToneMapping effect maps everything in the
 * frame, background included: #ffffff comes out light gray. Feeding the
 * composer this pre-image instead brings the chosen color back exactly.
 */
export function untoneMap(color: THREE.Color): THREE.Color {
  const target = new THREE.Vector3(color.r, color.g, color.b)
  const fitted = target.applyMatrix3(ACES_OUTPUT_INVERSE)
  const unfitted = new THREE.Vector3(
    invertFit(fitted.x),
    invertFit(fitted.y),
    invertFit(fitted.z)
  )
  const linear = unfitted
    .applyMatrix3(ACES_INPUT_INVERSE)
    .divideScalar(EXPOSURE_SCALE)
    .max(new THREE.Vector3(0, 0, 0))
  return new THREE.Color(linear.x, linear.y, linear.z)
}

/** Solves RRTAndODTFit(v) = u for v, its positive root. */
function invertFit(u: number): number {
  const clamped = Math.min(Math.max(u, 0), FIT_LIMIT)
  const a = 1 - 0.983729 * clamped
  const b = 0.0245786 - 0.432951 * clamped
  const c = -(0.000090537 + 0.238081 * clamped)
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
}
