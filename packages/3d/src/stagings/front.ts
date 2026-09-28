import { defineStaging } from "../registry"

/** Straight on, so the outline reads as drawn. */
export const front = defineStaging({
  id: "front",
  label: "Front",
  view: { azimuth: 0, elevation: 0 },
  light: { azimuth: 30, elevation: 40, intensity: 2 },
})
