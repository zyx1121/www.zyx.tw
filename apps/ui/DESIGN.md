# Design system — ui.zyx.tw

> Copy in, own outright. The registry's job is to ship pieces that _already_ feel finished — variants done, edge cases done, dark mode done. If it's not, it doesn't belong in `registry.json` yet.

## Philosophy — small primitives + layout primitives only

This registry **does not ship composite content blocks** (no Hero, no CTA, no Pricing). Those are made-to-fit; every project wants different copy, spacing, action verbs. Ship the lego bricks, let the consumer compose.

What we ship:

- **UI primitives** — `Button`, `Badge`, `Input`, `Card`. One interactive or visual concept per file.
- **Layout primitives** — `Stack`, `Corner`, `Container`, `Surface`. Pure structure / spacing / wrapping. No content slots opinionated beyond `children`.

What we don't ship:

- Hero / CTA / Pricing / Footer sections — too opinionated, consumer's job.
- Feature-grade data tables (sorting / pagination / selection) / Command palettes — too heavy; pick a focused upstream lib. The shipped `table` is styling primitives over native `<table>`, not one of these.
- Anything that combines >2 primitives into a fixed shape.

## Anchor tokens (`app/globals.css`)

- `--radius: 1rem` — base radius. All `rounded-*` utilities derive from it. Pronounced enough that buttons read as soft-pill, not Material 4dp.
- `--block: oklch(0.97 0.004 85)` — warm-grey for surface backgrounds. **No border** — separation comes from this color, not a stroke.
- `--block-foreground: var(--foreground)` — text on block bg.

Dark mode pairs (under `.dark`):

- `--block: oklch(0.21 0.004 85)`
- everything else inherits via the existing `.dark` block

## Two stylesheets, one palette

There are two token files and they are not the same file:

| File                    | Who reads it                        | Contents                                                                      |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| `app/globals.css`       | this site                           | the full shadcn token set, because the site is itself a shadcn project        |
| `registry/tokens.css`   | consumers, via `zyxui init`          | self-contained: 8 colors, radius scale, corner utilities, 5 state variants     |

`registry/tokens.css` deliberately drops `--primary` / `--secondary` / `--accent` / `--muted` / `--card` / `--popover` / `--sidebar-*` / `--chart-*`. No component in this registry references them; they exist in `app/globals.css` only because shadcn's own base ships them.

It also replaces `@import "shadcn/tailwind.css"` with the five `@custom-variant` rules the registry actually uses (`data-checked`, `data-disabled`, `data-active`, `data-horizontal`, `data-vertical`), and drops `tw-animate-css` entirely: the only animation utilities in use are Tailwind's own `animate-spin` and `animate-pulse`.

**The eight color values must stay identical between the two files.** Changing `--block` in one and not the other means the site and its consumers drift apart silently. Until the site imports `registry/tokens.css` directly, that is a manual invariant.

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

## Shared vocabulary

The registry reads as one set because every item draws its prop values and its state classes from the same short list. A new item does not get to invent a synonym.

### `variant`

| Value         | Meaning                                        | Who has it     |
| ------------- | ---------------------------------------------- | -------------- |
| `default`     | the primary, filled treatment                  | Button, Badge  |
| `secondary`   | filled but recessive, sits on `bg-block`       | Button, Badge  |
| `outline`     | border only, transparent fill                  | Button, Badge  |
| `ghost`       | no border, no fill, hover tint only            | Button         |
| `destructive` | filled `bg-destructive`, `text-white`          | Button, Badge  |
| `link`        | inline text with `hover:underline`, no box      | Button         |
| `raw`         | escape hatch: no height, no padding, no fill    | Button         |

`raw` is deliberately not shadcn's vocabulary. It exists because icon-only and inline-chrome buttons (`CopyButton`, corner controls) need the semantics and the loading state of `Button` while supplying their own box. Keep it out of new components unless the same need shows up.

### `size`

| Value     | Who has it                            |
| --------- | ------------------------------------- |
| `sm`      | Button, Badge, Input, Textarea        |
| `default` | Button, Badge, Input, Textarea        |
| `lg`      | Button, Badge, Input, Textarea        |
| `icon`    | Button (square, `size-9`, no padding) |

Layout primitives (`Surface`, `Container`) also take `size`, but there it means **width or inset**, not control height. That is the one sanctioned overload.

`Input` shadows the native `size` attribute (a character count nobody uses) via `Omit<..., "size">` so the prop means the same thing across every item.

### State classes

Copy these strings verbatim. Do not paraphrase the opacity or the ring width, and do not extract them into a shared module: registry items must stay standalone files.

