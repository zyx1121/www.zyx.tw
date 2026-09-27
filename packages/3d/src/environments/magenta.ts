import { defineEnvironment, gainMapFiles } from "../registry"

/** Poly Haven "Ferndale Studio 06 by Dimitrios Savva and Greg Zaal", CC0. */
export const magenta = defineEnvironment({
  id: "magenta",
  label: "Magenta",
  files: gainMapFiles("ferndale_studio_06"),
})
