import { defineEnvironment, gainMapFiles } from "../registry"

/** Poly Haven "Wooden Studio 14 by Alexander Scholten", CC0. */
export const lights = defineEnvironment({
  id: "lights",
  label: "Color lights",
  files: gainMapFiles("wooden_studio_14"),
})
