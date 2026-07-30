import fs from "node:fs"
import path from "node:path"

import { bold, dim, log } from "./log.js"
import {
  hasTokens,
  installDependencies,
  loadProject,
  relative,
  writeTarget,
  type Project,
} from "./project.js"
import {
  fetchIndex,
  fetchItem,
  resolve,
  type RegistryItem,
} from "./registry.js"

export type Options = {
  root?: string
  overwrite: boolean
  dryRun: boolean
  install: boolean
}

const BASE_ITEMS = new Set(["tokens", "utils"])

/** Every component imports cn, so lib/utils.ts is implied rather than declared. */
function withUtils(project: Project, names: string[]): string[] {
  const needsUtils = names.some((name) => !BASE_ITEMS.has(name))
  const utilsPath = path.join(project.base, "lib", "utils.ts")
  if (!needsUtils || names.includes("utils") || fs.existsSync(utilsPath)) {
    return names
  }
  return ["utils", ...names]
}

async function run(
  project: Project,
  names: string[],
  options: Options,
  overwriteFor: (item: RegistryItem) => boolean
) {
  log.step(`Resolving ${names.length} item${names.length === 1 ? "" : "s"}`)

  const items = await Promise.all(names.map((name) => fetchItem(name)))
  const packages = new Set<string>()
  let written = 0
  let skipped = 0

  for (const item of items) {
    for (const dep of item.dependencies ?? []) packages.add(dep)

    for (const file of item.files) {
      if (file.content === undefined) {
        log.warn(`${item.name}: ${file.path} has no content in the registry`)
        continue
      }
      const result = writeTarget(project, file.target, file.content, {
        overwrite: options.overwrite || overwriteFor(item),
        dryRun: options.dryRun,
      })
      if (result === "written") {
        written += 1
        log.done(relative(project, file.target))
      } else {
        skipped += 1
        log.skip(`${relative(project, file.target)} (exists)`)
      }
    }
  }

  if (options.install && packages.size > 0) {
    installDependencies(project, [...packages], { dryRun: options.dryRun })
  }

  log.blank()
  const summary = [
    `${written} file${written === 1 ? "" : "s"} written`,
    skipped > 0 ? `${skipped} skipped` : null,
  ]
    .filter(Boolean)
    .join(", ")
  log.info(options.dryRun ? `${bold("Dry run")}: ${summary}` : `${summary}.`)
  if (skipped > 0 && !options.overwrite) {
    log.info(`  ${dim("Pass --overwrite to replace existing files.")}`)
  }
}

export async function add(names: string[], options: Options) {
  const project = loadProject(options.root)
  const index = await fetchIndex()
  const resolved = withUtils(project, resolve(index, names))
  await run(project, resolved, options, () => false)
}

export async function init(options: Options) {
  const project = loadProject(options.root)
  const index = await fetchIndex()
  const resolved = resolve(index, ["tokens", "utils"])

  // globals.css from create-next-app carries nothing worth keeping, so init
  // claims it. Once it holds --block, init leaves it alone.
  const alreadyThemed = hasTokens(project)
  if (alreadyThemed && !options.overwrite) {
    log.warn("app/globals.css already has the zyx tokens, leaving it alone.")
  }

  await run(
    project,
    resolved,
    options,
    (item) => item.name === "tokens" && !alreadyThemed
  )

  log.blank()
  log.info(`Next: ${bold("zyxui add button")}`)
}

export async function list(options: Pick<Options, "root">) {
  void options
  const index = await fetchIndex()
  const width = Math.max(...index.items.map((item) => item.name.length))

  for (const item of index.items) {
    const kind = item.type.replace("registry:", "")
    log.info(
      `${item.name.padEnd(width)}  ${dim(kind.padEnd(6))}  ${item.description ?? ""}`
    )
  }

  log.blank()
  log.info(`${index.items.length} items — ${dim(index.homepage ?? "")}`)
}
