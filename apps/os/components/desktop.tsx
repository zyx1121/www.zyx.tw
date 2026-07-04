"use client"

import * as React from "react"

import { DesktopIcon } from "@/components/desktop-icon"
import { StartMenu } from "@/components/start-menu"
import { Taskbar } from "@/components/taskbar"
import { Window } from "@/components/ui/window"
import { APPS } from "@/components/apps/registry"
import { DESKTOP_DIR, vfs, type Vfs } from "@/lib/os/kernel/fs"
import { hydrateFs } from "@/lib/os/kernel/idb"
import { DialogProvider } from "@/lib/os/kernel/dialog-manager"
import {
  ProcessTableProvider,
  useProcessTable,
} from "@/lib/os/kernel/process-table"
import {
  useWindowManager,
  WindowManagerProvider,
} from "@/lib/os/kernel/window-manager"
import { AppHost } from "@/lib/os/sdk/app-host"
import { useDialogs } from "@/lib/os/sdk/use-dialogs"
import { useFsList } from "@/lib/os/sdk/use-fs"
import {
  iconForEntry,
  labelForEntry,
  resolveOpenTarget,
} from "@/lib/os/sdk/open-target"

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
  const { msgBox } = useDialogs()
  const desktopEntries = useFsList(DESKTOP_DIR).filter(
    (entry) => !entry.name.startsWith(".")
  )

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

  const handleOpenDesktopEntry = async (name: string) => {
    const path = `${DESKTOP_DIR}/${name}`
    const target = resolveOpenTarget(vfs, APPS, path)
    if (target.kind === "spawn") {
      spawn(target.appId, target.args)
      return
    }
    await msgBox({
      title: "桌面",
      message: `無法開啟「${labelForEntry(name)}」。`,
      icon: "error",
    })
  }

  return (
    <div
      className="relative h-dvh w-dvw overflow-hidden bg-desktop"
      onClick={() => setSelectedIcon(null)}
    >
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {desktopEntries.map(({ name, node }) => (
          <DesktopIcon
            key={name}
            label={labelForEntry(name)}
            icon={iconForEntry(name, node, APPS)}
            selected={selectedIcon === name}
            onSelect={() => setSelectedIcon(name)}
            onOpen={() => void handleOpenDesktopEntry(name)}
          />
        ))}
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
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    void hydrateFs().then(() => {
      if (cancelled) return
      if (process.env.NODE_ENV !== "production") {
        // Test-only hook for the Playwright verification harness; the
        // NODE_ENV check above is dead-code-eliminated out of prod builds.
        ;(window as unknown as { __osfs?: Vfs }).__osfs = vfs
      }
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Boot gate: hydrate 完成前桌面顯示純 teal (M4 換成真開機畫面).
  if (!ready) {
    return <div className="h-dvh w-dvw bg-desktop" />
  }

  return (
    <WindowManagerProvider>
      <ProcessTableProvider>
        <DialogProvider>
          <DesktopSurface />
        </DialogProvider>
      </ProcessTableProvider>
    </WindowManagerProvider>
  )
}
