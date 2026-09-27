import type { EffectPreset, Registry } from "../registry"
import { bloom } from "./bloom"
import { vignette } from "./vignette"

/** Every effect the editor offers. Within a stage they apply in this order. To add one, create its file and list it here. */
export const effects: Registry<EffectPreset> = [bloom, vignette]
