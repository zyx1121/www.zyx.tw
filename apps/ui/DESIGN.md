# Design system — ui.zyx.tw

> Stock shadcn/ui plus a thin theme, the ElevenLabs way. The registry does not fork base components; it ships only what shadcn doesn't have.

## Philosophy — theme + additions, not a fork

The previous registry maintained its own copies of every primitive (button, input, dialog, ...) on base-ui. That meant owning variants, edge cases, and dark mode for 20+ components. Rebuilt 2026-08: base components now come from stock shadcn/ui (`base-nova` preset) and the CLI owns them. This registry ships exactly two kinds of things:

- **The theme** — full grayscale palette, radius raised to `1rem`. One `registry:theme` item.
- **zyx components** — things shadcn/ui doesn't have (`shimmering-text`, `theme-toggle`). One concept per file.

If shadcn/ui ships a component, we do not re-ship it. If a component needs restyling, that pressure goes into the theme tokens, never into a forked copy.

## Anchor decisions (`app/globals.css`)

- **Base**: shadcn `base-nova` preset (Base UI primitives — shadcn CLI default, actively maintained by the ex-Radix team), `neutral` base color — the stock palette is already zero-chroma grayscale.
- **`--radius: 1rem`** — the one deliberate departure from stock (0.625rem). Buttons read soft-pill, surfaces read friendly. The stock multiplier scale (`sm` 0.6x ... `4xl` 2.6x) derives everything else.
- **Grayscale everywhere** — the only chroma on screen is `--destructive` and content itself. The stock dark `--sidebar-primary` (blue) is overridden to gray.
- **Fonts** — Geist (`--font-sans`) + Geist Mono (`--font-mono`) via `next/font/google`.

The same values ship to consumers as the `theme` registry item. `app/globals.css` and `registry.json`'s `theme` cssVars must stay in sync — that is a manual invariant.

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
