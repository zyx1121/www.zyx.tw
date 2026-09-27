import { defineEnvironment, gainMapFiles } from "../registry"

/** Poly Haven "Kloofendal 48d Partly Cloudy (Pure Sky) by Greg Zaal and Jarod Guest", CC0. */
export const sky = defineEnvironment({
  id: "sky",
  label: "Sky",
  files: gainMapFiles("kloofendal_48d_partly_cloudy_puresky"),
})
