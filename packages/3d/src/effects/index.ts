import type { EffectPreset, Registry } from "../registry"
import { bloom } from "./bloom"
import { vignette } from "./vignette"

/** Every effect the editor offers, in the order they apply. To add one, create its file and list it here. */
export const effects: Registry<EffectPreset> = [bloom, vignette]
