"use client"

import * as React from "react"

import { BootScreen } from "@/components/boot-screen"
import { FolderView, type FolderViewActivation } from "@/components/folder-view"
import { ShutdownScreen } from "@/components/shutdown-screen"
import { StartMenu } from "@/components/start-menu"
import { Taskbar } from "@/components/taskbar"
import { Window } from "@/components/ui/window"
import { APPS } from "@/components/apps/registry"
import { MIN_BOOT_DURATION_MS } from "@/lib/constants"
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

// Desktop icons users can't drag-rearrange (v1 has no manual grid position)
// but which still need to sit ahead of the alphabetical fs.list() order —
// see FolderView's pinFirst prop.
const DESKTOP_PIN_FIRST = ["我的電腦.lnk"]

function DesktopSurface() {
  const [startOpen, setStartOpen] = React.useState(false)
  const [shutdown, setShutdown] = React.useState(false)
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

  // Alt+F4 closes the active window through the same requestClose() flow
  // as the title bar's X (onBeforeClose still gets a say — e.g. Notepad's
  // dirty-save prompt). Browsers reserve Alt+F4 to close the browser
  // window itself; preventDefault() is best-effort and can't override
  // that at the OS/browser-chrome level — see docs/DESIGN.md.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.key !== "F4") return
      event.preventDefault()
      if (activeId !== null) void requestClose(activeId)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeId, requestClose])

  const handleOpenApp = (id: string) => {
    spawn(id)
    setStartOpen(false)
  }

  const handleShutdownRequest = async () => {
    setStartOpen(false)
    const choice = await msgBox({
      title: "關機 Windows",
      message: "您要將電腦關機嗎?",
      icon: "question",
      buttons: "okcancel",
    })
    if (choice !== "ok") return

    // Real Windows asks every open window before it actually powers off —
    // top-to-bottom by z-order, same as Alt+F4/the title bar X going
    // through onBeforeClose (e.g. Notepad's unsaved-changes prompt). Any
    // window that says "no" aborts the rest of the sequence: whatever's
    // already closed stays closed, whatever's left stays open — it does
    // not silently discard that window's unsaved work.
    const closeOrder = [...windows].sort((a, b) => b.zIndex - a.zIndex)
    for (const win of closeOrder) {
      const closed = await requestClose(win.pid)
      if (!closed) return
    }

    setShutdown(true)
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

  if (shutdown) {
    return <ShutdownScreen />
  }

  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-desktop">
      <FolderView
        dir={DESKTOP_DIR}
        mode="icon"
        pinFirst={DESKTOP_PIN_FIRST}
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
        {startOpen && (
          <StartMenu
            onOpenApp={handleOpenApp}
            onShutdown={() => void handleShutdownRequest()}
          />
        )}
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
    let minDurationTimer: ReturnType<typeof setTimeout> | null = null
    const bootStartedAt = Date.now()

    void hydrateFs().then(() => {
      if (cancelled) return
      if (process.env.NODE_ENV !== "production") {
        // Test-only hook for the Playwright verification harness; the
        // NODE_ENV check above is dead-code-eliminated out of prod builds.
        ;(window as unknown as { __osfs?: Vfs }).__osfs = vfs
      }
      // Boot screen floor (M4): a warm IndexedDB read can resolve in a few
      // milliseconds, which would flash the boot screen instead of reading
      // as an intentional boot sequence — hold it for MIN_BOOT_DURATION_MS
      // regardless of how fast hydrate actually was.
      const remaining = MIN_BOOT_DURATION_MS - (Date.now() - bootStartedAt)
      if (remaining <= 0) {
        setReady(true)
      } else {
        minDurationTimer = setTimeout(() => {
          if (!cancelled) setReady(true)
        }, remaining)
      }
    })
    return () => {
      cancelled = true
      if (minDurationTimer) clearTimeout(minDurationTimer)
    }
  }, [])

  // Boot gate: Win98 boot screen until hydrate settles + the min duration
  // floor above both clear (M4 — replaces the plain teal placeholder).
  if (!ready) {
    return <BootScreen />
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
