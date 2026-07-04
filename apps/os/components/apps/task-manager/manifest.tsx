import type { OsAppManifest } from "@/lib/os/types"
import { TaskManagerApp } from "@/components/apps/task-manager/task-manager"

export const taskManagerManifest: OsAppManifest = {
  id: "task-manager",
  name: "工作管理員",
  description: "檢視執行中的程式並結束工作。",
  icon: "task-manager",
  window: {
    width: 320,
    height: 260,
    resizable: false,
    controls: ["close"],
  },
  multiInstance: false,
  desktopHidden: true,
  Component: TaskManagerApp,
}
