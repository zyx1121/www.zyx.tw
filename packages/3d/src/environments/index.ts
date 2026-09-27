import type { EnvironmentPreset, Registry } from "../registry"
import { city } from "./city"
import { studio } from "./studio"

/** Every environment map the editor offers. To add one, drop its .hdr into apps/3d/public/env/, create its file, and list it here. */
export const environments: Registry<EnvironmentPreset> = [studio, city]
