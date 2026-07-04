"use client"

import * as React from "react"

import { APPS } from "@/components/apps/registry"
import { DEFAULT_MIN_HEIGHT, DEFAULT_MIN_WIDTH } from "@/lib/constants"
import type { AppArgs, Pid } from "@/lib/os/types"
import { useWindowManager } from "@/lib/os/kernel/window-manager"

export interface OsProcess {
  pid: Pid
  appId: string
  args: AppArgs
  startedAt: number
}

type BeforeClose = () => boolean | Promise<boolean>

interface ProcessTableContextValue {
  processes: OsProcess[]
  spawn: (appId: string, args?: AppArgs) => Pid
  /** Removes the process + its window immediately — does not consult
   * onBeforeClose. Used by kill-from-outside flows (task manager). */
  kill: (pid: Pid) => void
  /** Runs the pid's registered onBeforeClose (if any) and only kills when
   * it resolves true. Used by the window's own close affordances. */
  requestClose: (pid: Pid) => Promise<void>
  registerBeforeClose: (pid: Pid, fn: BeforeClose | null) => void
}

const ProcessTableContext =
  React.createContext<ProcessTableContextValue | null>(null)

export function ProcessTableProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // `processes` state is what the render body/context value exposes.
  // processesRef mirrors it so spawn() can read + decide synchronously
  // (needs to return a Pid immediately) — the ref is only ever touched
  // inside event-handler callbacks below, never during render.
  const [processes, setProcesses] = React.useState<OsProcess[]>([])
  const processesRef = React.useRef<OsProcess[]>([])

  const nextPidRef = React.useRef(1)
  const beforeCloseRef = React.useRef(new Map<Pid, BeforeClose>())

  const { openWindow, closeWindow, focusWindow } = useWindowManager()

  const spawn = React.useCallback<ProcessTableContextValue["spawn"]>(
    (appId, args = {}) => {
      const app = APPS[appId]
      if (!app) {
        throw new Error(`os: unknown appId "${appId}"`)
      }
      if (!app.multiInstance) {
        const existing = processesRef.current.find((p) => p.appId === appId)
        if (existing) {
          focusWindow(existing.pid)
          return existing.pid
        }
      }
      const pid = nextPidRef.current++
      const process: OsProcess = { pid, appId, args, startedAt: Date.now() }
      const next = [...processesRef.current, process]
      processesRef.current = next
      setProcesses(next)
      openWindow({
        pid,
        appId,
        title: app.name,
        icon: app.icon,
        width: app.window.width,
        height: app.window.height,
        minWidth: app.window.minWidth ?? DEFAULT_MIN_WIDTH,
        minHeight: app.window.minHeight ?? DEFAULT_MIN_HEIGHT,
        resizable: app.window.resizable,
        controls: app.window.controls,
      })
      return pid
    },
    [openWindow, focusWindow]
  )

  const kill = React.useCallback<ProcessTableContextValue["kill"]>(
    (pid) => {
      beforeCloseRef.current.delete(pid)
      const next = processesRef.current.filter((p) => p.pid !== pid)
      processesRef.current = next
      setProcesses(next)
      closeWindow(pid)
    },
    [closeWindow]
  )

  const requestClose = React.useCallback<
    ProcessTableContextValue["requestClose"]
  >(
    async (pid) => {
      const before = beforeCloseRef.current.get(pid)
      const ok = before ? await before() : true
      if (ok) kill(pid)
    },
    [kill]
  )

  const registerBeforeClose = React.useCallback<
    ProcessTableContextValue["registerBeforeClose"]
  >((pid, fn) => {
    if (fn) {
      beforeCloseRef.current.set(pid, fn)
    } else {
      beforeCloseRef.current.delete(pid)
    }
  }, [])

  const value = React.useMemo<ProcessTableContextValue>(
    () => ({ processes, spawn, kill, requestClose, registerBeforeClose }),
    [processes, spawn, kill, requestClose, registerBeforeClose]
  )

  return (
    <ProcessTableContext.Provider value={value}>
      {children}
    </ProcessTableContext.Provider>
  )
}

export function useProcessTable() {
  const ctx = React.useContext(ProcessTableContext)
  if (!ctx) {
    throw new Error(
      "useProcessTable must be used within a ProcessTableProvider"
    )
  }
  return ctx
}
