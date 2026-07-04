"use client"

import * as React from "react"

import { APPS } from "@/components/apps/registry"
import { PixelIcon } from "@/components/pixel-icon"
import {
  ContextMenu,
  clampContextMenuPosition,
  type ContextMenuEntry,
  type ContextMenuState,
} from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import { iconForEntry, labelForEntry } from "@/lib/os/sdk/open-target"
import { useDialogs } from "@/lib/os/sdk/use-dialogs"
import {
  ILLEGAL_NAME_CHARS,
  ILLEGAL_NAME_MESSAGE,
  joinPath,
  uniqueNameIn,
  useFs,
  useFsList,
  type FsEntry,
  type FsNode,
  type FsPath,
} from "@/lib/os/sdk/use-fs"
import { cn } from "@/lib/utils"

export type FolderViewMode = "icon" | "list"
export type FolderViewColumn = "size" | "type" | "modified"

export interface FolderViewActivation {
  name: string
  path: FsPath
  node: FsNode
}

export interface FolderViewProps {
  dir: FsPath
  /** "icon" = desktop-style grid (absolute, fills its positioned parent).
   * "list" = explorer/dialog-style rows (fills via flex, scrolls). */
  mode?: FolderViewMode
  /** Extra list-mode columns beyond the always-shown icon+name. */
  columns?: FolderViewColumn[]
  /** Extra narrowing beyond the built-in dotfile hide — directories always
   * pass through regardless (you still need to navigate through them). */
  filter?: (entry: FsEntry) => boolean
  /** Double-click / Enter on an entry. The caller decides what "open"
   * means: explorer navigates into directories, the desktop spawns an app
   * via resolveOpenTarget, a save/open dialog fills in the filename. */
  onActivate?: (info: FolderViewActivation) => void
  /** Fires whenever the single-click selection changes (including to
   * null). Save/Open dialogs use this to mirror the pick into their
   * filename field. */
  onSelectionChange?: (info: FolderViewActivation | null) => void
  /** Recycle Bin semantics: item menu becomes 還原 / 永久刪除, and the
   * blank-area menu drops 新增資料夾/新增文字文件 (you can't mkdir in the
   * Bin). */
  recycleBin?: boolean
  /** File dialogs: browse only — no context menu, no create/rename/delete. */
  readOnly?: boolean
  /** Desktop-only (M4): raw entry names to float to the front of the
   * listing, in the given order, ahead of the normal dir-then-lexicographic
   * order — e.g. pinning 我的電腦.lnk above the alphabetically-earlier
   * 我的文件.lnk. Everything not listed keeps its normal relative order
   * behind the pinned entries. Purely a rendering concern: it doesn't touch
   * the underlying fs.list() order other callers (explorer, dialogs) rely on. */
  pinFirst?: string[]
  emptyMessage?: string
  className?: string
}

const NEW_FOLDER_BASE = "新增資料夾"
const NEW_TEXT_FILE_BASE = "新文字文件.txt"
const RECYCLE_META_NAME = ".meta"

function typeLabel(name: string, node: FsNode): string {
  if (node.type === "dir") return "資料夾"
  const lower = name.toLowerCase()
  if (lower.endsWith(".lnk")) return "捷徑"
  if (lower.endsWith(".txt")) return "文字文件"
  return "檔案"
}

function sizeLabel(node: FsNode): string {
  return node.type === "dir" ? "" : `${node.content.length} 位元組`
}

