"use client"

import { useSyncExternalStore } from "react"

import { cn } from "@workspace/ui/lib/utils"

const noop = () => () => {}

/** A shell command as the 404 types it: a muted prompt, then the command. */
export function Command({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn("text-muted-foreground", className)}>
      <span aria-hidden="true">$ </span>
      {children}
    </p>
  )
}

/**
 * The path the visitor asked for. The 404 is prerendered once for every
 * path, so the server renders nothing and the client fills it in.
 */
export function RequestedPath() {
  const path = useSyncExternalStore(
    noop,
    () => decodeURI(window.location.pathname),
    () => ""
  )
  return <>{path}</>
}

/** A block cursor that blinks, as at an idle prompt. */
export function Cursor() {
  return (
    <span aria-hidden="true" className="terminal-cursor">
      {"█"}
    </span>
  )
}
