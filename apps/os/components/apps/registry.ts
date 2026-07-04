import type { OsAppManifest } from "@/lib/os/types"
import { aboutManifest } from "@/components/apps/about/manifest"
import { controlPanelManifest } from "@/components/apps/control-panel/manifest"
import { explorerManifest } from "@/components/apps/explorer/manifest"
import { notepadManifest } from "@/components/apps/notepad/manifest"
import { recycleBinManifest } from "@/components/apps/recycle-bin/manifest"
import { taskManagerManifest } from "@/components/apps/task-manager/manifest"

const MANIFESTS: OsAppManifest[] = [
  aboutManifest,
  controlPanelManifest,
  explorerManifest,
  notepadManifest,
  recycleBinManifest,
  taskManagerManifest,
]

export const APPS: Record<string, OsAppManifest> = Object.fromEntries(
  MANIFESTS.map((app) => [app.id, app])
)
