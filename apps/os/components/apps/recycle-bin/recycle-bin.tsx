"use client"

import * as React from "react"

import { PixelIcon } from "@/components/pixel-icon"
import { Button } from "@/components/ui/button"
import { useDialogs } from "@/lib/os/sdk/use-dialogs"
import { useFs, useFsList } from "@/lib/os/sdk/use-fs"
import { cn } from "@/lib/utils"

const RECYCLE_DIR = "C:/Recycled"

export function RecycleBinApp() {
  const vfs = useFs()
  const { msgBox } = useDialogs()
  const entries = useFsList(RECYCLE_DIR).filter(
    (entry) => !entry.name.startsWith(".")
  )
  const [selectedName, setSelectedName] = React.useState<string | null>(null)
  // Derived, not re-synced via effect: a name that fell out of the listing
  // (restored/emptied from elsewhere) just stops being "selected".
  const selected = entries.some((entry) => entry.name === selectedName)
    ? selectedName
    : null

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-win98-text">
        <PixelIcon name="recycle-bin" size={32} />
        <p>資源回收筒是空的。</p>
      </div>
    )
  }

  const handleRestore = () => {
    if (!selected) return
    vfs.restore(selected)
    setSelectedName(null)
  }

  const handleEmpty = async () => {
    const result = await msgBox({
      title: "資源回收筒",
      message: "確定要永久刪除資源回收筒中的所有項目嗎?",
      icon: "question",
      buttons: "yesno",
    })
    if (result === "yes") {
      vfs.emptyRecycleBin()
      setSelectedName(null)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="bevel-sunken flex-1 overflow-auto bg-white">
        <ul className="m-0 list-none p-0.5">
          {entries.map(({ name, node }) => (
            <li key={name}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-1 py-0.5 text-left text-win98-text",
                  selected === name && "bg-selection text-selection-foreground"
                )}
                onClick={() => setSelectedName(name)}
              >
                <PixelIcon
                  name={node.type === "dir" ? "folder" : "notepad-file"}
                  size={16}
                />
                <span className="truncate">{name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={handleRestore} disabled={!selected}>
          還原
        </Button>
        <Button onClick={() => void handleEmpty()}>清空回收筒</Button>
      </div>
    </div>
  )
}
