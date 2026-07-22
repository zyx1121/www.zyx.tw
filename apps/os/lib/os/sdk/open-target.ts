"use client"

/** Pure "how should double-clicking this path behave" logic, shared by the
 * desktop, My Documents, and the recycle bin. Takes the fs/app registry as
 * plain arguments (no imports of either) so this file can't accidentally
 * create an import cycle with components/apps/registry.ts. */

import type { IconName } from "@/components/pixel-icon"
import type { FsNode, FsPath, Vfs } from "@/lib/os/kernel/fs"
import { basenamePath } from "@/lib/os/kernel/fs"
import type { AppArgs, OsAppManifest } from "@/lib/os/types"

export type OpenTarget =
  { kind: "spawn"; appId: string; args?: AppArgs } | { kind: "unsupported" }

const LNK_EXTENSION = ".lnk"

interface LnkPayload {
  appId?: string
  /** Optional spawn args baked into the shortcut — e.g. the 我的文件.lnk
   * seed points at "explorer" with args.path set to C:/My Documents. */
  args?: AppArgs
  /** Optional icon override (M4) — a shortcut normally inherits its target
   * app's icon, but a few desktop shortcuts need a different one (我的文件.lnk
   * points at the generic explorer icon otherwise, not the classic My
   * Documents folder). */
  icon?: IconName
}

function parseLnk(content: string): LnkPayload | null {
  try {
    const parsed: unknown = JSON.parse(content)
    if (parsed && typeof parsed === "object" && "appId" in parsed) {
      return parsed as LnkPayload
    }
  } catch {
    // fall through — not a valid .lnk payload
  }
  return null
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".")
  return dot > 0 ? name.slice(dot).toLowerCase() : ""
}

/** What double-clicking `path` should do: spawn an app (via .lnk payload
 * or a fileAssociations match), or report nothing knows how to open it. */
export function resolveOpenTarget(
  vfs: Vfs,
  apps: Record<string, OsAppManifest>,
  path: FsPath
): OpenTarget {
  const node = vfs.stat(path)
  if (!node || node.type !== "file") return { kind: "unsupported" }

  if (path.toLowerCase().endsWith(LNK_EXTENSION)) {
    const payload = parseLnk(node.content)
    if (payload?.appId && apps[payload.appId]) {
      return { kind: "spawn", appId: payload.appId, args: payload.args }
    }
    return { kind: "unsupported" }
  }

  const ext = extensionOf(basenamePath(path))
  const app = Object.values(apps).find((candidate) =>
    candidate.fileAssociations?.includes(ext)
  )
  return app
    ? { kind: "spawn", appId: app.id, args: { path } }
    : { kind: "unsupported" }
}

/** Icon for a listing row: folders and .lnk shortcuts resolve to their
 * target app's icon, everything else falls back to the text-file icon
 * (the only file kind that exists in M2). A shortcut's optional `icon`
 * field (M4) wins over the target app's own icon when present. */
export function iconForEntry(
  name: string,
  node: FsNode,
  apps: Record<string, OsAppManifest>
): IconName {
  if (node.type === "dir") return "folder"
  if (name.toLowerCase().endsWith(LNK_EXTENSION) && node.type === "file") {
    const payload = parseLnk(node.content)
    if (payload?.icon) return payload.icon
    const app = payload?.appId ? apps[payload.appId] : undefined
    if (app) return app.icon
  }
  return "notepad-file"
}

/** Display label for a listing row — strips the .lnk suffix so shortcuts
 * show their friendly name instead of the raw filename. */
export function labelForEntry(name: string): string {
  return name.toLowerCase().endsWith(LNK_EXTENSION)
    ? name.slice(0, -LNK_EXTENSION.length)
    : name
}
