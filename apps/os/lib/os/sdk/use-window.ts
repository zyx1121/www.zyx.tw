"use client"

import { useProcessTable } from "@/lib/os/kernel/process-table"
import { useWindowManager } from "@/lib/os/kernel/window-manager"
import { useAppInstancePid } from "@/lib/os/sdk/app-host"

export interface UseWindowResult {
  title: string
  setTitle: (title: string) => void
  requestClose: () => void
  setOnBeforeClose: (fn: (() => boolean | Promise<boolean>) | null) => void
}

export function useWindow(): UseWindowResult {
  const pid = useAppInstancePid()
  const { windows, setTitle } = useWindowManager()
  const { requestClose, registerBeforeClose } = useProcessTable()
  const win = windows.find((w) => w.pid === pid)

  return {
    title: win?.title ?? "",
    setTitle: (title) => setTitle(pid, title),
    requestClose: () => {
      void requestClose(pid)
    },
    setOnBeforeClose: (fn) => registerBeforeClose(pid, fn),
  }
}
