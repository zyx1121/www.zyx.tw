"use client"

/** Hand-rolled IndexedDB wrapper — zero dependencies by design. Persists
 * the whole VFS as one debounced snapshot and hydrates it back on boot. */

import {
  dumpFsEntries,
  loadFsEntries,
  seedFs,
  vfs,
  type FsNode,
  type FsPath,
} from "@/lib/os/kernel/fs"
import {
  migrateLegacyLnks,
  upsertM4DesktopIcons,
} from "@/lib/os/kernel/legacy-migration"

const DB_NAME = "os-zyx-tw"
const DB_VERSION = 1
const STORE_NAME = "fs"
const SNAPSHOT_KEY = "snapshot"
const DEBOUNCE_MS = 500

interface FsSnapshot {
  version: 1
  entries: [FsPath, FsNode][]
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb()
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const request = tx.objectStore(STORE_NAME).get(key)
      request.onsuccess = () => resolve(request.result as T | undefined)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

async function idbPut<T>(key: string, value: T): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      tx.objectStore(STORE_NAME).put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}

function isFsNode(value: unknown): value is FsNode {
  if (!value || typeof value !== "object") return false
  const node = value as Record<string, unknown>
  if (node.type === "dir") return typeof node.mtime === "number"
  if (node.type === "file") {
    return typeof node.content === "string" && typeof node.mtime === "number"
  }
  return false
}

function isValidSnapshot(value: unknown): value is FsSnapshot {
  if (!value || typeof value !== "object") return false
  const snapshot = value as Record<string, unknown>
  if (snapshot.version !== 1 || !Array.isArray(snapshot.entries)) return false
  return snapshot.entries.every(
    (entry) =>
      Array.isArray(entry) &&
      entry.length === 2 &&
      typeof entry[0] === "string" &&
      isFsNode(entry[1])
  )
}

let autoPersistStarted = false

function startAutoPersist(): void {
  if (autoPersistStarted) return
  autoPersistStarted = true
  let timer: ReturnType<typeof setTimeout> | null = null
  vfs.subscribe(() => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      const snapshot: FsSnapshot = { version: 1, entries: dumpFsEntries() }
      void idbPut(SNAPSHOT_KEY, snapshot)
    }, DEBOUNCE_MS)
  })
}

/** Boots the filesystem: loads the last IndexedDB snapshot, or seeds a
 * fresh install when there is none / it's corrupt. Resolves once the fs is
 * safe to read — callers must not render fs-backed UI before this settles
 * (the desktop shows plain teal until then). */
export async function hydrateFs(): Promise<void> {
  try {
    const snapshot = await idbGet<FsSnapshot>(SNAPSHOT_KEY)
    if (isValidSnapshot(snapshot)) {
      // Normalize legacy .lnk payloads (retired app ids) before they ever
      // reach the live store, then upsert the M4 desktop shortcuts a
      // pre-M4 snapshot won't have yet — see legacy-migration.ts.
      loadFsEntries(upsertM4DesktopIcons(migrateLegacyLnks(snapshot.entries)))
    } else {
      seedFs()
    }
  } catch {
    seedFs()
  }
  startAutoPersist()
}
