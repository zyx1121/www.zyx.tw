"use client"

/** Virtual filesystem: a flat `path -> node` map with a version counter so
 * React can subscribe via useSyncExternalStore. This is the single source
 * of truth for everything under `C:/` — the desktop, My Documents, the
 * recycle bin, and Notepad all read/write through this same store. */

/** Normalized form uses forward slashes ("C:/Windows/Desktop"); the UI
 * layer is responsible for rendering backslashes. */
export type FsPath = string

export type FsNode =
  | { type: "file"; content: string; mtime: number }
  | { type: "dir"; mtime: number }

export interface FsEntry {
  name: string
  node: FsNode
}

export interface Vfs {
  exists(p: FsPath): boolean
  stat(p: FsPath): FsNode | null
  /** Directories first, then lexicographic order. */
  list(dir: FsPath): FsEntry[]
  readFile(p: FsPath): string | null
  /** Throws if the parent directory doesn't exist. */
  writeFile(p: FsPath, content: string): void
  /** Creates every missing ancestor directory too. */
  mkdir(p: FsPath): void
  /** Hard delete — directories recurse. Use recycle() for the trash flow. */
  rm(p: FsPath): void
  /** Moving a directory relocates its whole subtree. */
  mv(from: FsPath, to: FsPath): void
  /** Moves into C:/Recycled and records the original location. */
  recycle(p: FsPath): void
  /** Restores a C:/Recycled entry (by name) back to its recorded origin. */
  restore(name: string): void
  emptyRecycleBin(): void
  subscribe(listener: () => void): () => void
}

export const RECYCLE_DIR: FsPath = "C:/Recycled"
export const MY_DOCUMENTS_DIR: FsPath = "C:/My Documents"
export const DESKTOP_DIR: FsPath = "C:/Windows/Desktop"

const RECYCLE_META: FsPath = `${RECYCLE_DIR}/.meta`

const README_TEXT = `歡迎使用 os.zyx.tw!

這是一個活在瀏覽器裡的迷你 Win98 桌面。桌面上的每個圖示都是真的檔案,存在
瀏覽器的 IndexedDB 裡 —— 用記事本改點東西、按下儲存,重新整理頁面也不會不見。

雙擊「資源回收筒」可以看看還原/清空怎麼運作。

祝玩得愉快。`

function normalize(p: FsPath): FsPath {
  const trimmed = p.replace(/\\/g, "/").replace(/\/+$/, "")
  return trimmed.length > 0 ? trimmed : p
}

function segmentsOf(p: FsPath): string[] {
  return normalize(p).split("/")
}

export function dirnamePath(p: FsPath): FsPath {
  return segmentsOf(p).slice(0, -1).join("/")
}

export function basenamePath(p: FsPath): string {
  const parts = segmentsOf(p)
  return parts[parts.length - 1] ?? p
}

export function joinPath(dir: FsPath, name: string): FsPath {
  return `${normalize(dir)}/${name}`
}

/** " (2)", " (3)", ... inserted before the extension for name collisions. */
function withSuffix(name: string, n: number): string {
  const dot = name.lastIndexOf(".")
  if (dot <= 0) return `${name} (${n})`
  return `${name.slice(0, dot)} (${n})${name.slice(dot)}`
}

class FsStore implements Vfs {
  private nodes = new Map<FsPath, FsNode>()
  private version = 0
  private listeners = new Set<() => void>()

  // Arrow-function properties (not prototype methods) so callers can pass
  // `vfs.subscribe` / `vfs.list` around unbound — e.g. straight into
  // useSyncExternalStore — without losing `this`.

  getVersion = (): number => this.version

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private touch(): void {
    this.version += 1
    for (const listener of this.listeners) listener()
  }

  exists = (p: FsPath): boolean => this.nodes.has(normalize(p))

  stat = (p: FsPath): FsNode | null => this.nodes.get(normalize(p)) ?? null

  list = (dir: FsPath): FsEntry[] => {
    const parent = normalize(dir)
    const entries: FsEntry[] = []
    for (const [path, node] of this.nodes) {
      if (path !== parent && dirnamePath(path) === parent) {
        entries.push({ name: basenamePath(path), node })
      }
    }
    return entries.sort((a, b) => {
      if (a.node.type !== b.node.type) return a.node.type === "dir" ? -1 : 1
      return a.name.localeCompare(b.name, "zh-Hant")
    })
  }

  readFile = (p: FsPath): string | null => {
    const node = this.stat(p)
    return node && node.type === "file" ? node.content : null
  }

  writeFile = (p: FsPath, content: string): void => {
    const path = normalize(p)
    const parent = dirnamePath(path)
    if (parent && !this.exists(parent)) {
      throw new Error(`os: parent directory "${parent}" does not exist`)
    }
    this.nodes.set(path, { type: "file", content, mtime: Date.now() })
    this.touch()
  }

  mkdir = (p: FsPath): void => {
    const path = normalize(p)
    let cursor = ""
    for (const part of path.split("/")) {
      cursor = cursor ? `${cursor}/${part}` : part
      const existing = this.nodes.get(cursor)
      if (!existing) {
        this.nodes.set(cursor, { type: "dir", mtime: Date.now() })
      } else if (existing.type !== "dir") {
        throw new Error(`os: "${cursor}" already exists and is not a directory`)
      }
    }
    this.touch()
  }

