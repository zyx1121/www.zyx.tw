import type { MaterialPreset, Registry } from "../registry"
import { glass } from "./glass"
import { metal } from "./metal"
import { plastic } from "./plastic"

/** Every material the editor offers. To add one, create its file and list it here. */
export const materials: Registry<MaterialPreset> = [metal, glass, plastic]
