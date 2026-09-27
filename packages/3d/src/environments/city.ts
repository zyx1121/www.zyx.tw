import { defineEnvironment, gainMapFiles } from "../registry"

/** Poly Haven "Potsdamer Platz by Greg Zaal", CC0. */
export const city = defineEnvironment({
  id: "city",
  label: "City",
  files: gainMapFiles("potsdamer_platz"),
})
