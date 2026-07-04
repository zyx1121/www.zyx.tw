"use client"

import { useProcessTable } from "@/lib/os/kernel/process-table"
import { useAppInstancePid } from "@/lib/os/sdk/app-host"
import type { AppArgs, Pid } from "@/lib/os/types"

export interface UseProcessResult {
  pid: Pid
  args: AppArgs
  /** Requests self-close through the onBeforeClose flow (same as the
   * window's X button). */
  exit: () => void
  spawn: (appId: string, args?: AppArgs) => Pid
}

export function useProcess(): UseProcessResult {
  const pid = useAppInstancePid()
  const { processes, spawn, requestClose } = useProcessTable()
  const args = processes.find((p) => p.pid === pid)?.args ?? {}

  return {
    pid,
    args,
    exit: () => {
      void requestClose(pid)
    },
    spawn,
  }
}
