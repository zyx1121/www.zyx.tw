// Enforce the rendered type scale without forking CLI-owned shadcn components.
import { readdirSync, readFileSync } from "node:fs"
import { dirname, extname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ALLOWED = new Set([14, 16, 24, 80])
const TOKENS = new Map([
  ["xs", 14],
  ...["sm", "base", "lg", "xl"].map((name) => [name, 16]),
  ...Array.from({ length: 8 }, (_, index) => [`${index + 2}xl`, 24]),
  ["display", 80],
])

// These upstream literals must have a matching, unlayered theme override.
// New application code must use the legal sizes directly.
const UPSTREAM = new Map([
  ["apps/ui/components/ui/button.tsx", "text-[0.8rem]"],
  ["apps/ui/components/ui/toggle.tsx", "text-[0.8rem]"],
  ["apps/ui/components/ui/calendar.tsx", "text-[0.8rem]"],
  ["apps/ui/components/ui/questionnaire.tsx", "text-[0.625rem]"],
  ["apps/1909/components/ui/button.tsx", "text-[0.8rem]"],
  ["packages/ui/src/components/ui/button.tsx", "text-[0.8rem]"],
])

function pixels(value) {
  const literal = String(value)
    .trim()
    .match(/^(\d*\.?\d+)(px|rem)?$/)
  if (!literal) return undefined
  return Number(literal[1]) * (literal[2] === "rem" ? 16 : 1)
}

function legal(value) {
  const clean = String(value)
    .trim()
    .replace(/\s*!important$/, "")
  if (ALLOWED.has(pixels(clean)) || clean === "inherit") return true
  const token = clean.match(/^var\(--text-([\w]+)\)$/)
  return Boolean(token && TOKENS.has(token[1]))
}

export function checkSource(path, source, normalized = new Set()) {
  const errors = []
  function report(offset, value) {
    const line = source.slice(0, offset).split("\n").length
    errors.push(
      `${path}:${line}: illegal font size ${value}; use 14, 16, 24 or 80px`
    )
  }
  function checkUtilities(text, offset = 0) {
    for (const match of text.matchAll(
      /text-\[([^\]]+)\]|text-\(([^)]+)\)|\[font-size:([^\]]+)\]/g
    )) {
      const value = (match[1] ?? match[2] ?? match[3]).replace(/^length:/, "")
      // Arbitrary text colors are not font sizes. Ambiguous variables must
      // use an explicit color hint or one of the theme's text tokens.
      if (
        /^(?:color:|#|(?:rgb|hsl|oklch|oklab|lab|lch|color|color-mix)\(|Canvas(?:Text)?$)/.test(
          value
        )
      )
        continue
      const tokenValue = value.startsWith("--") ? `var(${value})` : value
      if (legal(tokenValue)) continue
      const end = match.index + match[0].length
      const standalone =
        (match.index === 0 || /\s/.test(text[match.index - 1])) &&
        (end === text.length || /\s/.test(text[end]))
      if (
        standalone &&
        UPSTREAM.get(path) === match[0] &&
        normalized.has(match[0])
      )
        continue
      report(offset + match.index, match[0])
    }
  }
  function checkCss(text, offset = 0) {
    // Preserve offsets while removing comments.
    const css = text.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
      comment.replace(/[^\n]/g, " ")
    )
    for (const match of css.matchAll(/@apply\s+([^;{}]+)/g))
      checkUtilities(match[1], offset + match.index)
    for (const match of css.matchAll(
      /(?:font-size|--text-[a-z0-9]+)\s*:\s*([^;{}]+)/g
    )) {
      if (!legal(match[1])) report(offset + match.index, match[1])
    }
    for (const match of css.matchAll(/(?:^|[;{])\s*font\s*:\s*([^;{}]+)/g)) {
      if (match[1].trim() !== "inherit")
        report(offset + match.index, `font shorthand (${match[1]})`)
    }
  }
  if (extname(path) === ".css") {
    checkCss(source)
    return errors
  }
  const file = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  function checkValue(node) {
    if (!node) return
    const value =
      ts.isStringLiteralLike(node) || ts.isNumericLiteral(node)
        ? node.text
        : node.getText(file)
    if (!legal(value)) report(node.getStart(file), value)
  }
  function visit(node) {
    if (
      ts.isStringLiteralLike(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const text = node.text
      checkUtilities(text, node.getStart(file))
      if (text.includes("font-size:") && /[{};]/.test(text))
        checkCss(text, node.getStart(file))
    }
    if (ts.isPropertyAssignment(node)) {
      const name = node.name.getText(file).replace(/["']/g, "")
      if (["fontSize", "font-size"].includes(name)) checkValue(node.initializer)
      if (
        name === "font" &&
        ts.isStringLiteralLike(node.initializer) &&
        /(?:\d(?:px|rem|em|vw|vh|%)\b|^(?:caption|icon|menu|message-box|small-caption|status-bar)$)/.test(
          node.initializer.text
        )
      )
        report(node.getStart(file), `font shorthand (${node.initializer.text})`)
    }
    if (
      ts.isJsxAttribute(node) &&
      ["fontSize", "font-size"].includes(node.name.getText(file))
    ) {
      checkValue(
        node.initializer && ts.isJsxExpression(node.initializer)
          ? node.initializer.expression
          : node.initializer
      )
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(node.left) &&
      node.left.name.text === "fontSize"
    )
      checkValue(node.right)
    ts.forEachChild(node, visit)
  }
  visit(file)
  return [...new Set(errors)]
}

export function checkRepository(root = ROOT) {
  const registry = JSON.parse(
    readFileSync(join(root, "apps/ui/registry.json"), "utf8")
  )
  const theme = registry.items.find((item) => item.name === "theme")
  const errors = []
  const normalized = new Set()
  for (const [name, px] of TOKENS) {
    const actual = theme.css["@theme inline"][`--text-${name}`]
    if (pixels(actual) !== px)
      errors.push(`registry theme: --text-${name} must resolve to ${px}px`)
  }
  function checkRules(rules) {
    for (const [key, value] of Object.entries(rules)) {
      if (typeof value === "object") checkRules(value)
      else if (
        (key === "font-size" || /^--text-[a-z0-9]+$/.test(key)) &&
        !legal(value)
      )
        errors.push(`registry theme: illegal ${key}: ${value}`)
    }
  }
  checkRules(theme.css)
  for (const [selector, rule] of Object.entries(theme.css)) {
    if (!legal(rule["font-size"])) continue
    for (const match of selector.matchAll(/\[class~="(text-\[[^\]]+\])"\]/g))
      normalized.add(match[1])
  }
  for (const literal of new Set(UPSTREAM.values())) {
    if (!normalized.has(literal))
      errors.push(
        `registry theme: missing upstream normalization for ${literal}`
      )
  }
  const ignored = new Set([
    "node_modules",
    ".git",
    ".next",
    ".turbo",
    "out",
    "dist",
    "public",
    "fonts",
    "docs",
  ])
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (/\.(?:[cm]?[jt]sx?|css)$/.test(entry.name))
        errors.push(
          ...checkSource(
            relative(root, path),
            readFileSync(path, "utf8"),
            normalized
          )
        )
    }
  }
  walk(join(root, "apps"))
  walk(join(root, "packages"))
  return errors
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const errors = checkRepository()
  if (errors.length) {
    console.error(errors.join("\n"))
    process.exitCode = 1
  } else
    console.log(
      "Typography OK: only 14, 16, 24 and 80px; upstream literals are normalized by the shared theme."
    )
}
