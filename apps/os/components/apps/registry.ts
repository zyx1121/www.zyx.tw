import type { OsAppManifest } from "@/lib/os/types"
import { aboutManifest } from "@/components/apps/about/manifest"
import { controlPanelManifest } from "@/components/apps/control-panel/manifest"
import { myDocumentsManifest } from "@/components/apps/my-documents/manifest"
import { notepadManifest } from "@/components/apps/notepad/manifest"
import { recycleBinManifest } from "@/components/apps/recycle-bin/manifest"
import { taskManagerManifest } from "@/components/apps/task-manager/manifest"

const MANIFESTS: OsAppManifest[] = [
  aboutManifest,
  controlPanelManifest,
  myDocumentsManifest,
  notepadManifest,
  recycleBinManifest,
  taskManagerManifest,
]

export const APPS: Record<string, OsAppManifest> = Object.fromEntries(
  MANIFESTS.map((app) => [app.id, app])
)

export const DESKTOP_ICON_ORDER: string[] = [
  "my-documents",
  "notepad",
  "control-panel",
  "recycle-bin",
]
