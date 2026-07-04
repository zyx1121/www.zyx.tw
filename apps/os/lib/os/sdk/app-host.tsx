"use client"

import * as React from "react"

import type { Pid } from "@/lib/os/types"

/** Instance-scoped context: which pid the wrapped app subtree belongs to.
 * Populated by the OS shell around every window's Component; SDK hooks read
 * it so app code never needs to import kernel internals directly. */
export const AppInstanceContext = React.createContext<Pid | null>(null)

export function AppHost({
  pid,
  children,
}: {
  pid: Pid
  children: React.ReactNode
}) {
  return (
    <AppInstanceContext.Provider value={pid}>
      {children}
    </AppInstanceContext.Provider>
  )
}

export function useAppInstancePid(): Pid {
  const pid = React.useContext(AppInstanceContext)
  if (pid === null) {
    throw new Error("SDK hooks must be used within <AppHost pid>")
  }
  return pid
}
