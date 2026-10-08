// Everything visual must come from the base tokens (apps/ui/DESIGN.md). This
// rejects the ways around them: sizes outside text-display / title / body /
// caption, radii outside the concentric scale, removed color tokens, Tailwind
// palette colors, color literals, inline styles, raw font sizes, arbitrary
// values and stray durations. Page code (outside packages/ui's components)
// also may not draw layer-2 surfaces.
import { readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"

const root = new URL("..", import.meta.url).pathname
const scanned = [
  "apps/1909",
  "apps/3d",
  "apps/good",
  "apps/link",
  "apps/stamp",
  "apps/time",
  "apps/ui",
  "apps/web",
  "packages/ui/src",
]
const skippedDirs = new Set([
  "node_modules",
  ".next",
  "out",
  "public",
  ".turbo",
  "fonts",
])

// Files that render content rather than chrome, each with its reason. A
// rule is waived only for the file named here, never for a directory.
const exempt = {
  // The stylesheet defines the tokens themselves.
  "packages/ui/src/styles/globals.css": "all",
  // Open Graph images render through Satori, which takes inline styles and
  // literal colors, not Tailwind classes or CSS variables.
  "packages/ui/src/components/og-image.tsx": "all",
  "apps/ui/app/opengraph-image.tsx": "all",
  // The GitHub contribution grid is data: one cell per day, laid out by
  // inline grid columns and drawn at fixed 10px cells.
  "packages/ui/src/components/status.tsx": ["inline style", "arbitrary value"],
  // The 3D stage's background comes from the exported scene, at runtime.
  "apps/web/app/page.tsx": ["inline style"],
  "apps/web/app/layout.tsx": ["inline style"],
  "apps/3d/components/editor-loader.tsx": ["color literal", "arbitrary value"],
  // Each product's mark is its own SVG from PRODUCTS (lib/made.ts), passed
  // as a mask URL.
  "apps/web/components/made-experience.tsx": ["inline style"],
  // Each preview image is framed on its own focal point from projects.json.
  "apps/web/components/preview-stage.tsx": ["inline style"],
  // The Made campaign pages lay paper tones matched to their photographs
  // under the text; they are part of the artwork, not chrome.
  "apps/web/app/made/made.css": ["color literal"],
  "apps/web/app/made/carrel/carrel.css": ["color literal"],
  // Stamp's seal is the product's mark: vermilion ink and glyphs sized in
  // the seal's own SVG units, the same in both themes.
  "apps/stamp/components/seal.tsx": ["color literal", "raw font size"],
  // Loki waived the type scale for Stamp's campaign page (2026-10-08): each
  // screen says one thing, set large.
  "apps/stamp/app/stamp.css": ["raw font size"],
  // Plump's printed outline is exported into a downloadable SVG file.
  "apps/web/lib/plump.ts": ["color literal"],
}

const palette =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white"
const colorUtilities =
  "bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent|shadow"

const classRules = [
  {
    name: "size outside the scale",
    regex: /\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b/g,
  },
  // Arbitrary values such as rounded-[10px]; arbitrary variants such as
  // data-[state=open]: or group-data-[state=open]/name: end in ":" or "/"
  // and stay allowed.
  {
    name: "arbitrary value",
    regex: /(?<![\w-])-?[a-z][\w-]*-\[[^\]\s]+\](?![:/\]])/g,
  },
  // rounded-control / -menu / -surface / -full / -none only.
  {
    name: "radius outside the scale",
    regex:
      /\brounded(?:-(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee))?(?:-(?:xs|sm|md|lg|xl|[2-4]xl))?(?![\w-])/g,
  },
  {
    name: "palette color",
    regex: new RegExp(`\\b(?:${colorUtilities})-(?:${palette})\\b`, "g"),
  },
  // secondary, accent, card and popover duplicated other colors, charts use
  // the existing colors, and there is no sidebar in the two-layer model.
  {
    name: "removed color token",
    regex:
      /(?:\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|divide|shadow|decoration|placeholder|caret)-|--color-|var\(--)(?:secondary|accent|card|popover|sidebar|chart)(?![\w])(?:-[\w-]+)?/g,
  },
  // Motion is duration-state and duration-overlay (DESIGN.md, Motion);
  // page entrances use tw-animate-css, whose own durations stay allowed.
  { name: "stray duration", regex: /(?<![\w-])(?:duration|delay)-\d+\b/g },
]

const sourceRules = [
  {
    name: "color literal",
    regex: /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/g,
  },
  { name: "inline style", regex: /\bstyle=\{/g },
  // CSS takes radii from the same scale: var(--radius) is rounded-control.
  {
    name: "radius outside the scale",
    regex: /var\(--radius-(?!control\b|menu\b|surface\b)[\w-]+\)/g,
  },
  // CSS may only name the scale: font-size: var(--text-body).
  {
    name: "raw font size",
    regex:
      /\bfont-size\s*:(?!\s*var\(--text-(?:display|title|body|caption)\))|\bfontSize\b/g,
  },
]

// Layer 1 (the page) groups by spacing and dividers only.
const pageRules = [
  { name: "shadow on a page", regex: /(?<![\w-])shadow(?:-[\w/]+)?(?![\w-])/g },
  {
    name: "frame on a page (use spacing or border-t / border-b)",
    regex: /(?<![\w-])border(?:-[xy])?(?![\w-])/g,
  },
]

const componentRoot = "packages/ui/src/components/ui/"

async function* files(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  for (const entry of entries) {
    if (skippedDirs.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* files(path)
    else if (/\.(tsx?|css)$/.test(entry.name) && !entry.name.endsWith(".d.ts"))
      yield path
  }
}

let failures = 0
for (const dir of scanned) {
  for await (const path of files(join(root, dir))) {
    const file = relative(root, path)
    const waived = exempt[file]
    if (waived === "all") continue
    const isComponent = file.startsWith(componentRoot)
    const rules = [
      ...classRules,
      ...sourceRules,
      ...(isComponent || !file.endsWith(".tsx") ? [] : pageRules),
    ].filter(({ name }) => !waived?.includes(name))
    const lines = (await readFile(path, "utf8")).split("\n")
    lines.forEach((line, index) => {
      if (/^\s*(?:\/\/|\*|\/\*)/.test(line)) return
      for (const { name, regex } of rules) {
        for (const match of line.matchAll(regex)) {
          console.error(`${file}:${index + 1}: ${name}: ${match[0]}`)
          failures++
        }
      }
    })
  }
}

if (failures) {
  console.error(`\n${failures} uses outside the tokens`)
  process.exit(1)
}
console.log("everything uses the tokens")
