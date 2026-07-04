import type { ComponentType } from "react"

import type { IconName } from "@/components/pixel-icon"
import type { AppId, WindowControl } from "@/lib/types"
import { AboutApp } from "@/components/apps/about"
import { ControlPanelApp } from "@/components/apps/control-panel"
import { MyDocumentsApp } from "@/components/apps/my-documents"
import { NotepadApp } from "@/components/apps/notepad"
import { RecycleBinApp } from "@/components/apps/recycle-bin"

export interface AppContentProps {
  onClose: () => void
}

export interface AppDefinition {
  id: AppId
  title: string
  icon: IconName
  width: number
  height: number
  controls: WindowControl[]
  Component: ComponentType<AppContentProps>
}

export const APPS: Record<AppId, AppDefinition> = {
  "control-panel": {
    id: "control-panel",
    title: "控制台",
    icon: "control-panel",
    width: 460,
    height: 400,
    controls: ["minimize", "maximize", "close"],
    Component: ControlPanelApp,
  },
  notepad: {
    id: "notepad",
    title: "記事本",
    icon: "notepad",
    width: 400,
    height: 320,
    controls: ["minimize", "maximize", "close"],
    Component: NotepadApp,
  },
  about: {
    id: "about",
    title: "關於",
    icon: "help",
    width: 360,
    height: 240,
    controls: ["close"],
    Component: AboutApp,
  },
  "my-documents": {
    id: "my-documents",
    title: "我的文件",
    icon: "folder",
    width: 320,
    height: 220,
    controls: ["minimize", "maximize", "close"],
    Component: MyDocumentsApp,
  },
  "recycle-bin": {
    id: "recycle-bin",
    title: "資源回收筒",
    icon: "recycle-bin",
    width: 320,
    height: 220,
    controls: ["minimize", "maximize", "close"],
    Component: RecycleBinApp,
  },
}

export const DESKTOP_ICON_ORDER: AppId[] = [
  "my-documents",
  "notepad",
  "control-panel",
  "recycle-bin",
]
