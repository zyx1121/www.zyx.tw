import { Bloom } from "@react-three/postprocessing"

import { defineEffect } from "../registry"

export const bloom = defineEffect({
  id: "bloom",
  label: "Bloom",
  stage: "scene",
  params: {
    intensity: {
      type: "number",
      label: "Intensity",
      min: 0,
      max: 3,
      step: 0.01,
      default: 0.8,
    },
    threshold: {
      type: "number",
      label: "Threshold",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.85,
    },
  },
  render: ({ intensity, threshold }) => (
    <Bloom intensity={intensity} luminanceThreshold={threshold} mipmapBlur />
  ),
})
