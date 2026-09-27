import { Vignette } from "@react-three/postprocessing"

import { defineEffect } from "../registry"

export const vignette = defineEffect({
  id: "vignette",
  label: "Vignette",
  params: {
    darkness: {
      type: "number",
      label: "Darkness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.6,
    },
    offset: {
      type: "number",
      label: "Offset",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.35,
    },
  },
  render: ({ darkness, offset }) => (
    <Vignette darkness={darkness} offset={offset} />
  ),
})
