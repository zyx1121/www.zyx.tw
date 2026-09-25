#!/usr/bin/env node
// Fails when an app's theme tokens drift from the ui.zyx.tw theme.
//
// Source of truth: apps/ui/app/globals.css (stock shadcn base-nova neutral
// palette with the registry `theme` item applied). The script checks that
//   1. every cssVar in the `theme` item of apps/ui/registry.json is present,
//      with the same value, in apps/ui/app/globals.css, and
//   2. every consumer stylesheet below declares exactly the same :root and
//      .dark custom properties as apps/ui/app/globals.css, no more, no less.
//
// Usage: node scripts/check-theme.mjs

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const SOURCE = "apps/ui/app/globals.css"
const REGISTRY = "apps/ui/registry.json"
const CONSUMERS = [
  "packages/ui/src/styles/globals.css",
  "apps/1909/app/globals.css",
]

const MODES = { light: ":root", dark: ".dark" }

function read(path) {
  return readFileSync(join(root, path), "utf8")
}

// Returns { ":root": Map, ".dark": Map } of custom properties declared in the
// top-level :root and .dark rules.
function parseTokens(path) {
  const css = read(path).replace(/\/\*[\s\S]*?\*\//g, "")
  const blocks = { ":root": new Map(), ".dark": new Map() }
  const rule = /(^|\n)\s*(:root|\.dark)\s*\{([^}]*)\}/g
  let match
  while ((match = rule.exec(css))) {
    const map = blocks[match[2]]
    for (const decl of match[3].split(";")) {
      const m = decl.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/)
      if (m) map.set(m[1], normalize(m[2]))
    }
  }
  for (const [selector, map] of Object.entries(blocks)) {
    if (map.size === 0) {
      throw new Error(`${path}: no custom properties found in ${selector}`)
    }
  }
  return blocks
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim()
}

const errors = []
const source = parseTokens(SOURCE)

// 1. registry theme item -> source stylesheet
const registry = JSON.parse(read(REGISTRY))
const theme = registry.items.find((item) => item.name === "theme")
if (!theme) {
  errors.push(`${REGISTRY}: no "theme" item`)
} else {
  for (const [mode, selector] of Object.entries(MODES)) {
    const vars = {
      ...(theme.cssVars?.theme ?? {}),
      ...(theme.cssVars?.[mode] ?? {}),
    }
    for (const [name, value] of Object.entries(vars)) {
      const actual = source[selector].get(`--${name}`)
      if (actual !== normalize(value)) {
        errors.push(
          `${SOURCE} ${selector} --${name}: ${actual ?? "(missing)"}, registry theme says ${value}`
        )
      }
    }
  }
}

// 2. source stylesheet -> every consumer
for (const path of CONSUMERS) {
  const tokens = parseTokens(path)
  for (const selector of Object.values(MODES)) {
    const want = source[selector]
    const have = tokens[selector]
    for (const [name, value] of want) {
      if (!have.has(name)) {
        errors.push(`${path} ${selector} ${name}: missing (want ${value})`)
      } else if (have.get(name) !== value) {
        errors.push(
          `${path} ${selector} ${name}: ${have.get(name)} (want ${value})`
        )
      }
    }
    for (const name of have.keys()) {
      if (!want.has(name)) {
        errors.push(
          `${path} ${selector} ${name}: not part of the ui.zyx.tw theme`
        )
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Theme drift against ${SOURCE}:`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log(
  `Theme OK: ${REGISTRY} theme and ${CONSUMERS.length} consumer stylesheet(s) match ${SOURCE}.`
)
