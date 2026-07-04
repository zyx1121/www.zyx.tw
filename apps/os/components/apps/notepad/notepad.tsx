"use client"

import * as React from "react"

import {
  MenuBar,
  MenuBarContent,
  MenuBarItem,
  MenuBarMenu,
  MenuBarSeparator,
  MenuBarTrigger,
} from "@/components/ui/menu-bar"
import { useDialogs } from "@/lib/os/sdk/use-dialogs"
import { basenamePath, useFs, type FsPath } from "@/lib/os/sdk/use-fs"
import { useProcess } from "@/lib/os/sdk/use-process"
import { useWindow } from "@/lib/os/sdk/use-window"

const UNTITLED = "未命名"
const DEFAULT_DIR: FsPath = "C:/My Documents"

export function NotepadApp() {
  const vfs = useFs()
  const { args, exit } = useProcess()
  const { setTitle, setOnBeforeClose } = useWindow()
  const { msgBox, openFile, saveFile } = useDialogs()

  const [path, setPath] = React.useState<FsPath | null>(args.path ?? null)
  const [content, setContent] = React.useState<string>(() =>
    args.path ? (vfs.readFile(args.path) ?? "") : ""
  )
  const [dirty, setDirty] = React.useState(false)

  const displayName = path ? basenamePath(path) : UNTITLED
  const title = `${dirty ? "*" : ""}${displayName} - 記事本`

  React.useEffect(() => {
    setTitle(title)
  }, [title, setTitle])

  const doSaveAs = React.useCallback(async (): Promise<boolean> => {
    const target = await saveFile({
      startDir: DEFAULT_DIR,
      defaultName: path ? basenamePath(path) : `${UNTITLED}.txt`,
      extension: ".txt",
    })
    if (!target) return false
    try {
      vfs.writeFile(target, content)
    } catch {
      // Belt-and-suspenders: the save dialog already rejects illegal
      // filenames, but any other write failure (e.g. a vanished parent
      // dir) must surface here too, not throw uncaught.
      await msgBox({
        title: "記事本",
        message: `無法將檔案儲存為「${basenamePath(target)}」。`,
        icon: "error",
      })
      return false
    }
    setPath(target)
    setDirty(false)
    return true
  }, [content, msgBox, path, saveFile, vfs])

  const doSave = React.useCallback(async (): Promise<boolean> => {
    if (!path) return doSaveAs()
    try {
      vfs.writeFile(path, content)
    } catch {
      await msgBox({
        title: "記事本",
        message: `無法儲存「${basenamePath(path)}」。`,
        icon: "error",
      })
      return false
    }
    setDirty(false)
    return true
  }, [content, doSaveAs, msgBox, path, vfs])

  const confirmDiscard = React.useCallback(async (): Promise<boolean> => {
    if (!dirty) return true
    const choice = await msgBox({
      title: "記事本",
      message: `要將變更儲存到 ${displayName} 嗎?`,
      icon: "warning",
      buttons: "yesnocancel",
    })
    if (choice === "no") return true
    if (choice === "cancel") return false
    return doSave()
  }, [dirty, displayName, doSave, msgBox])

  React.useEffect(() => {
    setOnBeforeClose(confirmDiscard)
    return () => setOnBeforeClose(null)
  }, [confirmDiscard, setOnBeforeClose])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
    setDirty(true)
  }

  const handleNew = async () => {
    if (!(await confirmDiscard())) return
    setPath(null)
    setContent("")
    setDirty(false)
  }

  const handleOpen = async () => {
    if (!(await confirmDiscard())) return
    const target = await openFile({
      startDir: DEFAULT_DIR,
      extensions: [".txt"],
    })
    if (!target) return
    const loaded = vfs.readFile(target)
    if (loaded === null) {
      await msgBox({
        title: "記事本",
        message: `無法開啟「${basenamePath(target)}」。`,
        icon: "error",
      })
      return
    }
    setPath(target)
    setContent(loaded)
    setDirty(false)
  }

  return (
    <div className="-m-2 flex flex-1 flex-col gap-0">
      <MenuBar>
        <MenuBarMenu>
          <MenuBarTrigger>檔案</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem onSelect={() => void handleNew()}>
              開新檔案
            </MenuBarItem>
            <MenuBarItem onSelect={() => void handleOpen()}>
              開啟舊檔...
            </MenuBarItem>
            <MenuBarItem onSelect={() => void doSave()}>儲存</MenuBarItem>
            <MenuBarItem onSelect={() => void doSaveAs()}>
              另存新檔...
            </MenuBarItem>
            <MenuBarSeparator />
            <MenuBarItem onSelect={exit}>結束</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu>
          <MenuBarTrigger>編輯</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem disabled>復原</MenuBarItem>
            <MenuBarItem disabled>剪下</MenuBarItem>
            <MenuBarItem disabled>複製</MenuBarItem>
            <MenuBarItem disabled>貼上</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
        <MenuBarMenu>
          <MenuBarTrigger>說明</MenuBarTrigger>
          <MenuBarContent>
            <MenuBarItem disabled>關於記事本</MenuBarItem>
          </MenuBarContent>
        </MenuBarMenu>
      </MenuBar>
      <textarea
        className="bevel-sunken win98-focusable m-2 flex-1 resize-none p-1 text-win98-text"
        value={content}
        onChange={handleChange}
        spellCheck={false}
      />
    </div>
  )
}
