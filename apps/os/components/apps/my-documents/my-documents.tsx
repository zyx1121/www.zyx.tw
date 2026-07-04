"use client"

import { APPS } from "@/components/apps/registry"
import { PixelIcon } from "@/components/pixel-icon"
import {
  iconForEntry,
  labelForEntry,
  resolveOpenTarget,
} from "@/lib/os/sdk/open-target"
import { joinPath, useFs, useFsList } from "@/lib/os/sdk/use-fs"
import { useDialogs } from "@/lib/os/sdk/use-dialogs"
import { useProcess } from "@/lib/os/sdk/use-process"

const MY_DOCUMENTS_DIR = "C:/My Documents"

// Read-only folder view: creating/renaming files here is explorer's job
// (M3). Opening files by association is already real.
export function MyDocumentsApp() {
  const vfs = useFs()
  const { spawn } = useProcess()
  const { msgBox } = useDialogs()
  const entries = useFsList(MY_DOCUMENTS_DIR).filter(
    (entry) => !entry.name.startsWith(".")
  )

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-win98-text">
        <PixelIcon name="folder" size={32} />
        <p>這個資料夾是空的。</p>
      </div>
    )
  }

  const handleOpen = async (name: string) => {
    const path = joinPath(MY_DOCUMENTS_DIR, name)
    const target = resolveOpenTarget(vfs, APPS, path)
    if (target.kind === "spawn") {
      spawn(target.appId, target.args)
      return
    }
    await msgBox({
      title: "我的文件",
      message: `無法開啟「${labelForEntry(name)}」。`,
      icon: "error",
    })
  }

  return (
    <div className="grid auto-rows-min grid-cols-[repeat(auto-fill,72px)] content-start gap-2">
      {entries.map(({ name, node }) => (
        <button
          key={name}
          type="button"
          className="win98-focusable flex flex-col items-center gap-1 p-1 text-win98-text"
          onDoubleClick={() => void handleOpen(name)}
        >
          <PixelIcon name={iconForEntry(name, node, APPS)} size={32} />
          <span className="w-full truncate text-center text-[11px]">
            {labelForEntry(name)}
          </span>
        </button>
      ))}
    </div>
  )
}
