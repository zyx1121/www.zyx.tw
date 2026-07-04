import type { OsAppManifest } from "@/lib/os/types"
import { ExplorerApp } from "@/components/apps/explorer/explorer"

export const explorerManifest: OsAppManifest = {
  id: "explorer",
  name: "檔案總管",
  description: "瀏覽電腦上的檔案與資料夾。",
  icon: "directory-explorer",
  window: {
    width: 480,
    height: 340,
    minWidth: 320,
    minHeight: 220,
    resizable: true,
    controls: ["minimize", "maximize", "close"],
  },
  // Real Explorer windows are independent per path — reopening 我的文件
  // while a C: window is already open should not clobber it.
  multiInstance: true,
  Component: ExplorerApp,
}
