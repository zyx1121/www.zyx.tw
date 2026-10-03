#!/usr/bin/env node
// Fails when an app's theme tokens drift from the ui.zyx.tw theme.
//
// Source of truth: apps/ui/app/globals.css (stock shadcn base-nova neutral
// palette with the registry `theme` item applied). The script checks that
//   1. every light and dark cssVar in the `theme` item of
//      apps/ui/registry.json is present, with the same value, in the :root or
//      .dark rule of apps/ui/app/globals.css, and every `cssVars.theme`
//      entry (the type scale) is declared in an `@theme inline` block of
//      apps/ui/app/globals.css and of every consumer stylesheet, and
//   2. every consumer stylesheet below declares exactly the same :root and
//      .dark custom properties as apps/ui/app/globals.css, no more, no less,
//      and
//   3. the `css` rules of the `theme` item (the frosted overlays) appear, the
//      same apart from whitespace and comments, in apps/ui/app/globals.css
//      and every consumer stylesheet, and
//   4. no at-rule other than @utility in the `css` rules holds declarations
//      directly. The shadcn CLI reads an at-rule's children as nested rules
//      and fails on `@theme inline { --text-xs: ... }` ("Unknown word"), so
//      theme variables belong in `cssVars.theme`.
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

// Custom properties declared in every `@theme inline` block of a stylesheet.
function parseThemeInline(path) {
  const css = read(path).replace(/\/\*[\s\S]*?\*\//g, "")
  const vars = new Map()
  const block = /@theme\s+inline\s*\{([^}]*)\}/g
  let match
  while ((match = block.exec(css))) {
    for (const decl of match[1].split(";")) {
      const m = decl.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/)
      if (m) vars.set(m[1], normalize(m[2]))
    }
  }
  return vars
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim()
}

// CSS with comments and optional whitespace and semicolons dropped, so two
// spellings of the same rules compare equal.
function flatten(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};:,])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/;}/g, "}")
    .trim()
}

// A registry item's `css` object ({ at-rule: { selector: { prop: value } } })
// as CSS text.
function serialize(rules) {
  return Object.entries(rules)
    .map(([key, value]) =>
      typeof value === "string"
        ? `${key}:${value};`
        : `${key}{${serialize(value)}}`
    )
    .join("")
}

const errors = []
const source = parseTokens(SOURCE)

// 1. registry theme item -> source stylesheet
const registry = JSON.parse(read(REGISTRY))
const theme = registry.items.find((item) => item.name === "theme")
if (!theme) {
  errors.push(`${REGISTRY}: no "theme" item`)
} else {
  for (const path of [SOURCE, ...CONSUMERS]) {
    const declared = parseThemeInline(path)
    for (const [name, value] of Object.entries(theme.cssVars?.theme ?? {})) {
      const actual = declared.get(`--${name}`)
      if (actual !== normalize(value)) {
        errors.push(
          `${path} @theme inline --${name}: ${actual ?? "(missing)"}, registry theme says ${value}`
        )
      }
    }
  }
  for (const [mode, selector] of Object.entries(MODES)) {
    const vars = theme.cssVars?.[mode] ?? {}
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

// 3. registry theme css -> source and every consumer
if (theme?.css) {
  const rules = flatten(serialize(theme.css))
  for (const path of [SOURCE, ...CONSUMERS]) {
    if (!flatten(read(path)).includes(rules)) {
      errors.push(
        `${path}: missing the registry theme's css rules, or they differ`
      )
    }
  }
}

// 4. at-rules in the registry theme css hold rules, never declarations
// (`@utility` is the exception: the CLI writes its declarations as given)
if (theme?.css) {
  for (const [key, value] of Object.entries(theme.css)) {
    if (!key.startsWith("@") || key.startsWith("@utility")) continue
    if (typeof value !== "object") continue
    for (const [child, body] of Object.entries(value)) {
      if (typeof body === "string") {
        errors.push(
          `${REGISTRY} theme css "${key}" declares "${child}" directly; the shadcn CLI cannot apply that, use cssVars.theme`
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
