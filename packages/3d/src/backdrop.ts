import { createEffectComponent } from "@react-three/postprocessing"
import { BlendFunction, Effect } from "postprocessing"
import * as THREE from "three"

const fragmentShader = /* glsl */ `
uniform vec3 color;
uniform sampler2D map;
uniform bool useMap;
uniform vec2 scale;
uniform float aspect;
uniform vec2 lensCenter;
uniform float lensRadius;
uniform float lensStrength;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Clamped in case an effect upstream leaves alpha outside [0, 1].
  float coverage = clamp(inputColor.a, 0.0, 1.0);
  vec3 under = color;
  if (useMap) {
    vec2 source = uv;
    if (lensStrength > 0.0) {
      // A point lens: light seen at distance r from the center comes from
      // r - einstein^2 / r, so the background bends around the center, a
      // ring of it wraps the hole, and inside the ring it shows mirrored.
      vec2 offset = (uv - lensCenter) * vec2(aspect, 1.0);
      float r = max(length(offset), 1e-4);
      float einstein = lensRadius * lensStrength;
      // Fades out far from the hole, so the edges of the page stay put.
      float reach = exp(-pow(r / (lensRadius * 4.0), 2.0));
      vec2 bend = offset / r * (einstein * einstein / r) * reach;
      source = uv - bend / vec2(aspect, 1.0);
    }
    under = texture2D(map, (source - 0.5) * scale + 0.5).rgb;
  }
  outputColor = vec4(inputColor.rgb + under * (1.0 - coverage), 1.0);
}
`

type BackdropOptions = {
  color?: THREE.ColorRepresentation
  map?: THREE.Texture | null
}

/**
 * Lays the background under the frame once tone mapping is done, so it
 * shows exactly as picked; tone mapping it would turn white gray and pull
 * saturated colors toward gray. The scene renders over transparent black,
 * which leaves the frame premultiplied, so "over" is rgb + under * (1 - a).
 *
 * The background is a color, or an image cropped like CSS `center / cover`
 * that can bend around a point like light past a black hole.
 */
export class BackdropEffect extends Effect {
  constructor({ color = "#000000", map = null }: BackdropOptions = {}) {
    super("BackdropEffect", fragmentShader, {
      blendFunction: BlendFunction.SRC,
      uniforms: new Map<string, THREE.Uniform>([
        ["color", new THREE.Uniform(new THREE.Color(color))],
        ["map", new THREE.Uniform(map)],
        ["useMap", new THREE.Uniform(map !== null)],
        ["scale", new THREE.Uniform(new THREE.Vector2(1, 1))],
        ["aspect", new THREE.Uniform(1)],
        ["lensCenter", new THREE.Uniform(new THREE.Vector2(0.5, 0.5))],
        ["lensRadius", new THREE.Uniform(0.1)],
        ["lensStrength", new THREE.Uniform(0)],
      ]),
    })
  }

  #uniform<T>(name: string) {
    return this.uniforms.get(name) as THREE.Uniform<T>
  }

  /** The uniform's own Color, so a `color` prop updates it in place. */
  get color(): THREE.Color {
    return this.#uniform<THREE.Color>("color").value
  }

  set map(map: THREE.Texture | null) {
    this.#uniform<THREE.Texture | null>("map").value = map
    this.#uniform<boolean>("useMap").value = map !== null
  }

  /** Crops the image like `center / cover` for a canvas of this aspect. */
  setAspect(aspect: number) {
    const image = this.#uniform<THREE.Texture | null>("map").value?.image as
      | { width: number; height: number }
      | undefined
    this.#uniform<number>("aspect").value = aspect
    if (!image) return
    const ratio = aspect / (image.width / image.height)
    this.#uniform<THREE.Vector2>("scale").value.set(
      ratio > 1 ? 1 : ratio,
      ratio > 1 ? 1 / ratio : 1
    )
  }

  /**
   * The lens, in uv: its center, its radius as a fraction of the canvas
   * height, and the Einstein radius as a multiple of that. 0 turns it off.
   */
  setLens(center: THREE.Vector2, radius: number, strength: number) {
    this.#uniform<THREE.Vector2>("lensCenter").value.copy(center)
    this.#uniform<number>("lensRadius").value = radius
    this.#uniform<number>("lensStrength").value = strength
  }
}

// createEffectComponent applies props to the live effect; wrapEffect would
// rebuild it, and recompile the pass, on every color change.
export const Backdrop = createEffectComponent<
  typeof BackdropEffect,
  BackdropOptions
>(BackdropEffect)
