import { defineEnvironment, gainMapFiles } from "../registry"

/** Poly Haven "The Sky Is On Fire by Greg Zaal and Rico Cilliers", CC0. */
export const sunset = defineEnvironment({
  id: "sunset",
  label: "Sunset",
  files: gainMapFiles("the_sky_is_on_fire"),
})
