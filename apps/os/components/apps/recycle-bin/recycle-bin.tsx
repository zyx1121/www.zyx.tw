"use client"

import { FolderView } from "@/components/folder-view"
import { Button } from "@/components/ui/button"
import { useDialogs } from "@/lib/os/sdk/use-dialogs"
import { useFs } from "@/lib/os/sdk/use-fs"

const RECYCLE_DIR = "C:/Recycled"

// Per-item restore/permanent-delete now live in FolderView's right-click
// menu (recycleBin mode) — this shell just keeps the whole-bin "清空回收筒"
// action, which has no per-row equivalent.
export function RecycleBinApp() {
  const vfs = useFs()
  const { msgBox } = useDialogs()

  const handleEmpty = async () => {
    const result = await msgBox({
      title: "資源回收筒",
      message: "確定要永久刪除資源回收筒中的所有項目嗎?",
      icon: "question",
      buttons: "yesno",
    })
    if (result === "yes") {
      vfs.emptyRecycleBin()
    }
  }

  return (
    <div data-testid="recycle-bin" className="flex flex-1 flex-col gap-2">
      <FolderView
        dir={RECYCLE_DIR}
        mode="list"
        recycleBin
        emptyMessage="資源回收筒是空的。"
        className="flex-1"
      />
      <div className="flex justify-end gap-2">
        <Button onClick={() => void handleEmpty()}>清空回收筒</Button>
      </div>
    </div>
  )
}
