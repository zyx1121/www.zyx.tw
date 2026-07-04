import type { OsAppManifest } from "@/lib/os/types"
import { MyDocumentsApp } from "@/components/apps/my-documents/my-documents"

export const myDocumentsManifest: OsAppManifest = {
  id: "my-documents",
  name: "我的文件",
  description: "存放個人文件的資料夾。",
  icon: "folder",
  window: {
    width: 320,
    height: 220,
    resizable: true,
    controls: ["minimize", "maximize", "close"],
  },
  multiInstance: false,
  Component: MyDocumentsApp,
}
