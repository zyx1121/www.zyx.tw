"use client"

import * as React from "react"

import {
  getFsVersion,
  vfs,
  type FsEntry,
  type FsPath,
  type Vfs,
} from "@/lib/os/kernel/fs"

export type { FsEntry, FsNode, FsPath, Vfs } from "@/lib/os/kernel/fs"
export {
  basenamePath,
  dirnamePath,
  joinPath,
  uniqueNameIn,
  ILLEGAL_NAME_CHARS,
  ILLEGAL_NAME_MESSAGE,
} from "@/lib/os/kernel/fs"

/** Direct access to the system-wide virtual filesystem. The returned
 * object is a stable singleton (not per-instance), matching real OS
 * filesystem semantics — every app sees the same tree. */
export function useFs(): Vfs {
  return vfs
}

/** Subscribes to a directory's listing; re-renders only when the fs
 * version actually changes (cached so useSyncExternalStore doesn't loop). */
export function useFsList(dir: FsPath): FsEntry[] {
  const cacheRef = React.useRef<{
    dir: FsPath
    version: number
    data: FsEntry[]
  } | null>(null)

  const getSnapshot = React.useCallback((): FsEntry[] => {
    const version = getFsVersion()
    const cache = cacheRef.current
    if (cache && cache.dir === dir && cache.version === version) {
      return cache.data
    }
    const data = vfs.list(dir)
    cacheRef.current = { dir, version, data }
    return data
  }, [dir])

  return React.useSyncExternalStore(vfs.subscribe, getSnapshot, getSnapshot)
}

/** Subscribes to a single file's content (null if missing). */
export function useFsFile(path: FsPath): string | null {
  const getSnapshot = React.useCallback(() => vfs.readFile(path), [path])
  return React.useSyncExternalStore(vfs.subscribe, getSnapshot, getSnapshot)
}
