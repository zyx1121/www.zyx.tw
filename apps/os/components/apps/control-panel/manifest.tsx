import type { OsAppManifest } from "@/lib/os/types"
import { ControlPanelApp } from "@/components/apps/control-panel/control-panel"

export const controlPanelManifest: OsAppManifest = {
  id: "control-panel",
  name: "控制台",
  description: "調整外觀、瀏覽表單控件展示。",
  icon: "control-panel",
  window: {
    width: 460,
    height: 400,
    resizable: true,
    controls: ["minimize", "maximize", "close"],
  },
  multiInstance: false,
  Component: ControlPanelApp,
}
