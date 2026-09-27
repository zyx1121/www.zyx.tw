import { defineEnvironment, gainMapFiles } from "../registry"

/** Poly Haven "Shanghai Bund by Greg Zaal", CC0. */
export const neon = defineEnvironment({
  id: "neon",
  label: "Neon",
  files: gainMapFiles("shanghai_bund"),
})