function modifiedLabel(node: FsNode): string {
  return new Date(node.mtime).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Shared folder listing: icon grid or list rows, inline rename, and the
 * Win98 right-click menu (new folder/file, rename, delete/recycle) — the
 * single implementation behind the desktop, My Documents (now explorer),
 * the recycle bin, explorer's right pane, and the open/save dialogs. */
export function FolderView({
  dir,
  mode = "icon",
  columns = [],
  filter,
  onActivate,
  onSelectionChange,
  recycleBin = false,
  readOnly = false,
  pinFirst,
  emptyMessage = "這個資料夾是空的。",
  className,
}: FolderViewProps) {
  const vfs = useFs()
  const { msgBox } = useDialogs()

  const rawEntries = useFsList(dir)
  const entries = React.useMemo(() => {
    const filtered = rawEntries.filter((entry) => {
      if (entry.name.startsWith(".")) return false
      if (!filter || entry.node.type === "dir") return true
      return filter(entry)
    })
    if (!pinFirst || pinFirst.length === 0) return filtered
    const pinned: FsEntry[] = []
    const rest: FsEntry[] = []
    for (const entry of filtered) {
      if (pinFirst.includes(entry.name)) pinned.push(entry)
      else rest.push(entry)
    }
    pinned.sort((a, b) => pinFirst.indexOf(a.name) - pinFirst.indexOf(b.name))
    return [...pinned, ...rest]
  }, [rawEntries, filter, pinFirst])

  const [selectedNameState, setSelectedNameState] = React.useState<
    string | null
  >(null)
  // Derived, not re-synced via effect: a name that fell out of the current
  // listing (deleted/renamed/navigated away from) just stops being
  // "selected" — same trick M2's recycle-bin.tsx used.
  const selectedName = entries.some((e) => e.name === selectedNameState)
    ? selectedNameState
    : null

  const [renamingName, setRenamingName] = React.useState<string | null>(null)
  const [renameValue, setRenameValue] = React.useState("")

  const [contextMenu, setContextMenu] = React.useState<ContextMenuState | null>(
    null
  )

  const setSelectedName = React.useCallback(
    (name: string | null) => {
      setSelectedNameState(name)
      if (!onSelectionChange) return
      const entry = name ? entries.find((e) => e.name === name) : undefined
      onSelectionChange(
        entry
          ? { name: entry.name, path: joinPath(dir, name!), node: entry.node }
          : null
      )
    },
    [dir, entries, onSelectionChange]
  )

  const activate = (entry: FsEntry) => {
    onActivate?.({
      name: entry.name,
      path: joinPath(dir, entry.name),
      node: entry.node,
    })
  }

  const startRename = (name: string) => {
    setRenamingName(name)
    setRenameValue(name)
  }

  const cancelRename = () => {
    setRenamingName(null)
    setRenameValue("")
  }

  const commitRename = async () => {
    const original = renamingName
    if (!original) return
    const next = renameValue.trim()
    cancelRename()
    if (!next || next === original) return
    if (ILLEGAL_NAME_CHARS.test(next)) {
      await msgBox({
        title: "重新命名",
        message: ILLEGAL_NAME_MESSAGE,
        icon: "error",
      })
      return
    }
    if (vfs.exists(joinPath(dir, next))) {
      await msgBox({
        title: "重新命名",
        message: `已經有名為「${next}」的檔案或資料夾。請使用其他名稱。`,
        icon: "error",
      })
      return
    }
    vfs.mv(joinPath(dir, original), joinPath(dir, next))
    setSelectedName(next)
  }

  // C:/Recycled/.meta is a plain JSON file per docs/DESIGN.md's documented
  // convention (not a private implementation detail), so permanently
  // deleting a single item here is allowed to patch it directly — mirrors
  // what fs.ts's own emptyRecycleBin() does for the whole-bin case.
  const forgetRecycleOrigin = (name: string) => {
    const raw = vfs.readFile(joinPath(dir, RECYCLE_META_NAME))
    if (!raw) return
    try {
      const meta = JSON.parse(raw) as Record<string, string>
      if (!(name in meta)) return
      delete meta[name]
      vfs.writeFile(joinPath(dir, RECYCLE_META_NAME), JSON.stringify(meta))
    } catch {
      // Malformed .meta — nothing sane to patch, leave it alone.
    }
  }

  const recycleEntry = (name: string) => {
    vfs.recycle(joinPath(dir, name))
    if (selectedName === name) setSelectedName(null)
  }

  const restoreEntry = (name: string) => {
    vfs.restore(name)
    if (selectedName === name) setSelectedName(null)
  }

  const permanentlyDelete = async (name: string) => {
    const result = await msgBox({
      title: "資源回收筒",
      message: `確定要永久刪除「${name}」嗎?`,
      icon: "question",
      buttons: "yesno",
    })
    if (result !== "yes") return
    vfs.rm(joinPath(dir, name))
    forgetRecycleOrigin(name)
    if (selectedName === name) setSelectedName(null)
  }

  const createFolder = () => {
    const name = uniqueNameIn(vfs, dir, NEW_FOLDER_BASE)
    vfs.mkdir(joinPath(dir, name))
    setSelectedName(name)
    startRename(name)
  }

  const createTextFile = () => {
    const name = uniqueNameIn(vfs, dir, NEW_TEXT_FILE_BASE)
    vfs.writeFile(joinPath(dir, name), "")
    setSelectedName(name)
    startRename(name)
  }

  const openBlankMenu = (event: React.MouseEvent) => {
    if (readOnly) return
    event.preventDefault()
    const position = clampContextMenuPosition(event.clientX, event.clientY)
    const items: ContextMenuEntry[] = recycleBin
      ? [{ label: "重新整理", onSelect: () => {} }]
      : [
          { label: "新增資料夾", onSelect: createFolder },
          { label: "新增文字文件", onSelect: createTextFile },
          { separator: true },
          { label: "重新整理", onSelect: () => {} },
        ]
    setContextMenu({ ...position, entries: items })
  }

  const openItemMenu = (event: React.MouseEvent, entry: FsEntry) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedName(entry.name)
    if (readOnly) return
    const position = clampContextMenuPosition(event.clientX, event.clientY)
    const items: ContextMenuEntry[] = recycleBin
      ? [
          { label: "還原", onSelect: () => restoreEntry(entry.name) },
          { separator: true },
          {
            label: "永久刪除",
            onSelect: () => void permanentlyDelete(entry.name),
          },
        ]
      : [
          { label: "開啟", onSelect: () => activate(entry) },
          { separator: true },
          { label: "改名", onSelect: () => startRename(entry.name) },
          { label: "刪除", onSelect: () => recycleEntry(entry.name) },
        ]
    setContextMenu({ ...position, entries: items })
  }

  const renderRenameInput = () => (
    <Input
      autoFocus
      value={renameValue}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => setRenameValue(event.target.value)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === "Enter") void commitRename()
        if (event.key === "Escape") cancelRename()
      }}
      onBlur={() => void commitRename()}
      className={cn("h-[18px] text-[11px]", mode === "icon" && "text-center")}
    />
  )

  const renderEntry = (entry: FsEntry) => {
    const isSelected = selectedName === entry.name
    const isRenaming = renamingName === entry.name
    const icon = iconForEntry(entry.name, entry.node, APPS)
    const label = labelForEntry(entry.name)

    if (mode === "icon") {
      if (isRenaming) {
        return (
          <div
            key={entry.name}
            className="flex w-20 flex-col items-center gap-1 p-1"
          >
            <PixelIcon name={icon} size={32} />
            {renderRenameInput()}
          </div>
        )
      }
      return (
        <button
          key={entry.name}
          type="button"
          className="win98-focusable flex w-20 flex-col items-center gap-1 p-1"
          onClick={(event) => {
            event.stopPropagation()
            setSelectedName(entry.name)
          }}
          onDoubleClick={(event) => {
            event.stopPropagation()
            activate(entry)
          }}
          onContextMenu={(event) => openItemMenu(event, entry)}
          onKeyDown={(event) => {
            if (event.key === "Enter") activate(entry)
            if (event.key === "F2" && !readOnly) startRename(entry.name)
          }}
        >
          <PixelIcon
            name={icon}
            size={32}
            className={cn(isSelected && "opacity-70")}
          />
          <span
            className={cn(
              "w-full truncate px-1 text-center text-[11px] text-white [text-shadow:1px_1px_1px_black]",
              isSelected &&
                "bg-selection text-selection-foreground [text-shadow:none]"
            )}
          >
            {label}
          </span>
        </button>
      )
    }

    if (isRenaming) {
      return (
        <li key={entry.name}>
          <div className="flex w-full items-center gap-2 px-1 py-0.5">
            <PixelIcon name={icon} size={16} className="shrink-0" />
            {renderRenameInput()}
          </div>
        </li>
      )
    }

    return (
      <li key={entry.name}>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 px-1 py-0.5 text-left",
            isSelected && "bg-selection text-selection-foreground"
          )}
          onClick={(event) => {
            event.stopPropagation()
            setSelectedName(entry.name)
          }}
          onDoubleClick={(event) => {
            event.stopPropagation()
            activate(entry)
          }}
          onContextMenu={(event) => openItemMenu(event, entry)}
          onKeyDown={(event) => {
            if (event.key === "Enter") activate(entry)
            if (event.key === "F2" && !readOnly) startRename(entry.name)
          }}
        >
          <PixelIcon name={icon} size={16} className="shrink-0" />
          <span className="flex-1 truncate">{label}</span>
          {columns.includes("size") && (
            <span className="w-20 shrink-0 truncate text-right">
              {sizeLabel(entry.node)}
            </span>
          )}
          {columns.includes("type") && (
            <span className="w-20 shrink-0 truncate">
              {typeLabel(entry.name, entry.node)}
            </span>
          )}
          {columns.includes("modified") && (
            <span className="w-36 shrink-0 truncate">
              {modifiedLabel(entry.node)}
            </span>
          )}
        </button>
      </li>
    )
  }

  return (
    <div
      className={cn(
        mode === "icon"
          ? "absolute inset-0 flex flex-col flex-wrap content-start items-start gap-1 p-2"
          : "bevel-sunken overflow-auto bg-white",
        className
      )}
      onClick={() => setSelectedName(null)}
      onContextMenu={openBlankMenu}
    >
      {mode === "list" && entries.length === 0 ? (
        <p className="px-2 py-1 text-win98-text">{emptyMessage}</p>
      ) : mode === "icon" ? (
        entries.map(renderEntry)
      ) : (
        <ul className="m-0 list-none p-0.5">{entries.map(renderEntry)}</ul>
      )}
      <ContextMenu state={contextMenu} onClose={() => setContextMenu(null)} />
    </div>
  )
}
