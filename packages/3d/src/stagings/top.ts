import { defineStaging } from "../registry"

/** From high above, looking down onto the top edges. */
export const top = defineStaging({
  id: "top",
  label: "Top",
  view: { azimuth: -20, elevation: 62 },
  light: { azimuth: 30, elevation: 70, intensity: 2 },
})
