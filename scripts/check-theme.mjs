// Fails when the one stylesheet every app imports
// (packages/ui/src/styles/globals.css) drifts from what the registry ships
// to other projects: the base item's tokens in apps/ui/registry.json, and the
// keyframes and animations of the component items.
import { readFile } from "node:fs/promises"

const root = new URL("..", import.meta.url)
const css = await readFile(
  new URL("packages/ui/src/styles/globals.css", root),
  "utf8"
)
const registry = JSON.parse(
  await readFile(new URL("apps/ui/registry.json", root), "utf8")
)

const normalize = (value) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")")
    .trim()

function readBlock(selector) {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) throw new Error(`globals.css has no ${selector} block`)
  const body = css.slice(start, css.indexOf("\n}", start))
  return Object.fromEntries(
    [...body.matchAll(/--([\w*-]+):\s*([^;]+);/g)].map((m) => [
      m[1],
      normalize(m[2]),
    ])
  )
}

let failed = false
function compare(scope, actual, expected) {
  for (const name of new Set([...Object.keys(actual), ...Object.keys(expected)])) {
    if (actual[name] !== expected[name]) {
      console.error(
        `${scope} --${name}: globals.css=${actual[name]} registry.json=${expected[name]}`
      )
      failed = true
    }
  }
}

const base = registry.items.find((item) => item.name === "base")
if (!base?.cssVars) throw new Error("registry.json has no base item with cssVars")

// @theme inline also maps the colors, which the CLI writes on its own; the
// rest must be exactly the base's theme plus the components' animations.
const theme = readBlock("@theme inline")
const shipped = { ...base.cssVars.theme }
for (const item of registry.items) {
  for (const [name, value] of Object.entries(item.cssVars?.theme ?? {})) {
    if (item !== base) shipped[name] = value
  }
}
compare(
  "theme",
  Object.fromEntries(
    Object.entries(theme).filter(([name]) => !name.startsWith("color-"))
  ),
  Object.fromEntries(
    Object.entries(shipped).map(([name, value]) => [name, normalize(value)])
  )
)
compare("light", readBlock(":root"), base.cssVars.light)
compare("dark", readBlock(".dark"), base.cssVars.dark)

// Every color the base defines is mapped for Tailwind, and nothing else is.
const colors = Object.keys(theme).filter((name) => name.startsWith("color-"))
const defined = Object.keys(base.cssVars.light).filter((name) => name !== "radius")
compare(
  "color mapping",
  Object.fromEntries(colors.map((name) => [name, theme[name]])),
  Object.fromEntries(defined.map((name) => [`color-${name}`, `var(--${name})`]))
)

// Utilities and keyframes the registry ships must exist here too.
for (const item of registry.items) {
  for (const rule of Object.keys(item.css ?? {})) {
    if (!rule.startsWith("@utility") && !rule.startsWith("@keyframes")) continue
    if (!css.includes(`${rule} {`)) {
      console.error(`globals.css is missing ${rule} (from ${item.name})`)
      failed = true
    }
  }
}

if (failed) process.exit(1)
console.log("theme in sync")
