"use client"

import * as React from "react"

import { PixelIcon, type IconName } from "@/components/pixel-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type {
  DialogRequest,
  MsgBoxButtons,
  MsgBoxIcon,
  MsgBoxOptions,
  MsgBoxResult,
  OpenFileOptions,
  SaveFileOptions,
} from "@/lib/os/kernel/dialog-manager"
import {
  dirnamePath,
  joinPath,
  vfs,
  type FsNode,
  type FsPath,
} from "@/lib/os/kernel/fs"
import { cn } from "@/lib/utils"

/** Win98 chrome for system-modal dialogs — same bevel formulas as
 * components/ui/window.tsx, but centered/static (no drag, no resize). */
function DialogFrame({
  title,
  width,
  onRequestClose,
  footer,
  children,
}: {
  title: string
  width: number
  onRequestClose: () => void
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="bevel-window flex flex-col bg-surface"
      style={{ width }}
    >
      <div
        className="flex h-5 shrink-0 items-center gap-1 py-[3px] pr-[2px] pl-[3px] select-none"
        style={{ backgroundImage: "var(--title-active)" }}
      >
        <span className="flex-1 truncate text-[11px] font-bold text-white">
          {title}
        </span>
        <button
          type="button"
          aria-label="關閉"
          className="bevel-raised win98-focusable active:bevel-pressed flex h-[14px] w-4 shrink-0 items-center justify-center"
          onClick={onRequestClose}
        >
          <svg viewBox="0 0 9 9" width={9} height={9} aria-hidden>
            <path
              d="M0.5,0.5 L8.5,8.5 M8.5,0.5 L0.5,8.5"
              stroke="#000"
              strokeWidth={1.5}
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-4 p-4 text-win98-text">{children}</div>
      <div className="flex justify-end gap-2 px-4 pb-4">{footer}</div>
    </div>
  )
}

const MSG_ICON: Record<MsgBoxIcon, IconName> = {
  info: "msg-information",
  warning: "msg-warning",
  error: "msg-error",
  question: "msg-question",
}

const MSG_BUTTONS: Record<
  MsgBoxButtons,
  { label: string; result: MsgBoxResult }[]
> = {
  ok: [{ label: "確定", result: "ok" }],
  okcancel: [
    { label: "確定", result: "ok" },
    { label: "取消", result: "cancel" },
  ],
  yesno: [
    { label: "是", result: "yes" },
    { label: "否", result: "no" },
  ],
  yesnocancel: [
    { label: "是", result: "yes" },
    { label: "否", result: "no" },
    { label: "取消", result: "cancel" },
  ],
}

/** Result used for both Escape and the titlebar X — mirrors classic
 * Windows: Cancel if present, else No, else Ok. */
const DISMISS_RESULT: Record<MsgBoxButtons, MsgBoxResult> = {
  ok: "ok",
  okcancel: "cancel",
  yesno: "no",
  yesnocancel: "cancel",
}

function MessageBoxDialog({
  options,
  onResolve,
}: {
  options: MsgBoxOptions
  onResolve: (result: MsgBoxResult) => void
}) {
  const buttonsKind = options.buttons ?? "ok"
  const buttons = MSG_BUTTONS[buttonsKind]
  const dismissResult = DISMISS_RESULT[buttonsKind]

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onResolve(dismissResult)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [dismissResult, onResolve])

  return (
    <DialogFrame
      title={options.title}
      width={320}
      onRequestClose={() => onResolve(dismissResult)}
      footer={buttons.map((button, index) => (
        <Button
          key={button.result}
          tone="default"
          autoFocus={index === 0}
          onClick={() => onResolve(button.result)}
        >
          {button.label}
        </Button>
      ))}
    >
      <div className="flex items-start gap-3">
        <PixelIcon
          name={MSG_ICON[options.icon ?? "info"]}
          size={32}
          className="shrink-0"
        />
        <p className="whitespace-pre-line">{options.message}</p>
      </div>
    </DialogFrame>
  )
}

interface FileDialogProps {
  mode: "open" | "save"
  options: OpenFileOptions | SaveFileOptions
  onResolve: (result: FsPath | null) => void
}

const UP_ENTRY_NAME = ".."

