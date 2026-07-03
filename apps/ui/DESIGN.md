# Design system — ui.zyx.tw

> Copy in, own outright. The registry's job is to ship pieces that _already_ feel finished — variants done, edge cases done, dark mode done. If it's not, it doesn't belong in `registry.json` yet.

## Philosophy — small primitives + layout primitives only

This registry **does not ship composite content blocks** (no Hero, no CTA, no Pricing). Those are made-to-fit; every project wants different copy, spacing, action verbs. Ship the lego bricks, let the consumer compose.

What we ship:

- **UI primitives** — `Button`, `Badge`, `Input`, `Card`. One interactive or visual concept per file.
- **Layout primitives** — `Stack`, `Container`, `Surface`. Pure structure / spacing / wrapping. No content slots opinionated beyond `children`.

What we don't ship:

- Hero / CTA / Pricing / Footer sections — too opinionated, consumer's job.
- Data tables / Command palettes — too heavy; pick a focused upstream lib.
- Anything that combines >2 primitives into a fixed shape.

## Anchor tokens (`app/globals.css`)

- `--radius: 1rem` — base radius. All `rounded-*` utilities derive from it. Pronounced enough that buttons read as soft-pill, not Material 4dp.
- `--block: oklch(0.97 0.004 85)` — warm-grey for surface backgrounds. **No border** — separation comes from this color, not a stroke.
- `--block-foreground: var(--foreground)` — text on block bg.

Dark mode pairs (under `.dark`):

- `--block: oklch(0.21 0.004 85)`
- everything else inherits via the existing `.dark` block

## Radius scale

All radius tokens derive from `--radius`. Don't hardcode `rounded-[18px]` — pick from the scale or extend the scale.

| Utility        | Multiplier | px @ `--radius: 1rem` | Use for                                           |
| -------------- | ---------- | --------------------- | ------------------------------------------------- |
| `rounded-sm`   | 0.6×       | 9.6px                 | inline chips                                      |
| `rounded-md`   | 0.8×       | 12.8px                | inputs, small surfaces                            |
| `rounded-full` | —          | pill                  | **buttons + badges** — pill shape, height-defined |
| `rounded-lg`   | 1.0×       | 16px                  | cards                                             |
| `rounded-xl`   | 1.4×       | 22.4px                | **surfaces / layout containers**                  |
| `rounded-2xl`  | 1.8×       | 28.8px                | full-bleed feature surfaces                       |

Buttons/badges (pill) and surfaces (`rounded-xl`) form one visual family — when a button sits inside a surface the corners feel related, not random.

## Smooth corner tokens

Smooth corners are a progressive enhancement, not a replacement for the radius scale.

- `--corner-shape: squircle` — default shape used by `corner-token`.
- `--corner-shape-smooth: squircle` — explicit smooth utility.
- `--corner-shape-superellipse: superellipse(0.72)` — stronger superellipse utility for experiments.

Utilities:

- `corner-token` — applies `corner-shape: var(--corner-shape)` when the browser supports `corner-shape`.
- `corner-smooth` — applies `--corner-shape-smooth`.
- `corner-superellipse` — applies `--corner-shape-superellipse`.

Always pair these with an existing `rounded-*` utility. Browsers without `corner-shape` keep the normal `border-radius`, so the component must still look finished without the enhancement.

## Component contracts

Every item shipped in `registry.json` must satisfy:

1. **Dark variant works** — uses `bg-foreground` / `bg-background` / `bg-block` tokens, never raw `bg-black` / `bg-white`. Toggling `.dark` on `<html>` flips cleanly.
2. **Loading state present** _(async-capable only)_ — interactive components that can trigger async work expose `loading` (or `isPending`) prop. Visual: spinner or skeleton, `aria-busy="true"`, underlying interactive disabled. Static layout primitives are exempt.
3. **No border on surfaces / layout primitives** — they lean on `--block` background for separation. Border on a surface = drift back to Material; resist.
4. **Reduced motion respected** — animations gated by `@media (prefers-reduced-motion: no-preference)` or `motion`'s built-in handling.

If a component can't satisfy 1–4, it lives under `registry/_drafts/` and stays out of `items[]`. Half-finished components are debt; the registry only ships finished ones.

## Item types & locations

| Type             | Path               | Examples                                    | Visual rule                                                                      |
| ---------------- | ------------------ | ------------------------------------------- | -------------------------------------------------------------------------------- |
| `registry:ui`    | `registry/ui/`     | `button.tsx`, `badge.tsx`, `input.tsx`      | small primitives — pill / `rounded-md`                                           |
| `registry:block` | `registry/blocks/` | `surface.tsx`, `stack.tsx`, `container.tsx` | layout primitives — structural only, **no border**, `bg-block` when surface-like |

We don't use `registry:component`. If you reach for it, you're probably about to ship a composite — stop and decompose.

## Adding a new item

1. Drop source at `registry/<type>/<name>.tsx`
2. Append item to `registry.json` (set `type`, `target`, `dependencies`, `registryDependencies: []`)
3. `bun run registry:build` regen `public/r/`
4. Push — Vercel rebuilds + serves

Before flipping to `items[]`: did you walk rules 1–4? If not, ship to `_drafts/` and come back.

## What we explicitly don't do

- **No composite content blocks.** Primitives compose at the call site, not in the registry.
- **No border on surfaces.** Background contrast does the work.
- **No raw hex / rgb in component files.** Always token-via-class. The whole point of `--block`, `--foreground`, etc. is that swapping themes shouldn't require touching component source. _Exception: overlay scrims (Dialog / Sheet / Popover backdrops) use `bg-black/NN` — a scrim must darken the page in **both** themes, so it deliberately does not theme-flip. This is the only sanctioned raw color._
- **No CSS-in-JS.** Tailwind utility classes only. The registry exists to ship plain `.tsx` files that drop into any shadcn project without bringing emotion/styled-components.
- **No `class-variance-authority` unless variants actually justify it.** A 3-variant button doesn't need cva — a `Record<Variant, string>` lookup reads cleaner. Add cva when the variant matrix exceeds ~6 combinations.
