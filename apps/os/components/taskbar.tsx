"use client"

import * as React from "react"

import { PixelIcon } from "@/components/pixel-icon"
import {
  ContextMenu,
  clampContextMenuPosition,
  type ContextMenuEntry,
  type ContextMenuState,
} from "@/components/ui/context-menu"
import { useProcessTable } from "@/lib/os/kernel/process-table"
import { useWindowManager, type OsWindow } from "@/lib/os/kernel/window-manager"
import { cn } from "@/lib/utils"
import { TASKBAR_HEIGHT } from "@/lib/constants"

function Clock() {
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    // Hydration-safe clock: SSR renders the "--:--" placeholder, then the
    // client fills in the real time post-mount so server/client markup
    // matches on the first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const label = now
    ? now.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })
    : "--:--"

  return (
    <div className="bevel-status-field flex h-6 items-center px-2 text-win98-text">
      {label}
    </div>
  )
}

export function Taskbar({
  startOpen,
  onToggleStart,
}: {
  startOpen: boolean
  onToggleStart: () => void
}) {
  const { windows, activeId, focusWindow, minimizeWindow, toggleMaximize } =
    useWindowManager()
  const { requestClose } = useProcessTable()
  const [windowMenu, setWindowMenu] = React.useState<ContextMenuState | null>(
    null
  )

  const openWindowMenu = (event: React.MouseEvent, win: OsWindow) => {
    event.preventDefault()
    const position = clampContextMenuPosition(event.clientX, event.clientY)
    const canMaximize = win.controls.includes("maximize")
    const items: ContextMenuEntry[] = [
      {
        label: "還原",
        disabled: !win.minimized && !win.maximized,
        onSelect: () => {
          focusWindow(win.pid)
          if (!win.minimized && win.maximized) toggleMaximize(win.pid)
        },
      },
      {
        label: "最小化",
        disabled: win.minimized,
        onSelect: () => minimizeWindow(win.pid),
      },
      {
        label: "最大化",
        disabled: !canMaximize || win.maximized,
        onSelect: () => {
          focusWindow(win.pid)
          toggleMaximize(win.pid)
        },
      },
      { separator: true },
      {
        label: "關閉",
        disabled: !win.controls.includes("close"),
        // Same flow as the title bar's X — respects onBeforeClose (e.g.
        // Notepad's dirty-save prompt), never a bare kill().
        onSelect: () => void requestClose(win.pid),
      },
    ]
    setWindowMenu({ ...position, entries: items })
  }

  return (
    <div
      data-testid="taskbar"
      className="bevel-raised absolute inset-x-0 bottom-0 flex items-center gap-1 bg-surface px-1"
      style={{ height: TASKBAR_HEIGHT, zIndex: 1000 }}
    >
      <button
        type="button"
        className={cn(
          "win98-focusable flex h-6 items-center gap-1 px-2 font-bold text-win98-text",
          startOpen ? "bevel-pressed" : "bevel-raised"
        )}
        onClick={onToggleStart}
      >
        <PixelIcon name="start" size={16} />
        開始
      </button>

      <div className="h-6 w-px bg-button-shadow" />

      <div className="flex flex-1 items-center gap-1 overflow-hidden">
        {windows.map((win) => {
          const isActive = win.pid === activeId && !win.minimized
          return (
            <button
              key={win.pid}
              type="button"
              className={cn(
                "win98-focusable flex h-6 max-w-40 min-w-24 items-center gap-1 px-2 text-win98-text",
                isActive ? "bevel-pressed" : "bevel-raised"
              )}
              onClick={() => {
                if (isActive) {
                  minimizeWindow(win.pid)
                } else {
                  focusWindow(win.pid)
                }
              }}
              onContextMenu={(event) => openWindowMenu(event, win)}
            >
              <PixelIcon name={win.icon} size={16} className="shrink-0" />
              <span className="truncate">{win.title}</span>
            </button>
          )
        })}
      </div>

      <Clock />
      <ContextMenu state={windowMenu} onClose={() => setWindowMenu(null)} />
    </div>
  )
}
