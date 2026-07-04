"use client"

import * as React from "react"

import { APPS } from "@/components/apps/registry"
import { DirTree } from "@/components/apps/explorer/tree"
import { FolderView, type FolderViewActivation } from "@/components/folder-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resolveOpenTarget } from "@/lib/os/sdk/open-target"
import { useDialogs } from "@/lib/os/sdk/use-dialogs"
import {
  basenamePath,
  dirnamePath,
  useFs,
  useFsList,
  type FsPath,
} from "@/lib/os/sdk/use-fs"
import { useProcess } from "@/lib/os/sdk/use-process"
import { useWindow } from "@/lib/os/sdk/use-window"

const ROOT: FsPath = "C:"
const ROOT_TITLE = "本機磁碟 (C:)"

function toDisplayPath(path: FsPath): string {
  return path.replace(/\//g, "\\")
}

function fromDisplayPath(value: string): FsPath {
  return value.trim().replace(/\\/g, "/").replace(/\/+$/, "")
}

function folderTitle(path: FsPath): string {
  return path === ROOT ? ROOT_TITLE : basenamePath(path)
}

// My Documents (M2) is now just explorer opened at C:/My Documents (see the
// 我的文件.lnk seed in fs.ts) — same component, different initial path.
export function ExplorerApp() {
  const vfs = useFs()
  const { args, spawn } = useProcess()
  const { setTitle } = useWindow()
  const { msgBox } = useDialogs()

  const [path, setPath] = React.useState<FsPath>(args.path ?? ROOT)
  const [addressValue, setAddressValue] = React.useState(() =>
    toDisplayPath(path)
  )
  // Re-derive the address bar text whenever `path` itself changes (tree
  // click / up button / address Enter) without fighting the user's
  // in-progress typing — "adjusting state during render" per the React
  // docs, not an effect, so it can't double-fire alongside setTitle below.
  const [addressSyncedPath, setAddressSyncedPath] = React.useState(path)
  if (path !== addressSyncedPath) {
    setAddressSyncedPath(path)
    setAddressValue(toDisplayPath(path))
  }

  const entries = useFsList(path).filter((entry) => !entry.name.startsWith("."))
  const canGoUp = path !== ROOT

  React.useEffect(() => {
    setTitle(folderTitle(path))
  }, [path, setTitle])

  const navigateTo = React.useCallback(
    async (target: FsPath) => {
      const node = vfs.stat(target)
      if (!node || node.type !== "dir") {
        await msgBox({
          title: "檔案總管",
          message: `找不到路徑「${toDisplayPath(target)}」。`,
          icon: "error",
        })
        setAddressValue(toDisplayPath(path))
        return
      }
      setPath(target)
    },
    [msgBox, path, vfs]
  )

  const handleAddressSubmit = () => {
    const target = fromDisplayPath(addressValue)
    if (!target) return
    void navigateTo(target)
  }

  const handleUp = () => {
    if (!canGoUp) return
    void navigateTo(dirnamePath(path) || ROOT)
  }

  const handleActivate = ({ path: entryPath, node }: FolderViewActivation) => {
    if (node.type === "dir") {
      void navigateTo(entryPath)
      return
    }
    const target = resolveOpenTarget(vfs, APPS, entryPath)
    if (target.kind === "spawn") {
      spawn(target.appId, target.args)
      return
    }
    void msgBox({
      title: "檔案總管",
      message: `無法開啟「${basenamePath(entryPath)}」。`,
      icon: "error",
    })
  }

  return (
    <div data-testid="explorer" className="-m-2 flex flex-1 flex-col gap-0">
      <div className="flex shrink-0 items-center gap-1 border-b border-button-shadow p-1">
        <Button
          onClick={handleUp}
          disabled={!canGoUp}
          className="min-w-0 shrink-0 px-2"
        >
          上一層
        </Button>
        <span className="shrink-0">位址:</span>
        <Input
          value={addressValue}
          onChange={(event) => setAddressValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAddressSubmit()
          }}
        />
      </div>
      <div className="flex min-h-0 flex-1 gap-1 p-1">
        <DirTree
          activePath={path}
          onSelect={(target) => void navigateTo(target)}
          className="w-36 shrink-0"
        />
        <FolderView
          dir={path}
          mode="list"
          columns={["size", "type", "modified"]}
          onActivate={handleActivate}
          className="flex-1"
        />
      </div>
      <div className="bevel-status-field flex h-5 shrink-0 items-center px-2 text-win98-text">
        {entries.length} 個物件
      </div>
    </div>
  )
}
