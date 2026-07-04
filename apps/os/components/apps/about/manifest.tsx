import type { OsAppManifest } from "@/lib/os/types"
import { AboutApp } from "@/components/apps/about/about"

export const aboutManifest: OsAppManifest = {
  id: "about",
  name: "關於",
  description: "關於這個 Win98 桌面 POC。",
  icon: "help",
  window: {
    width: 360,
    height: 240,
    resizable: false,
    controls: ["close"],
  },
  multiInstance: false,
  desktopHidden: true,
  Component: AboutApp,
}
