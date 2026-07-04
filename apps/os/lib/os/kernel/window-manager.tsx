"use client"

import * as React from "react"

import type { IconName } from "@/components/pixel-icon"
import { TASKBAR_HEIGHT } from "@/lib/constants"
import type { Pid, WindowControl } from "@/lib/os/types"

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface OsWindow {
  pid: Pid
  appId: string
  title: string
  icon: IconName
  controls: WindowControl[]
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  resizable: boolean
  zIndex: number
  minimized: boolean
  maximized: boolean
  prevRect: Rect | null
}

export interface OpenWindowSpec {
  pid: Pid
  appId: string
  title: string
  icon: IconName
  width: number
  height: number
  minWidth: number
  minHeight: number
  resizable: boolean
  controls: WindowControl[]
}

interface WindowManagerState {
  windows: OsWindow[]
  nextZ: number
  openedCount: number
}

type Action =
  | { type: "OPEN"; spec: OpenWindowSpec }
  | { type: "CLOSE"; pid: Pid }
  | { type: "FOCUS"; pid: Pid }
  | { type: "MINIMIZE"; pid: Pid }
  | { type: "TOGGLE_MAXIMIZE"; pid: Pid }
  | { type: "MOVE"; pid: Pid; x: number; y: number }
  | { type: "RESIZE"; pid: Pid; rect: Rect }
  | { type: "SET_TITLE"; pid: Pid; title: string }

const CASCADE_OFFSET = 24
const CASCADE_ORIGIN = { x: 80, y: 48 }

function topmostActiveId(windows: OsWindow[]): Pid | null {
  const visible = windows.filter((w) => !w.minimized)
  if (visible.length === 0) return null
  return visible.reduce((top, w) => (w.zIndex > top.zIndex ? w : top)).pid
}

function viewportSize() {
  if (typeof window === "undefined") {
    return { width: Number.POSITIVE_INFINITY, height: Number.POSITIVE_INFINITY }
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight - TASKBAR_HEIGHT,
  }
}

function reducer(
  state: WindowManagerState,
  action: Action
): WindowManagerState {
  switch (action.type) {
    case "OPEN": {
      const cascade = state.openedCount % 6
      const win: OsWindow = {
        pid: action.spec.pid,
        appId: action.spec.appId,
        title: action.spec.title,
        icon: action.spec.icon,
        controls: action.spec.controls,
        x: CASCADE_ORIGIN.x + cascade * CASCADE_OFFSET,
        y: CASCADE_ORIGIN.y + cascade * CASCADE_OFFSET,
        width: action.spec.width,
        height: action.spec.height,
        minWidth: action.spec.minWidth,
        minHeight: action.spec.minHeight,
        resizable: action.spec.resizable,
        zIndex: state.nextZ,
        minimized: false,
        maximized: false,
        prevRect: null,
      }
      return {
        windows: [...state.windows, win],
        nextZ: state.nextZ + 1,
        openedCount: state.openedCount + 1,
      }
    }
    case "CLOSE": {
      return {
        ...state,
        windows: state.windows.filter((w) => w.pid !== action.pid),
      }
    }
    case "FOCUS": {
      const nextZ = state.nextZ + 1
      return {
        ...state,
        nextZ,
        windows: state.windows.map((w) =>
          w.pid === action.pid ? { ...w, zIndex: nextZ, minimized: false } : w
        ),
      }
    }
    case "MINIMIZE": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid ? { ...w, minimized: true } : w
        ),
      }
    }
    case "TOGGLE_MAXIMIZE": {
      return {
        ...state,
        windows: state.windows.map((w) => {
          if (w.pid !== action.pid) return w
          if (w.maximized) {
            const rect = w.prevRect ?? {
              x: w.x,
              y: w.y,
              width: w.width,
              height: w.height,
            }
            return { ...w, maximized: false, ...rect, prevRect: null }
          }
          return {
            ...w,
            maximized: true,
            prevRect: { x: w.x, y: w.y, width: w.width, height: w.height },
          }
        }),
      }
    }
    case "MOVE": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid && !w.maximized
            ? { ...w, x: action.x, y: action.y }
            : w
        ),
      }
    }
    case "RESIZE": {
      const { width: viewportWidth, height: viewportHeight } = viewportSize()
      return {
        ...state,
        windows: state.windows.map((w) => {
          if (w.pid !== action.pid || w.maximized || !w.resizable) return w
          const width = Math.min(
            Math.max(action.rect.width, w.minWidth),
            viewportWidth
          )
          const height = Math.min(
            Math.max(action.rect.height, w.minHeight),
            viewportHeight
          )
          const x = Math.min(
            Math.max(action.rect.x, 0),
            Math.max(viewportWidth - width, 0)
          )
          const y = Math.min(
            Math.max(action.rect.y, 0),
            Math.max(viewportHeight - height, 0)
          )
          return { ...w, x, y, width, height }
        }),
      }
    }
    case "SET_TITLE": {
      const target = state.windows.find((w) => w.pid === action.pid)
      // Bail out on no-op writes: apps call setTitle from a
      // useEffect keyed on their own dirty-state (e.g. Notepad's "*"
      // prefix), and returning a fresh `windows` array here even when
      // nothing changed would recreate the WindowManager context value,
      // which recreates every SDK closure derived from it, which the
      // effect depends on — an infinite render loop.
      if (!target || target.title === action.title) return state
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.pid === action.pid ? { ...w, title: action.title } : w
        ),
      }
    }
    default:
      return state
  }
}

interface WindowManagerContextValue {
  windows: OsWindow[]
  activeId: Pid | null
  openWindow: (spec: OpenWindowSpec) => void
  closeWindow: (pid: Pid) => void
  focusWindow: (pid: Pid) => void
  minimizeWindow: (pid: Pid) => void
  toggleMaximize: (pid: Pid) => void
  moveWindow: (pid: Pid, x: number, y: number) => void
  resizeWindow: (pid: Pid, rect: Rect) => void
  setTitle: (pid: Pid, title: string) => void
}

const WindowManagerContext =
  React.createContext<WindowManagerContextValue | null>(null)

export function WindowManagerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [state, dispatch] = React.useReducer(reducer, {
    windows: [],
    nextZ: 1,
    openedCount: 0,
  })

  const value = React.useMemo<WindowManagerContextValue>(
    () => ({
      windows: state.windows,
      activeId: topmostActiveId(state.windows),
      openWindow: (spec) => dispatch({ type: "OPEN", spec }),
      closeWindow: (pid) => dispatch({ type: "CLOSE", pid }),
      focusWindow: (pid) => dispatch({ type: "FOCUS", pid }),
      minimizeWindow: (pid) => dispatch({ type: "MINIMIZE", pid }),
      toggleMaximize: (pid) => dispatch({ type: "TOGGLE_MAXIMIZE", pid }),
      moveWindow: (pid, x, y) => dispatch({ type: "MOVE", pid, x, y }),
      resizeWindow: (pid, rect) => dispatch({ type: "RESIZE", pid, rect }),
      setTitle: (pid, title) => dispatch({ type: "SET_TITLE", pid, title }),
    }),
    [state.windows]
  )

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  )
}

export function useWindowManager() {
  const ctx = React.useContext(WindowManagerContext)
  if (!ctx) {
    throw new Error(
      "useWindowManager must be used within a WindowManagerProvider"
    )
  }
  return ctx
}
