"use client"

/** One-way rename map for `.lnk` shortcuts persisted by older snapshot
 * versions. `resolveOpenTarget()` (lib/os/sdk/open-target.ts) only knows
 * about the *current* app registry — a returning user's IndexedDB
 * snapshot can still reference an app id that's since been removed or
 * renamed (e.g. M2's "my-documents" folded into M3's "explorer"), which
 * would otherwise silently regress to a "無法開啟" error on every boot.
 *
 * Rule: whenever an app id is removed or renamed from the registry, add
 * an entry here mapping the old id to its replacement payload. Applied
 * once at hydrate time (see idb.ts's hydrateFs), on the raw entries
 * *before* they're mounted into the live store — fix the data, don't
 * route around it at read time. */

import type { FsNode, FsPath } from "@/lib/os/kernel/fs"
import type { AppArgs } from "@/lib/os/types"

interface LnkPayload {
  appId?: string
  args?: AppArgs
}

export const LEGACY_LNK_MAP: Record<string, LnkPayload> = {
  // M2 -> M3: my-documents app folded into explorer opened at a fixed path.
  "my-documents": { appId: "explorer", args: { path: "C:/My Documents" } },
}

function parseLnkPayload(content: string): LnkPayload | null {
  try {
    const parsed: unknown = JSON.parse(content)
    if (parsed && typeof parsed === "object" && "appId" in parsed) {
      return parsed as LnkPayload
    }
  } catch {
    // Not a valid .lnk payload — leave it alone, resolveOpenTarget()
    // already handles that case (falls through to "無法開啟").
  }
  return null
}

/** Rewrites any `.lnk` file whose `appId` is a retired id per
 * LEGACY_LNK_MAP to its current replacement. Idempotent: an
 * already-migrated (or never-legacy) entry's appId isn't a key in the
 * map, so re-running this on the same entries is a no-op. */
export function migrateLegacyLnks(
  entries: [FsPath, FsNode][]
): [FsPath, FsNode][] {
  let changed = false
  const migrated = entries.map(([path, node]): [FsPath, FsNode] => {
    if (node.type !== "file" || !path.toLowerCase().endsWith(".lnk")) {
      return [path, node]
    }
    const payload = parseLnkPayload(node.content)
    const replacement = payload?.appId
      ? LEGACY_LNK_MAP[payload.appId]
      : undefined
    if (!replacement) return [path, node]
    changed = true
    return [path, { ...node, content: JSON.stringify(replacement) }]
  })
  return changed ? migrated : entries
}
