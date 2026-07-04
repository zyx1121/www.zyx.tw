"use client"

import * as React from "react"

import { FolderView, type FolderViewActivation } from "@/components/folder-view"
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
  basenamePath,
  dirnamePath,
  ILLEGAL_NAME_CHARS,
  ILLEGAL_NAME_MESSAGE,
  joinPath,
  vfs,
  type FsEntry,
  type FsPath,
} from "@/lib/os/kernel/fs"

/** Win98 chrome for system-modal dialogs — same bevel formulas as
 * components/ui/window.tsx, but centered/static (no drag, no resize). */
function DialogFrame({
  title,
  width,
  onRequestClose,
  footer,
  children,
  containerRef,
}: {
  title: string
  width: number
  onRequestClose: () => void
  footer: React.ReactNode
  children: React.ReactNode
  containerRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={containerRef}
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
  const dialogRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onResolve(dismissResult)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [dismissResult, onResolve])

  React.useEffect(() => {
    // Not a plain `autoFocus`: if this msgBox was itself opened in
    // response to an Enter keypress (e.g. explorer's address bar
    // rejecting an invalid path), that same physical key's keyup can
    // still be in flight — landing on a synchronously-focused default
    // button re-triggers it as a click, and the dialog self-dismisses
    // before anyone (human or Playwright) ever sees it. Two rAFs push
    // the focus call past the paint that keyup is racing against.
    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        dialogRef.current
          ?.querySelector<HTMLButtonElement>('[data-default-button="true"]')
          ?.focus()
      })
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [])

  return (
    <DialogFrame
      containerRef={dialogRef}
      title={options.title}
      width={320}
      onRequestClose={() => onResolve(dismissResult)}
      footer={buttons.map((button, index) => (
        <Button
          key={button.result}
          tone="default"
          data-default-button={index === 0 ? "true" : undefined}
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

function FileDialog({ mode, options, onResolve }: FileDialogProps) {
  const [dir, setDir] = React.useState<FsPath>(
    options.startDir ?? "C:/My Documents"
  )
  const [name, setName] = React.useState(
    mode === "save" ? ((options as SaveFileOptions).defaultName ?? "") : ""
  )
  const [nameError, setNameError] = React.useState<string | null>(null)

  const extensions =
    mode === "open" ? (options as OpenFileOptions).extensions : undefined

  const matchesExtension = React.useCallback(
    (entry: FsEntry) => {
      if (!extensions || extensions.length === 0) return true
      return extensions.some((ext) =>
        entry.name.toLowerCase().endsWith(ext.toLowerCase())
      )
    },
    [extensions]
  )

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

  const handleActivate = ({ path, node }: FolderViewActivation) => {
    if (node.type === "dir") {
      setDir(path)
      return
    }
    setName(basenamePath(path))
    if (mode === "open") onResolve(path)
  }

  const handleSelectionChange = (info: FolderViewActivation | null) => {
    // A directory single-click only navigates-on-activate — it must not
    // clobber whatever filename the user already typed/selected.
    if (info && info.node.type === "file") setName(info.name)
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
        <Button
          onClick={() => setDir(dirnamePath(dir) || "C:")}
          disabled={!canGoUp}
          className="min-w-0 shrink-0 px-2"
        >
          上一層
        </Button>
        <div className="bevel-sunken flex-1 truncate bg-white px-1 py-[3px]">
          {dir.replace(/\//g, "\\")}
        </div>
      </div>
      <FolderView
        dir={dir}
        mode="list"
        readOnly
        filter={matchesExtension}
        onActivate={handleActivate}
        onSelectionChange={handleSelectionChange}
        emptyMessage="(空的)"
        className="h-40"
      />
      <label className="flex items-center gap-2">
        <span className="w-14 shrink-0">檔案名稱:</span>
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
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
        <div className="fixed inset-0 z-[3100] flex items-center justify-center">
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
 * click-swallowing (but *not* dimming — real Win98 modals never darken
 * the desktop behind them) transparent mask. */
export function SystemDialogHost({
  request,
  onSettle,
}: {
  request: DialogRequest
  onSettle: () => void
}) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center">
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
