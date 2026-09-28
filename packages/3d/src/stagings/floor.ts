import { defineStaging } from "../registry"

/** Standing just above an invisible floor, seen from a little above it. */
export const floor = defineStaging({
  id: "floor",
  label: "Floor",
  view: { azimuth: -30, elevation: 18 },
  light: { azimuth: 40, elevation: 50, intensity: 2 },
  floor: { gap: 0.06, opacity: 0.7, blur: 0.25 },
})
