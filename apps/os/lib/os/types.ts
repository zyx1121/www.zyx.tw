import type { ComponentType } from "react"

import type { IconName } from "@/components/pixel-icon"

/** Process id — assigned by the kernel, 1-based and monotonically increasing. */
export type Pid = number

export type WindowControl = "minimize" | "maximize" | "close"

/** Spawn-time arguments handed to a process (e.g. a file path to open). */
export interface AppArgs {
  path?: string
}

/** Props every app Component receives directly; everything else comes from
 * the SDK hooks (useProcess / useWindow / ...) via <AppHost pid>. */
export interface OsAppProps {
  pid: Pid
}

export interface OsAppManifest {
  /** kebab-case, unique across the registry. */
  id: string
  /** Window default title + start menu label. */
  name: string
  /** Shown in the start menu's status bar. */
  description: string
  icon: IconName
  window: {
    width: number
    height: number
    /** default 160 */
    minWidth?: number
    /** default 120 */
    minHeight?: number
    resizable: boolean
    controls: WindowControl[]
  }
  /** false → spawn() on an already-running instance focuses the existing window. */
  multiInstance: boolean
  /** Extensions including the dot, e.g. [".txt"]. */
  fileAssociations?: string[]
  /** true → excluded from the desktop icon seed (M2+). */
  desktopHidden?: boolean
  /** true → excluded from the start menu's app list (M4+). The start menu
   * otherwise derives its items straight from the registry — no manifest
   * currently sets this, it exists so a future app can opt out without
   * reintroducing a hand-maintained menu whitelist. */
  startMenuHidden?: boolean
  Component: ComponentType<OsAppProps>
}
