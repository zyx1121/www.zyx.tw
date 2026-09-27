import { defineEnvironment, gainMapFiles } from "../registry"

/** Poly Haven "Studio Small 03 by Greg Zaal", CC0. */
export const studio = defineEnvironment({
  id: "studio",
  label: "Studio",
  files: gainMapFiles("studio_small_03"),
})
