import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import { dim, fail, log } from "./log.js"

export type PackageManager = "bun" | "pnpm" | "yarn" | "npm"

export type Project = {
  /** Directory holding package.json. */
  root: string
  /** Where `app/`, `components/` and `lib/` live — root, or root/src. */
  base: string
  packageManager: PackageManager
  installed: Set<string>
}

const LOCKFILES: [string, PackageManager][] = [
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["package-lock.json", "npm"],
]

export function loadProject(rootFlag?: string): Project {
  const root = path.resolve(rootFlag ?? process.cwd())
  const manifestPath = path.join(root, "package.json")

  if (!fs.existsSync(manifestPath)) {
    fail(
      `No package.json in ${root}`,
      "Run this inside a Next.js project, or pass --root <dir>."
    )
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
  const installed = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ])

  if (!installed.has("next")) {
    fail(
      "This is not a Next.js project.",
      "zyxui targets the Next.js App Router only. That is the whole point of the subtraction."
    )
  }

  // A src/ layout is detected, not configured. Everything else is convention.
  const base =
    fs.existsSync(path.join(root, "src", "app")) &&
    !fs.existsSync(path.join(root, "app"))
      ? path.join(root, "src")
      : root

  const packageManager =
    LOCKFILES.find(([file]) => fs.existsSync(path.join(root, file)))?.[1] ??
    "npm"

  return { root, base, packageManager, installed }
}

export type WriteResult = "written" | "skipped"

export function writeTarget(
  project: Project,
  target: string,
  content: string,
  options: { overwrite: boolean; dryRun: boolean }
): WriteResult {
  const absolute = path.join(project.base, target)

  if (fs.existsSync(absolute) && !options.overwrite) return "skipped"

  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(absolute), { recursive: true })
    fs.writeFileSync(absolute, content, "utf8")
  }
  return "written"
}

/** True when globals.css has already been through `zyxui init`. */
export function hasTokens(project: Project): boolean {
  const absolute = path.join(project.base, "app", "globals.css")
  if (!fs.existsSync(absolute)) return false
  return fs.readFileSync(absolute, "utf8").includes("--block:")
}

export function relative(project: Project, target: string): string {
  return path.relative(project.root, path.join(project.base, target))
}

const INSTALL_ARGS: Record<PackageManager, string[]> = {
  bun: ["add"],
  pnpm: ["add"],
  yarn: ["add"],
  npm: ["install"],
}

export function installDependencies(
  project: Project,
  packages: string[],
  options: { dryRun: boolean }
) {
  const missing = packages.filter((name) => !project.installed.has(name))
  if (missing.length === 0) return

  const pm = project.packageManager
  log.step(`Installing ${missing.join(", ")} ${dim(`(${pm})`)}`)

  if (options.dryRun) return

  const result = spawnSync(pm, [...INSTALL_ARGS[pm], ...missing], {
    cwd: project.root,
    stdio: "inherit",
  })

  if (result.status !== 0) {
    fail(
      `${pm} failed to install ${missing.join(", ")}`,
      "Install them yourself and re-run with --no-install."
    )
  }
  for (const name of missing) project.installed.add(name)
}
