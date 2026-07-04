"use client"

import { useProcessTable } from "@/lib/os/kernel/process-table"
import type { OsProcess } from "@/lib/os/kernel/process-table"
import type { AppArgs, Pid } from "@/lib/os/types"

export type { OsProcess } from "@/lib/os/kernel/process-table"

export interface UseSystemResult {
  processes: OsProcess[]
  /** Immediate, unconditional kill — bypasses onBeforeClose. */
  kill: (pid: Pid) => void
  spawn: (appId: string, args?: AppArgs) => Pid
}

/** System-management surface for apps that need visibility across every
 * running process (task manager and friends) — the only SDK entry point
 * for that; system apps must not reach into lib/os/kernel directly. */
export function useSystem(): UseSystemResult {
  const { processes, kill, spawn } = useProcessTable()
  return { processes, kill, spawn }
}
