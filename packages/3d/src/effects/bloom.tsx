import { createEffectComponent } from "@react-three/postprocessing"
import { BlendFunction, BloomEffect } from "postprocessing"

import { defineEffect } from "../registry"

// postprocessing's bloom shader, with the alpha left at zero.
const fragmentShader = /* glsl */ `
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D map;
#else
uniform lowp sampler2D map;
#endif
uniform float intensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = vec4(texture2D(map, uv).rgb * intensity, 0.0);
}
`

/**
 * Bloom that adds light without adding coverage. Stock bloom also writes
 * map × intensity into alpha, and its blend keeps the larger alpha, so the
 * Backdrop would take a glow for the shape: it would hide the background
 * behind the glow, and past intensity 1 subtract it outright.
 */
class GlowEffect extends BloomEffect {
  constructor(options?: ConstructorParameters<typeof BloomEffect>[0]) {
    super(options)
    this.setFragmentShader(fragmentShader)
  }
}

const Glow = createEffectComponent<
  typeof GlowEffect,
  { intensity?: number; "luminanceMaterial-threshold"?: number }
>(GlowEffect)

// Constructor options, hoisted so the effect isn't rebuilt on every render.
const GLOW_ARGS: [ConstructorParameters<typeof BloomEffect>[0]] = [
  { mipmapBlur: true },
]

export const bloom = defineEffect({
  id: "bloom",
  label: "Bloom",
  stage: "scene",
  params: {
    intensity: {
      type: "number",
      fixed: true,
      label: "Intensity",
      min: 0,
      max: 3,
      step: 0.01,
      default: 0.8,
    },
    threshold: {
      type: "number",
      fixed: true,
      label: "Threshold",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.85,
    },
  },
  render: ({ intensity, threshold }) => (
    // ADD, as postprocessing's own <Bloom> uses: BloomEffect's default,
    // SCREEN, dims highlights brighter than 1 where the glow is faint.
    <Glow
      args={GLOW_ARGS}
      blendFunction={BlendFunction.ADD}
      intensity={intensity}
      luminanceMaterial-threshold={threshold}
    />
  ),
})
