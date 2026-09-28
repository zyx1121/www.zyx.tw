import type { MaterialPreset, Registry } from "../registry"
import { chrome } from "./chrome"
import { clay } from "./clay"
import { frosted } from "./frosted"
import { glass } from "./glass"
import { gold } from "./gold"
import { iridescent } from "./iridescent"
import { marble } from "./marble"
import { metal } from "./metal"
import { plastic } from "./plastic"
import { wood } from "./wood"

/** Every material the editor offers, in menu order; the first is the default. To add one, create its file and list it here. */
export const materials: Registry<MaterialPreset> = [
  metal,
  chrome,
  gold,
  glass,
  frosted,
  plastic,
  clay,
  iridescent,
  wood,
  marble,
]