  rm = (p: FsPath): void => {
    const path = normalize(p)
    const node = this.stat(path)
    if (!node) return
    if (node.type === "dir") {
      const prefix = `${path}/`
      for (const key of this.nodes.keys()) {
        if (key === path || key.startsWith(prefix)) this.nodes.delete(key)
      }
    } else {
      this.nodes.delete(path)
    }
    this.touch()
  }

  mv = (from: FsPath, to: FsPath): void => {
    const src = normalize(from)
    const dest = normalize(to)
    const node = this.stat(src)
    if (!node) throw new Error(`os: "${src}" does not exist`)
    const parent = dirnamePath(dest)
    if (parent && !this.exists(parent)) {
      throw new Error(`os: parent directory "${parent}" does not exist`)
    }
    const prefix = `${src}/`
    const moving: [FsPath, FsNode][] = [[src, node]]
    for (const [key, value] of this.nodes) {
      if (key.startsWith(prefix)) moving.push([key, value])
    }
    for (const [key] of moving) this.nodes.delete(key)
    for (const [key, value] of moving) {
      const rest = key === src ? "" : key.slice(src.length)
      this.nodes.set(`${dest}${rest}`, value)
    }
    this.touch()
  }

  recycle = (p: FsPath): void => {
    const src = normalize(p)
    if (!this.exists(src)) throw new Error(`os: "${src}" does not exist`)
    if (!this.exists(RECYCLE_DIR)) this.mkdir(RECYCLE_DIR)
    const base = basenamePath(src)
    let name = base
    let n = 2
    while (this.exists(joinPath(RECYCLE_DIR, name))) {
      name = withSuffix(base, n)
      n += 1
    }
    this.mv(src, joinPath(RECYCLE_DIR, name))
    const meta = this.readMeta()
    meta[name] = src
    this.writeMeta(meta)
  }

  restore = (name: string): void => {
    const meta = this.readMeta()
    const origin = meta[name]
    const src = joinPath(RECYCLE_DIR, name)
    if (!origin || !this.exists(src)) {
      delete meta[name]
      this.writeMeta(meta)
      return
    }
    const parent = dirnamePath(origin)
    if (parent && !this.exists(parent)) this.mkdir(parent)
    let dest = origin
    if (this.exists(dest)) {
      const destParent = dirnamePath(dest)
      const destBase = basenamePath(dest)
      let n = 2
      let candidate = withSuffix(destBase, n)
      while (this.exists(joinPath(destParent, candidate))) {
        n += 1
        candidate = withSuffix(destBase, n)
      }
      dest = joinPath(destParent, candidate)
    }
    this.mv(src, dest)
    delete meta[name]
    this.writeMeta(meta)
  }

  emptyRecycleBin = (): void => {
    if (!this.exists(RECYCLE_DIR)) return
    for (const { name } of this.list(RECYCLE_DIR)) {
      if (name === ".meta") continue
      this.rm(joinPath(RECYCLE_DIR, name))
    }
    this.writeMeta({})
  }

  private readMeta(): Record<string, FsPath> {
    const raw = this.readFile(RECYCLE_META)
    if (!raw) return {}
    try {
      const parsed: unknown = JSON.parse(raw)
      return parsed && typeof parsed === "object"
        ? (parsed as Record<string, FsPath>)
        : {}
    } catch {
      return {}
    }
  }

  private writeMeta(meta: Record<string, FsPath>): void {
    this.nodes.set(RECYCLE_META, {
      type: "file",
      content: JSON.stringify(meta),
      mtime: Date.now(),
    })
    this.touch()
  }

  // --- Persistence-only extensions, not part of the Vfs contract. ---
  // Kept on the concrete class (not the exported `Vfs`-typed singleton) so
  // idb.ts can snapshot/restore the raw map without widening the app-facing
  // API surface.

  snapshotEntries = (): [FsPath, FsNode][] => [...this.nodes]

  hydrateFrom = (entries: [FsPath, FsNode][]): void => {
    this.nodes = new Map(entries)
    this.touch()
  }
}

const store = new FsStore()

/** The system-wide filesystem singleton. Stable across renders/hooks. */
export const vfs: Vfs = store

export function getFsVersion(): number {
  return store.getVersion()
}

export function dumpFsEntries(): [FsPath, FsNode][] {
  return store.snapshotEntries()
}

export function loadFsEntries(entries: [FsPath, FsNode][]): void {
  store.hydrateFrom(entries)
}

/** Fresh install content — mirrors docs/DESIGN.md's Seed list exactly. */
export function seedFs(): void {
  store.mkdir(MY_DOCUMENTS_DIR)
  store.mkdir(DESKTOP_DIR)
  store.mkdir(RECYCLE_DIR)
  store.writeFile(
    joinPath(DESKTOP_DIR, "我的文件.lnk"),
    JSON.stringify({ appId: "my-documents" })
  )
  store.writeFile(
    joinPath(DESKTOP_DIR, "記事本.lnk"),
    JSON.stringify({ appId: "notepad" })
  )
  store.writeFile(
    joinPath(DESKTOP_DIR, "控制台.lnk"),
    JSON.stringify({ appId: "control-panel" })
  )
  store.writeFile(
    joinPath(DESKTOP_DIR, "資源回收筒.lnk"),
    JSON.stringify({ appId: "recycle-bin" })
  )
  store.writeFile(joinPath(DESKTOP_DIR, "README.txt"), README_TEXT)
}
