import { defineStaging } from "../registry"

/** From below, looking up, with the light from high above: the hero shot. */
export const lowAngle = defineStaging({
  id: "low-angle",
  label: "Low angle",
  view: { azimuth: -20, elevation: -18 },
  light: { azimuth: 30, elevation: 60, intensity: 2.5 },
})