| State           | Classes                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------ |
| focus           | `focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none`                  |
| disabled (DOM)  | `disabled:pointer-events-none disabled:opacity-50`                                               |
| disabled (base-ui) | `data-disabled:pointer-events-none data-disabled:opacity-50`                                  |
| disabled (field) | `disabled:cursor-not-allowed disabled:opacity-50`                                               |
| invalid         | `aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40` |

`ring-1` is banned. At `--radius: 1rem` a 1px ring reads as an artifact, not as focus.

Popups (`DialogContent`, `SheetContent`, tooltip / select popups) take `focus-visible:outline-none` and **no ring**. The surface itself receives focus on open, so a ring there is noise; the ring belongs on the controls inside.

### `data-slot`

Every element the consumer might want to target from outside carries `data-slot="<component>"` or `data-slot="<component>-<part>"`, so a project can restyle via `[data-slot="card-header"]` without editing the copied file. Components with a variant matrix also carry `data-variant` and `data-size`.

Naming: the container part is `-content` (`dialog-content`, `sheet-content`, `select-content`, `tooltip-content`), never `-popup` or `-body`.

Exception: `Toaster` wraps sonner's own component, whose props are a closed interface, so it carries no `data-slot`.

## Component contracts

Every item shipped in `registry.json` must satisfy:

1. **Dark variant works** — uses `bg-foreground` / `bg-background` / `bg-block` tokens, never raw `bg-black` / `bg-white`. Toggling `.dark` on `<html>` flips cleanly.
2. **Loading state present** _(async-capable only)_ — interactive components that can trigger async work expose `loading` (or `isPending`) prop. Visual: spinner or skeleton, `aria-busy="true"`, underlying interactive disabled. Static layout primitives are exempt.
3. **No border on surfaces / layout primitives** — they lean on `--block` background for separation. Border on a surface = drift back to Material; resist.
4. **Reduced motion respected** — animations gated by `@media (prefers-reduced-motion: no-preference)` or `motion`'s built-in handling.
5. **Shared vocabulary honoured** — every `variant` / `size` value comes from the tables above, the state classes are copied verbatim, and every targetable element has a `data-slot`. A new synonym (`subtle`, `muted`, `md`, `tiny`) is a review blocker, not a preference.

If a component can't satisfy 1–5, it lives under `registry/_drafts/` and stays out of `items[]`. Half-finished components are debt; the registry only ships finished ones.

## Item types & locations

| Type             | Path               | Examples                                    | Visual rule                                                                      |
| ---------------- | ------------------ | ------------------------------------------- | -------------------------------------------------------------------------------- |
| `registry:ui`    | `registry/ui/`     | `button.tsx`, `badge.tsx`, `input.tsx`      | small primitives — pill / `rounded-md`                                           |
| `registry:block` | `registry/blocks/` | `surface.tsx`, `stack.tsx`, `corner.tsx` | layout primitives — structural only, **no border**, `bg-block` when surface-like |

We don't use `registry:component`. If you reach for it, you're probably about to ship a composite — stop and decompose.

## Adding a new item

1. Drop source at `registry/<type>/<name>.tsx`
2. Append item to `registry.json` (set `type`, `target`, `dependencies`, `registryDependencies: []`)
3. `bun run registry:build` regen `public/r/`
4. Push — Vercel rebuilds + serves

Before flipping to `items[]`: did you walk rules 1–5? If not, ship to `_drafts/` and come back.

## What we explicitly don't do

- **No composite content blocks.** Primitives compose at the call site, not in the registry.
- **No border on surfaces.** Background contrast does the work.
- **No raw hex / rgb in component files.** Always token-via-class. The whole point of `--block`, `--foreground`, etc. is that swapping themes shouldn't require touching component source. _Exception: overlay scrims (Dialog / Sheet / Popover backdrops) use `bg-black/NN` — a scrim must darken the page in **both** themes, so it deliberately does not theme-flip. Second exception: text on saturated status colors (`text-white` on `bg-destructive`) — the red stays saturated in both themes, so its text doesn't flip either. These two are the only sanctioned raw colors._
- **No CSS-in-JS.** Tailwind utility classes only. The registry exists to ship plain `.tsx` files that drop into any shadcn project without bringing emotion/styled-components.
- **No `class-variance-authority` unless variants actually justify it.** Two flat `Record<Variant, string>` / `Record<Size, string>` lookups read cleaner than a cva config and add no dependency, however long the lists get. The threshold is not a count: reach for cva only when you need **compound variants**, meaning a class that depends on `variant` and `size` together. Button carries 7 variants and 4 sizes on plain records precisely because none of them interact.
