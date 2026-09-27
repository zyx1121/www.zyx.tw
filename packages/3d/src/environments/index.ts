import type { EnvironmentPreset, Registry } from "../registry"
import { cinema } from "./cinema"
import { city } from "./city"
import { lights } from "./lights"
import { magenta } from "./magenta"
import { neon } from "./neon"
import { pink } from "./pink"
import { sky } from "./sky"
import { studio } from "./studio"
import { sunset } from "./sunset"
import { violet } from "./violet"

/**
 * Every environment map the editor offers, in menu order. To add one, put its
 * gain map files in apps/3d/public/env/<name>/, create its file, and list it
 * here.
 */
export const environments: Registry<EnvironmentPreset> = [
  studio,
  city,
  neon,
  pink,
  violet,
  magenta,
  lights,
  cinema,
  sunset,
  sky,
]
