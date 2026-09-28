import { defineStaging } from "../registry"

/** From the left and above, so the depth and bevel show at a glance. */
export const oblique = defineStaging({
  id: "oblique",
  label: "Oblique",
  view: { azimuth: -30, elevation: 30 },
  light: { azimuth: 40, elevation: 35, intensity: 2 },
})
