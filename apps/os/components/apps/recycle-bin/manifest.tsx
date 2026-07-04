import type { OsAppManifest } from "@/lib/os/types"
import { RecycleBinApp } from "@/components/apps/recycle-bin/recycle-bin"

export const recycleBinManifest: OsAppManifest = {
  id: "recycle-bin",
  name: "資源回收筒",
  description: "存放已刪除的檔案。",
  icon: "recycle-bin",
  window: {
    width: 320,
    height: 220,
    resizable: true,
    controls: ["minimize", "maximize", "close"],
  },
  multiInstance: false,
  Component: RecycleBinApp,
}
