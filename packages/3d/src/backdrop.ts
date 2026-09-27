import { wrapEffect } from "@react-three/postprocessing"
import { BlendFunction, Effect } from "postprocessing"
import * as THREE from "three"

const fragmentShader = /* glsl */ `
uniform vec3 color;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = vec4(inputColor.rgb + color * (1.0 - inputColor.a), 1.0);
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

  constructor({
    color = "#000000",
  }: { color?: THREE.ColorRepresentation } = {}) {
    const uniform = new THREE.Uniform(new THREE.Color(color))
    super("BackdropEffect", fragmentShader, {
      blendFunction: BlendFunction.SRC,
      uniforms: new Map([["color", uniform]]),
    })
    this.#color = uniform
  }

  /** The uniform's own Color, so a `color` prop updates it in place. */
  get color(): THREE.Color {
    return this.#color.value
  }
}

export const Backdrop = wrapEffect(BackdropEffect)
