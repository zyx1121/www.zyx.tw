"use client"

import * as React from "react"

import type { IconName } from "@/components/pixel-icon"
import type { AppId, WindowControl } from "@/lib/types"

export interface OsWindow {
  id: AppId
  title: string
  icon: IconName
  controls: WindowControl[]
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  minimized: boolean
  maximized: boolean
  prevRect: { x: number; y: number; width: number; height: number } | null
}

export interface OpenWindowSpec {
  id: AppId
  title: string
  icon: IconName
  width: number
  height: number
  controls?: WindowControl[]
}

interface WindowManagerState {
  windows: OsWindow[]
  nextZ: number
  openedCount: number
}

type Action =
  | { type: "OPEN"; spec: OpenWindowSpec }
  | { type: "CLOSE"; id: AppId }
  | { type: "FOCUS"; id: AppId }
  | { type: "MINIMIZE"; id: AppId }
  | { type: "TOGGLE_MAXIMIZE"; id: AppId }
  | { type: "MOVE"; id: AppId; x: number; y: number }

const CASCADE_OFFSET = 24
const CASCADE_ORIGIN = { x: 80, y: 48 }

function topmostActiveId(windows: OsWindow[]): AppId | null {
  const visible = windows.filter((w) => !w.minimized)
  if (visible.length === 0) return null
  return visible.reduce((top, w) => (w.zIndex > top.zIndex ? w : top)).id
}

function reducer(
  state: WindowManagerState,
  action: Action
): WindowManagerState {
  switch (action.type) {
    case "OPEN": {
      const existing = state.windows.find((w) => w.id === action.spec.id)
      if (existing) {
        return reducer(state, { type: "FOCUS", id: action.spec.id })
      }
      const cascade = state.openedCount % 6
      const win: OsWindow = {
        id: action.spec.id,
        title: action.spec.title,
        icon: action.spec.icon,
        controls: action.spec.controls ?? ["minimize", "maximize", "close"],
        x: CASCADE_ORIGIN.x + cascade * CASCADE_OFFSET,
        y: CASCADE_ORIGIN.y + cascade * CASCADE_OFFSET,
        width: action.spec.width,
        height: action.spec.height,
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
        windows: state.windows.filter((w) => w.id !== action.id),
      }
    }
    case "FOCUS": {
      const nextZ = state.nextZ + 1
      return {
        ...state,
        nextZ,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, zIndex: nextZ, minimized: false } : w
        ),
      }
    }
    case "MINIMIZE": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: true } : w
        ),
      }
    }
    case "TOGGLE_MAXIMIZE": {
      return {
        ...state,
        windows: state.windows.map((w) => {
          if (w.id !== action.id) return w
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
          w.id === action.id && !w.maximized
            ? { ...w, x: action.x, y: action.y }
            : w
        ),
      }
    }
    default:
      return state
  }
}

interface WindowManagerContextValue {
  windows: OsWindow[]
  activeId: AppId | null
  openWindow: (spec: OpenWindowSpec) => void
  closeWindow: (id: AppId) => void
  focusWindow: (id: AppId) => void
  minimizeWindow: (id: AppId) => void
  toggleMaximize: (id: AppId) => void
  moveWindow: (id: AppId, x: number, y: number) => void
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
      closeWindow: (id) => dispatch({ type: "CLOSE", id }),
      focusWindow: (id) => dispatch({ type: "FOCUS", id }),
      minimizeWindow: (id) => dispatch({ type: "MINIMIZE", id }),
      toggleMaximize: (id) => dispatch({ type: "TOGGLE_MAXIMIZE", id }),
      moveWindow: (id, x, y) => dispatch({ type: "MOVE", id, x, y }),
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
