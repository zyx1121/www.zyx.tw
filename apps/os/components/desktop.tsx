"use client"

import * as React from "react"

import { DesktopIcon } from "@/components/desktop-icon"
import { StartMenu } from "@/components/start-menu"
import { Taskbar } from "@/components/taskbar"
import { Window } from "@/components/ui/window"
import { APPS, DESKTOP_ICON_ORDER } from "@/components/apps/registry"
import {
  ProcessTableProvider,
  useProcessTable,
} from "@/lib/os/kernel/process-table"
import {
  useWindowManager,
  WindowManagerProvider,
} from "@/lib/os/kernel/window-manager"
import { AppHost } from "@/lib/os/sdk/app-host"

function DesktopSurface() {
  const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null)
  const [startOpen, setStartOpen] = React.useState(false)
  const taskbarScopeRef = React.useRef<HTMLDivElement>(null)

  const {
    windows,
    activeId,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    moveWindow,
    resizeWindow,
  } = useWindowManager()
  const { spawn, requestClose } = useProcessTable()

  React.useEffect(() => {
    if (!startOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!taskbarScopeRef.current?.contains(event.target as Node)) {
        setStartOpen(false)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [startOpen])

  const handleOpenApp = (id: string) => {
    spawn(id)
    setStartOpen(false)
  }

  return (
    <div
      className="relative h-dvh w-dvw overflow-hidden bg-desktop"
      onClick={() => setSelectedIcon(null)}
    >
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {DESKTOP_ICON_ORDER.map((id) => {
          const app = APPS[id]
          if (!app) return null
          return (
            <DesktopIcon
              key={id}
              label={app.name}
              icon={app.icon}
              selected={selectedIcon === id}
              onSelect={() => setSelectedIcon(id)}
              onOpen={() => handleOpenApp(id)}
            />
          )
        })}
      </div>

      {windows.map((win) => {
        const app = APPS[win.appId]
        if (win.minimized || !app) return null
        return (
          <Window
            key={win.pid}
            title={win.title}
            icon={win.icon}
            active={win.pid === activeId}
            maximized={win.maximized}
            x={win.x}
            y={win.y}
            width={win.width}
            height={win.height}
            minWidth={win.minWidth}
            minHeight={win.minHeight}
            resizable={win.resizable}
            zIndex={win.zIndex}
            controls={win.controls}
            onFocus={() => focusWindow(win.pid)}
            onClose={() => {
              void requestClose(win.pid)
            }}
            onMinimize={() => minimizeWindow(win.pid)}
            onToggleMaximize={() => toggleMaximize(win.pid)}
            onMove={(x, y) => moveWindow(win.pid, x, y)}
            onResize={(rect) => resizeWindow(win.pid, rect)}
          >
            <AppHost pid={win.pid}>
              <app.Component pid={win.pid} />
            </AppHost>
          </Window>
        )
      })}

      <div ref={taskbarScopeRef}>
        {startOpen && <StartMenu onOpenApp={handleOpenApp} />}
        <Taskbar
          startOpen={startOpen}
          onToggleStart={() => setStartOpen((open) => !open)}
        />
      </div>
    </div>
  )
}

export function Desktop() {
  return (
    <WindowManagerProvider>
      <ProcessTableProvider>
        <DesktopSurface />
      </ProcessTableProvider>
    </WindowManagerProvider>
  )
}
