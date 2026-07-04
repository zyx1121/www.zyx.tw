"use client"

import * as React from "react"

import { DesktopIcon } from "@/components/desktop-icon"
import { StartMenu } from "@/components/start-menu"
import { Taskbar } from "@/components/taskbar"
import { Window } from "@/components/ui/window"
import { APPS, DESKTOP_ICON_ORDER } from "@/components/apps/registry"
import {
  useWindowManager,
  WindowManagerProvider,
} from "@/components/window-manager"
import type { AppId } from "@/lib/types"

function DesktopSurface() {
  const [selectedIcon, setSelectedIcon] = React.useState<AppId | null>(null)
  const [startOpen, setStartOpen] = React.useState(false)
  const taskbarScopeRef = React.useRef<HTMLDivElement>(null)

  const {
    windows,
    activeId,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    moveWindow,
  } = useWindowManager()

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

  const handleOpenApp = (id: AppId) => {
    const app = APPS[id]
    openWindow({
      id: app.id,
      title: app.title,
      icon: app.icon,
      width: app.width,
      height: app.height,
      controls: app.controls,
    })
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
          return (
            <DesktopIcon
              key={id}
              label={app.title}
              icon={app.icon}
              selected={selectedIcon === id}
              onSelect={() => setSelectedIcon(id)}
              onOpen={() => handleOpenApp(id)}
            />
          )
        })}
      </div>

      {windows.map((win) => {
        const app = APPS[win.id]
        if (win.minimized) return null
        return (
          <Window
            key={win.id}
            title={win.title}
            icon={win.icon}
            active={win.id === activeId}
            maximized={win.maximized}
            x={win.x}
            y={win.y}
            width={win.width}
            height={win.height}
            zIndex={win.zIndex}
            controls={win.controls}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onToggleMaximize={() => toggleMaximize(win.id)}
            onMove={(x, y) => moveWindow(win.id, x, y)}
          >
            <app.Component onClose={() => closeWindow(win.id)} />
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
      <DesktopSurface />
    </WindowManagerProvider>
  )
}
