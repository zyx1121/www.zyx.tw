import { createEffectComponent } from "@react-three/postprocessing"
import { BlendFunction, Effect } from "postprocessing"
import * as THREE from "three"

const fragmentShader = /* glsl */ `
uniform vec3 color;
uniform float opacity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Clamped in case an effect upstream leaves alpha outside [0, 1].
  float coverage = clamp(inputColor.a, 0.0, 1.0);
  outputColor = vec4(
    inputColor.rgb + color * (1.0 - coverage) * opacity,
    mix(coverage, 1.0, opacity)
  );
}
`

/**
 * Lays the background color under the frame once tone mapping is done, so it
 * shows exactly as picked; tone mapping it would turn white gray and pull
 * saturated colors toward gray. The scene renders over transparent black,
 * which leaves the frame premultiplied, so "over" is rgb + color * (1 - a).
 */
export class BackdropEffect extends Effect {
  readonly #color: THREE.Uniform<THREE.Color>
  readonly #opacity: THREE.Uniform<number>

  constructor({
    color = "#000000",
    opacity = 1,
  }: { color?: THREE.ColorRepresentation; opacity?: number } = {}) {
    const colorUniform = new THREE.Uniform(new THREE.Color(color))
    const opacityUniform = new THREE.Uniform(opacity)
    super("BackdropEffect", fragmentShader, {
      blendFunction: BlendFunction.SRC,
      uniforms: new Map<string, THREE.Uniform>([
        ["color", colorUniform],
        ["opacity", opacityUniform],
      ]),
    })
    this.#color = colorUniform
    this.#opacity = opacityUniform
  }

  /** The uniform's own Color, so a `color` prop updates it in place. */
  get color(): THREE.Color {
    return this.#color.value
  }

  /**
   * How much of the background color shows, 1 by default. At 0 none of it
   * does and the alpha is the shape's coverage, which is how an export
   * leaves the background transparent.
   */
  get opacity(): number {
    return this.#opacity.value
  }

  set opacity(value: number) {
    this.#opacity.value = value
  }
}

// createEffectComponent applies props to the live effect; wrapEffect would
// rebuild it, and recompile the pass, on every color change.
export const Backdrop = createEffectComponent<
  typeof BackdropEffect,
  { color?: THREE.ColorRepresentation }
>(BackdropEffect)
