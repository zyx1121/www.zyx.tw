"use client"

import * as React from "react"

import { SystemDialogHost } from "@/components/system-dialogs"
import type { FsPath } from "@/lib/os/kernel/fs"

export type MsgBoxIcon = "info" | "warning" | "error" | "question"
export type MsgBoxButtons = "ok" | "okcancel" | "yesno" | "yesnocancel"
export type MsgBoxResult = "ok" | "cancel" | "yes" | "no"

export interface MsgBoxOptions {
  title: string
  message: string
  icon?: MsgBoxIcon
  buttons?: MsgBoxButtons
}

export interface OpenFileOptions {
  startDir?: FsPath
  extensions?: string[]
}

export interface SaveFileOptions {
  startDir?: FsPath
  defaultName?: string
  extension?: string
}

export interface DialogManagerContextValue {
  msgBox(options: MsgBoxOptions): Promise<MsgBoxResult>
  openFile(options?: OpenFileOptions): Promise<FsPath | null>
  saveFile(options?: SaveFileOptions): Promise<FsPath | null>
}

export type DialogRequest =
  | {
      id: number
      kind: "msg"
      options: MsgBoxOptions
      resolve: (result: MsgBoxResult) => void
    }
  | {
      id: number
      kind: "open"
      options: OpenFileOptions
      resolve: (result: FsPath | null) => void
    }
  | {
      id: number
      kind: "save"
      options: SaveFileOptions
      resolve: (result: FsPath | null) => void
    }

const DialogManagerContext =
  React.createContext<DialogManagerContextValue | null>(null)

/** System-modal dialog host: msgBox / openFile / saveFile all resolve to a
 * single queue so only one Win98 dialog renders at a time, on top of every
 * window. Mounted once, high in the tree (see components/desktop.tsx). */
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = React.useState<DialogRequest[]>([])
  const nextIdRef = React.useRef(0)

  const dismiss = React.useCallback((id: number) => {
    setQueue((q) => q.filter((request) => request.id !== id))
  }, [])

  const value = React.useMemo<DialogManagerContextValue>(
    () => ({
      msgBox: (options) =>
        new Promise<MsgBoxResult>((resolve) => {
          const id = nextIdRef.current++
          setQueue((q) => [...q, { id, kind: "msg", options, resolve }])
        }),
      openFile: (options = {}) =>
        new Promise<FsPath | null>((resolve) => {
          const id = nextIdRef.current++
          setQueue((q) => [...q, { id, kind: "open", options, resolve }])
        }),
      saveFile: (options = {}) =>
        new Promise<FsPath | null>((resolve) => {
          const id = nextIdRef.current++
          setQueue((q) => [...q, { id, kind: "save", options, resolve }])
        }),
    }),
    []
  )

  const active = queue[0] ?? null

  return (
    <DialogManagerContext.Provider value={value}>
      {children}
      {active && (
        <SystemDialogHost
          request={active}
          onSettle={() => dismiss(active.id)}
        />
      )}
    </DialogManagerContext.Provider>
  )
}

export function useDialogManager(): DialogManagerContextValue {
  const ctx = React.useContext(DialogManagerContext)
  if (!ctx) {
    throw new Error("useDialogManager must be used within a DialogProvider")
  }
  return ctx
}
