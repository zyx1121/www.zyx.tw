import type { OsAppManifest } from "@/lib/os/types"
import { NotepadApp } from "@/components/apps/notepad/notepad"

export const notepadManifest: OsAppManifest = {
  id: "notepad",
  name: "記事本",
  description: "編輯純文字檔案。",
  icon: "notepad",
  window: {
    width: 400,
    height: 320,
    resizable: true,
    controls: ["minimize", "maximize", "close"],
  },
  multiInstance: true,
  fileAssociations: [".txt"],
  Component: NotepadApp,
}
