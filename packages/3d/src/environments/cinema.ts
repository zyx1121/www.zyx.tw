import { defineEnvironment, gainMapFiles } from "../registry"

/** Poly Haven "Pretville Cinema by Dimitrios Savva and Jarod Guest", CC0. */
export const cinema = defineEnvironment({
  id: "cinema",
  label: "Cinema",
  files: gainMapFiles("pretville_cinema"),
})
