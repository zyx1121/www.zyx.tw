"use client"

import * as React from "react"

import { FolderView, type FolderViewActivation } from "@/components/folder-view"
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
import { labelForEntry, resolveOpenTarget } from "@/lib/os/sdk/open-target"

function DesktopSurface() {
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

  const handleActivateDesktopEntry = async ({
    name,
    path,
    node,
  }: FolderViewActivation) => {
    // A folder created on the desktop (via the new right-click menu) has
    // no navigation concept of its own here — hand it to explorer.
    if (node.type === "dir") {
      spawn("explorer", { path })
      return
    }
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
    <div className="relative h-dvh w-dvw overflow-hidden bg-desktop">
      <FolderView
        dir={DESKTOP_DIR}
        mode="icon"
        onActivate={(entry) => void handleActivateDesktopEntry(entry)}
      />

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