// Windows-reserved filename characters — a name containing one of these
// would otherwise slip through as a path (e.g. "evil/pwn.txt" splits into
// a nonexistent "evil" subdirectory) and blow up fs.ts's writeFile() with
// an uncaught "parent directory does not exist" throw.
const ILLEGAL_NAME_CHARS = /[\\/:*?"<>|]/
const ILLEGAL_NAME_MESSAGE = '檔案名稱不能包含下列任何字元:\n\\ / : * ? " < > |'

function FileDialog({ mode, options, onResolve }: FileDialogProps) {
  const [dir, setDir] = React.useState<FsPath>(
    options.startDir ?? "C:/My Documents"
  )
  const [name, setName] = React.useState(
    mode === "save" ? ((options as SaveFileOptions).defaultName ?? "") : ""
  )
  const [selected, setSelected] = React.useState<string | null>(null)
  const [nameError, setNameError] = React.useState<string | null>(null)

  const extensions =
    mode === "open" ? (options as OpenFileOptions).extensions : undefined

  const entries = vfs.list(dir).filter((entry) => {
    if (entry.name.startsWith(".")) return false
    if (entry.node.type === "dir") return true
    if (!extensions || extensions.length === 0) return true
    return extensions.some((ext) =>
      entry.name.toLowerCase().endsWith(ext.toLowerCase())
    )
  })

  const canGoUp = dir !== "C:"

  const resolveTarget = (): FsPath | null => {
    const trimmed = name.trim()
    if (!trimmed) return null
    if (mode === "open") {
      const target = joinPath(dir, trimmed)
      const node = vfs.stat(target)
      return node && node.type === "file" ? target : null
    }
    const extension = (options as SaveFileOptions).extension
    const hasExtension =
      !extension || trimmed.toLowerCase().endsWith(extension.toLowerCase())
    return joinPath(dir, hasExtension ? trimmed : `${trimmed}${extension}`)
  }

  const target = resolveTarget()

  const confirm = () => {
    if (mode === "save" && ILLEGAL_NAME_CHARS.test(name.trim())) {
      setNameError(ILLEGAL_NAME_MESSAGE)
      return
    }
    if (target) onResolve(target)
  }

  const handleActivate = (entryName: string, node: FsNode) => {
    if (entryName === UP_ENTRY_NAME) {
      setDir(dirnamePath(dir) || "C:")
      setSelected(null)
      return
    }
    if (node.type === "dir") {
      setDir(joinPath(dir, entryName))
      setSelected(null)
      return
    }
    setName(entryName)
    setSelected(entryName)
    if (mode === "open") onResolve(joinPath(dir, entryName))
  }

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      // Escape dismisses the illegal-name error first, not the whole
      // dialog — the file dialog itself must stay open (see confirm()).
      if (nameError) {
        setNameError(null)
        return
      }
      onResolve(null)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [nameError, onResolve])

  const rows = canGoUp
    ? [
        {
          name: UP_ENTRY_NAME,
          node: { type: "dir", mtime: 0 } as FsNode,
        },
        ...entries,
      ]
    : entries

  const dialog = (
    <DialogFrame
      title={mode === "open" ? "開啟舊檔" : "另存新檔"}
      width={360}
      onRequestClose={() => onResolve(null)}
      footer={
        <>
          <Button tone="default" disabled={!target} onClick={confirm}>
            {mode === "open" ? "開啟" : "儲存"}
          </Button>
          <Button onClick={() => onResolve(null)}>取消</Button>
        </>
      }
    >
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0">查詢:</span>
        <div className="bevel-sunken flex-1 truncate bg-white px-1 py-[3px]">
          {dir.replace(/\//g, "\\")}
        </div>
      </div>
      <div className="bevel-sunken h-40 overflow-auto bg-white">
        {rows.length === 0 ? (
          <p className="px-2 py-1 text-button-shadow">(空的)</p>
        ) : (
          <ul className="m-0 list-none p-0.5">
            {rows.map(({ name: entryName, node }) => (
              <li key={entryName}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 px-1 py-0.5 text-left",
                    selected === entryName &&
                      "bg-selection text-selection-foreground"
                  )}
                  onClick={() => {
                    setSelected(entryName)
                    if (node.type === "file") setName(entryName)
                  }}
                  onDoubleClick={() => handleActivate(entryName, node)}
                >
                  <PixelIcon
                    name={node.type === "dir" ? "folder" : "notepad-file"}
                    size={16}
                  />
                  <span className="truncate">{entryName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <label className="flex items-center gap-2">
        <span className="w-14 shrink-0">檔案名稱:</span>
        <Input
          autoFocus
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setSelected(null)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && target) confirm()
          }}
        />
      </label>
    </DialogFrame>
  )

  return (
    <>
      {dialog}
      {nameError && (
        <div className="fixed inset-0 z-[3100] flex items-center justify-center bg-black/20">
          <MessageBoxDialog
            options={{
              title: mode === "open" ? "開啟舊檔" : "另存新檔",
              message: nameError,
              icon: "error",
            }}
            onResolve={() => setNameError(null)}
          />
        </div>
      )}
    </>
  )
}

/** Renders the one active system dialog on top of everything, behind a
 * click-swallowing (but non-dismissing) mask. */
export function SystemDialogHost({
  request,
  onSettle,
}: {
  request: DialogRequest
  onSettle: () => void
}) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40">
      {request.kind === "msg" && (
        <MessageBoxDialog
          options={request.options}
          onResolve={(result) => {
            request.resolve(result)
            onSettle()
          }}
        />
      )}
      {(request.kind === "open" || request.kind === "save") && (
        <FileDialog
          mode={request.kind}
          options={request.options}
          onResolve={(result) => {
            request.resolve(result)
            onSettle()
          }}
        />
      )}
    </div>
  )
}
