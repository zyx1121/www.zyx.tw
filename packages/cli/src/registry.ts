import { fail } from "./log.js"

export const REGISTRY_URL = (
  process.env.ZYXUI_REGISTRY ?? "https://ui.zyx.tw/r"
).replace(/\/$/, "")

export type RegistryFile = {
  path: string
  type: string
  target: string
  content?: string
}

export type RegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryFile[]
}

export type RegistryIndex = {
  name: string
  homepage?: string
  items: RegistryItem[]
}

/** `@zyx1121/button` and `button` name the same item. There is only one registry. */
export function normalize(name: string): string {
  return name.replace(/^@[^/]+\//, "").replace(/\.json$/, "")
}

async function getJson<T>(url: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(url)
  } catch (error) {
    return fail(
      `Cannot reach the registry at ${url}`,
      error instanceof Error ? error.message : undefined
    )
  }
  if (!response.ok) {
    return fail(`Registry returned ${response.status} for ${url}`)
  }
  return (await response.json()) as T
}

export async function fetchIndex(): Promise<RegistryIndex> {
  return getJson<RegistryIndex>(`${REGISTRY_URL}/registry.json`)
}

export async function fetchItem(name: string): Promise<RegistryItem> {
  return getJson<RegistryItem>(`${REGISTRY_URL}/${normalize(name)}.json`)
}

/**
 * Expand the requested names into the full install list, dependencies first.
 * Depth-first so a component is always written after the things it imports.
 */
export function resolve(index: RegistryIndex, names: string[]): string[] {
  const byName = new Map(index.items.map((item) => [item.name, item]))
  const ordered: string[] = []
  const seen = new Set<string>()

  const visit = (raw: string, trail: string[]) => {
    const name = normalize(raw)
    if (seen.has(name)) return
    const item = byName.get(name)
    if (!item) {
      const suggestion = [...byName.keys()]
        .filter(
          (candidate) => candidate.includes(name) || name.includes(candidate)
        )
        .slice(0, 3)
      return fail(
        trail.length
          ? `Unknown item "${name}" (required by ${trail.join(" -> ")})`
          : `Unknown item "${name}"`,
        suggestion.length
          ? `Did you mean: ${suggestion.join(", ")}?`
          : "Run `zyxui list` to see everything in the registry."
      )
    }
    seen.add(name)
    for (const dep of item.registryDependencies ?? []) {
      visit(dep, [...trail, name])
    }
    ordered.push(name)
  }

  for (const name of names) visit(name, [])
  return ordered
}
