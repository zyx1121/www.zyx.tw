import type { Registry, StagingPreset } from "../registry"
import { floor } from "./floor"
import { front } from "./front"
import { lowAngle } from "./low-angle"
import { oblique } from "./oblique"
import { top } from "./top"

/**
 * Every staging the editor offers, in menu order. Oblique stays first: it is
 * the look every scene had before stagings, and the one unknown ids get. To
 * add one, create its file and list it here.
 */
export const stagings: Registry<StagingPreset> = [
  oblique,
  front,
  lowAngle,
  top,
  floor,
]
