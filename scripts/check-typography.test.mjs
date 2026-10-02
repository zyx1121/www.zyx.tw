import assert from "node:assert/strict"
import test from "node:test"
import { checkSource } from "./check-typography.mjs"

test("Made keeps only three sizes across CSS, tokens and inline styles", () => {
  const css = "apps/web/app/made/made.css"
  const component = "apps/web/components/carrel-story.tsx"
  assert.deepEqual(
    checkSource(
      css,
      "h1 { font-size: 24px; } p { font-size: 16px; } small { font-size: 14px; }"
    ),
    []
  )
  for (const value of ["80px", "5rem", "var(--text-display)"])
    assert.ok(checkSource(css, `h1 { font-size: ${value}; }`).length)
  for (const utility of [
    "text-display",
    "md:text-display",
    "text-[80px]",
    "text-(--text-display)",
  ])
    assert.ok(
      checkSource(component, `const title = <h1 className="${utility}" />`)
        .length
    )
  assert.ok(
    checkSource(component, "const title = <h1 style={{ fontSize: 80 }} />")
      .length
  )
})

test("accepts all four sizes, inherited text and color utilities", () => {
  assert.deepEqual(
    checkSource(
      "app.tsx",
      `const view = <p className="text-[14px] text-[1rem] text-[1.5rem] text-[80px] text-[CanvasText] text-[color:var(--accent)]" style={{ fontSize: 16 }} />`
    ),
    []
  )
  assert.deepEqual(
    checkSource(
      "app.css",
      `p { font-size: inherit; } code { font-size: 0.875rem; }`
    ),
    []
  )
})

test("rejects arbitrary and responsive sizes", () => {
  for (const size of [
    "12px",
    "18px",
    "1.25rem",
    "0.875em",
    "clamp(3rem,12vw,18rem)",
    "var(--custom-size)",
  ]) {
    assert.ok(
      checkSource("app.tsx", `const view = <p className="sm:text-[${size}]" />`)
        .length,
      size
    )
  }
})

test("rejects CSS, SVG and inline style escape hatches", () => {
  assert.ok(checkSource("app.css", `p { font-size: 13px; }`).length)
  assert.ok(checkSource("app.css", `p { @apply text-[18px]; }`).length)
  assert.ok(checkSource("app.css", `p { font: 18px/1.5 sans-serif; }`).length)
  assert.ok(checkSource("app.css", `@theme { --text-xs: .75rem; }`).length)
  assert.ok(
    checkSource("app.tsx", `const view = <text fontSize={18} />`).length
  )
  assert.ok(
    checkSource("app.tsx", `const style = { fontSize: "0.875em" }`).length
  )
  assert.ok(
    checkSource("app.tsx", `const style = { font: "18px sans-serif" }`).length
  )
  assert.ok(checkSource("app.tsx", `element.style.fontSize = "13px"`).length)
  assert.ok(
    checkSource("app.tsx", `const view = <p className="[font-size:13px]" />`)
      .length
  )
})

test("upstream literals require a theme override and cannot spread into app code", () => {
  const source = `const sizes = { sm: "text-[0.8rem]" }`
  const normalized = new Set(["text-[0.8rem]"])
  assert.ok(checkSource("apps/ui/components/ui/button.tsx", source).length)
  assert.deepEqual(
    checkSource("apps/ui/components/ui/button.tsx", source, normalized),
    []
  )
  assert.ok(
    checkSource("apps/ui/components/custom.tsx", source, normalized).length
  )
  for (const utility of ["md:text-[0.8rem]", "text-[0.8rem]/5"]) {
    assert.ok(
      checkSource(
        "apps/ui/components/ui/button.tsx",
        `const size = "${utility}"`,
        normalized
      ).length
    )
  }
})
