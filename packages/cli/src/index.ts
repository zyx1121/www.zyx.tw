#!/usr/bin/env node
import { createRequire } from "node:module"
import { parseArgs } from "node:util"

import { add, init, list, type Options } from "./install.js"
import { bold, dim, fail, log } from "./log.js"
import { REGISTRY_URL } from "./registry.js"

const require = createRequire(import.meta.url)
const { version } = require("../package.json") as { version: string }

const HELP = `${bold("zyxui")} ${dim(version)}

  ${dim("Loki's component registry. One registry, one theme, no style matrix.")}

${bold("Usage")}
  zyxui init                 write app/globals.css + lib/utils.ts
  zyxui add <name...>        copy components in, dependencies first
  zyxui list                 everything in the registry

${bold("Options")}
  --root <dir>               project directory (default: cwd)
  --overwrite                replace files that already exist
  --dry-run                  print what would happen, write nothing
  --no-install               skip the package manager step
  -v, --version              print the version
  -h, --help                 print this

${bold("Registry")}
  ${REGISTRY_URL}${dim("  (override with ZYXUI_REGISTRY)")}
`

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      root: { type: "string" },
      overwrite: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      install: { type: "boolean", default: true },
      version: { type: "boolean", short: "v", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  })

  const [command, ...names] = positionals

  if (values.version) {
    log.info(version)
    return
  }
  if (values.help || command === undefined) {
    log.info(HELP)
    return
  }

  const options: Options = {
    root: values.root,
    overwrite: values.overwrite,
    dryRun: values["dry-run"],
    install: values.install,
  }

  switch (command) {
    case "init":
      return init(options)
    case "add":
      if (names.length === 0) {
        fail("Nothing to add.", "Try `zyxui add button`, or `zyxui list`.")
      }
      return add(names, options)
    case "list":
    case "ls":
      return list(options)
    default:
      return fail(`Unknown command "${command}"`, "Run `zyxui --help`.")
  }
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error))
})
