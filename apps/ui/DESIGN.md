# Design system — ui.zyx.tw

> Stock shadcn/ui plus a thin theme, the ElevenLabs way. The registry does not fork base components; it ships only what shadcn doesn't have.

## Philosophy — theme + additions, not a fork

The previous registry maintained its own copies of every primitive (button, input, dialog, ...) on base-ui. That meant owning variants, edge cases, and dark mode for 20+ components. Rebuilt 2026-08: base components now come from stock shadcn/ui (`base-nova` preset) and the CLI owns them. This registry ships exactly two kinds of things:

- **The theme**: full grayscale palette, stock radius, pure black dark mode. One `registry:theme` item.
- **zyx components** — things shadcn/ui doesn't have (`shimmering-text`, `theme-toggle`). One concept per file.

If shadcn/ui ships a component, we do not re-ship it. If a component needs restyling, that pressure goes into the theme tokens, never into a forked copy.

## Anchor decisions (`app/globals.css`)

- **Base**: shadcn `base-nova` preset (Base UI primitives — shadcn CLI default, actively maintained by the ex-Radix team), `neutral` base color — the stock palette is already zero-chroma grayscale.
- **`--radius: 0.625rem`**: stock. The stock multiplier scale derives the rest: `sm` 6px, `md` 8px, `lg` 10px, `xl` 14px, `2xl` 18px.
- **Grayscale everywhere** — the only chroma on screen is `--destructive` and content itself. The stock dark `--sidebar-primary` (blue) is overridden to gray.
- **Dark first, pure black**: every app starts dark (`defaultTheme="dark"`, `enableSystem={false}`), whatever the OS prefers; the theme toggles and the `d` hotkey still switch to light. Dark `--background` is `oklch(0 0 0)`. Apart from `--muted-foreground` and the gray sidebar primary pair, the other dark tokens stay stock.
- **Muted text at 4.5:1**: in both themes `--muted-foreground` must reach at least 4.5:1 (WCAG AA) on `--background`, `--card`, `--popover`, `--muted`, `--accent` and `--secondary`; light `oklch(0.54 0 0)` (#6e6f6f) gives 5.04:1 on white and 4.62:1 on #f5f5f5, dark `oklch(0.65 0 0)` (#8f8f8f) gives 6.49:1 on black, 5.54:1 on #171717 and 4.68:1 on #262626.
- **Fonts**: `--font-sans` is Inter, then Noto Sans JP, then Noto Sans TC, then the system stack. Inter 4.1 is self-hosted from rsms/inter with `next/font/local`, because the Google Fonts build lacks `ss01` and `zero`. It is subset to Latin (the Google Fonts `latin` range plus arrows and keyboard symbols; the command is in `packages/ui/src/fonts/README.md`), so Latin Extended characters fall back to the metric-adjusted Arial face. Only the upright file is preloaded; the italic loads on first use. `--font-mono` is Geist Mono, for code only. Numbers use Inter with `tabular-nums`.
- **Japanese forms first**: Noto Sans JP comes before Noto Sans TC, so Han characters take Japanese glyph shapes and punctuation. Noto Sans TC fills the characters JP lacks (such as 值 and 夠), so they stay in the same Source Han design instead of falling back to a system font. Both load from `next/font/google` as unicode-range slices (124 for JP, 105 for TC) with `preload: false`, so a page downloads only the slices its text uses.
- **OpenType features**: `--default-font-feature-settings: "liga" 1, "calt" 1, "ss01" 1, "zero" 1` turns on Inter's open digits and slashed zero on every page. Geist Mono and the Noto fonts have neither feature, so they render unchanged.

The same color and radius values ship to consumers as the `theme` registry item. The `:root` and `.dark` tokens in `app/globals.css`, `packages/ui/src/styles/globals.css`, `apps/1909/app/globals.css` and the `theme` item in `registry.json` must match; `bun run theme:check` enforces it in CI. Fonts are not in the registry item: apps load them with next/font from `packages/ui/src/lib/fonts.ts` (this app and `apps/1909` keep their own `lib/fonts.ts`).

## Component contracts (zyx components only)

Base components are stock; these rules bind only what we add under `registry/ui/`:

1. **Token-driven** — colors come from shadcn tokens (`--foreground`, `--muted-foreground`, ...), never raw hex. Dark mode must flip cleanly.
2. **Zero or minimal dependencies** — prefer CSS-only (`shimmering-text` animates with a keyframe, not framer-motion). A dependency needs to earn its install.
3. **Reduced motion respected** — animations behind `motion-safe:`.
4. **`data-slot`** on the root element so consumers can target it from outside.
5. **Standalone file** — a registry item must drop into any shadcn project without sibling imports (registry deps declared in `registry.json`).

## Adding a new item

Only if shadcn/ui doesn't have it:

1. Drop source at `registry/ui/<name>.tsx`
2. Append item to `registry.json` (declare `dependencies` / `registryDependencies`; keyframes go in the item's `css` field, mirrored into `app/globals.css` for this site)
3. `bun run registry:build` regen `public/r/`
4. Push — Vercel rebuilds + serves

## What we explicitly don't do

- **No forked base components.** `components/ui/` is CLI-owned; edits there get overwritten by the next `shadcn add`.
- **No composite content blocks** (Hero / CTA / Pricing). Primitives compose at the call site.
- **No CSS-in-JS.** Tailwind utilities only.
- **No color in chrome.** Grayscale palette; color belongs to content.
