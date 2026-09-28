# Design system: ui.zyx.tw

> Stock shadcn/ui plus a thin theme, the ElevenLabs way. The registry does not fork base components; it ships only what shadcn doesn't have.

This file is the design contract for the zyx.tw apps: the theme and the components this registry ships, and the rules for laying out, animating and writing a page. The theme, font and color rules and the four corners (Layout) bind every app. The other page rules (Layout, Radius, Lines, Optical alignment, Motion, Typography, Content, Agent surfaces) bind ui.zyx.tw and www.zyx.tw; the tool apps (link, time, good, 3d, 1909) adopt them when they are next rebuilt. The layout and motion rules, and the `scramble-text`, `rotating-text`, `mask-reveal`, `ask-ai` and `hdr-highlight` items, were learned by studying sota.design in September 2026; no code or assets were copied.

## Philosophy: theme plus additions, not a fork

The previous registry maintained its own copies of every primitive (button, input, dialog, ...) on base-ui. That meant owning variants, edge cases, and dark mode for 20+ components. Rebuilt 2026-08: base components now come from stock shadcn/ui (`base-nova` preset) and the CLI owns them. This registry ships exactly two kinds of things:

- **The theme**: full grayscale palette, stock radius, pure black dark mode, frosted overlays. One `registry:theme` item.
- **zyx components**: things shadcn/ui doesn't have (`shimmering-text`, `theme-toggle`, `scramble-text`, `rotating-text`, `mask-reveal`, `ask-ai`, `hdr-highlight`). One concept per file.

If shadcn/ui ships a component, we do not re-ship it. If a component needs restyling, that pressure goes into the theme tokens, never into a forked copy.

## Anchor decisions (`app/globals.css`)

- **Base**: shadcn `base-nova` preset (Base UI primitives: the shadcn CLI default, actively maintained by the ex-Radix team) and the `neutral` base color, because the stock palette is already zero-chroma grayscale.
- **`--radius: 0.625rem`**: stock. The stock multiplier scale derives the rest: `sm` 6px, `md` 8px, `lg` 10px, `xl` 14px, `2xl` 18px.
- **Grayscale everywhere**: the only chroma on screen is `--destructive` and content itself. The stock dark `--sidebar-primary` (blue) is overridden to gray.
- **Dark first, pure black**: every app server-renders `<html class="dark">` and starts dark (`defaultTheme="dark"`, `enableSystem={false}`), whatever the OS prefers, so the first paint and pages without JavaScript are dark too. Light stays one step away: the toggle on www and ui.zyx.tw, and the `d` hotkey in every app except ui.zyx.tw. Dark `--background` is `oklch(0 0 0)`. Apart from `--muted-foreground` and the gray sidebar primary pair, the other dark tokens stay stock.
- **Muted text at 4.5:1**: in both themes `--muted-foreground` must reach at least 4.5:1 (WCAG AA) on `--background`, `--card`, `--popover`, `--muted`, `--accent` and `--secondary`; light `oklch(0.54 0 0)` (#6e6f6f) gives 5.04:1 on white and 4.62:1 on #f5f5f5, dark `oklch(0.65 0 0)` (#8f8f8f) gives 6.49:1 on black, 5.54:1 on #171717 and 4.68:1 on #262626.
- **Frosted overlays**: dialogs, alert dialogs, sheets and drawers sit over a transparent overlay with a 12px backdrop blur instead of stock's 10% black. It is one unlayered rule on the overlays' `data-slot`, in every globals.css and in the registry theme's `css`, so the stock components stay unforked; browsers without `backdrop-filter` keep the stock tint.
- **Fonts**: `--font-sans` is Inter, then Noto Sans JP, then Noto Sans TC, then the system stack. Inter 4.1 is self-hosted from rsms/inter with `next/font/local`, because the Google Fonts build lacks `ss01` and `zero`. It is subset to Latin (the Google Fonts `latin` range plus arrows and keyboard symbols; the command is in `packages/ui/src/fonts/README.md`). Latin Extended letters render in whatever fallback the platform has (Arial, Noto Sans JP or the system font); static site content has none. Only the upright Inter file is preloaded; the italic and Geist Mono load on first use. `--font-mono` is Geist Mono, for code only. Numbers use Inter with `tabular-nums`.
- **Japanese forms first**: Noto Sans JP comes before Noto Sans TC, so Han characters take Japanese glyph shapes and punctuation. Noto Sans TC fills the characters JP lacks (such as 值 and 夠), so they stay in the same Source Han design instead of falling back to a system font. Both load from `next/font/google` as unicode-range slices (124 for JP, 105 for TC) with `preload: false`, so a page downloads only the slices its text uses.
- **OpenType features**: `--default-font-feature-settings: "liga" 1, "calt" 1, "ss01" 1, "zero" 1` turns on Inter's open digits and slashed zero on every page. Geist Mono and the Noto fonts have neither feature, so they render unchanged.

The same color and radius values, and the overlay rule, ship to consumers as the `theme` registry item. The `:root` and `.dark` tokens and the overlay rule in `app/globals.css`, `packages/ui/src/styles/globals.css`, `apps/1909/app/globals.css` and the `theme` item in `registry.json` must match; `bun run theme:check` enforces it in CI. Fonts are not in the registry item: apps load them with next/font from `packages/ui/src/lib/fonts.ts` (this app and `apps/1909` keep their own `lib/fonts.ts`).

## Layout

A page is one centered column on a 4px grid, framed by the four corners of the viewport, and the spacing between its parts moves in steps of 20px.

- **4px grid**: every spacing, size and line height is a multiple of 4px (Tailwind's `--spacing` is 0.25rem). Half steps of 2px are for optical corrections and the inside of controls only, such as a pill's 10px padding or a 6px icon gap.
- **20px module**: spacing between page parts is a multiple of 20px: gutters `px-5` (20px), corner insets (20px), demos `gap-15` (60px), groups `gap-20` (80px), hero to content `pb-25` (100px), the top of the page to the title `pt-30` (120px). Inside a part, the 4px grid rules (12px from a title to its subtitle).
- **Four corners**: the chrome of every app is four fixed corners, 20px in from the viewport's corners, with 16px between items. Top left is always the zyx mark (to www.zyx.tw; to `/` on www.zyx.tw itself), which mirrors itself left to right on hover. Top right holds the page nav and the page's function buttons. Bottom left is Privacy and Terms and nothing else: every app shares them at www.zyx.tw (`LegalLinks`, labelled in the app's language). Bottom right is the copyright. All four set `text-sm` on 20px lines (14px at every width), so they share one size and one row height. They come from `@workspace/ui/components/corners` (`TopCorners`, `BottomCorners`, `Corner`, `CornerTip`, `cornerLink`, `LegalLinks`); an app leaves a corner empty rather than filling it with something else. An app's own working surface is content, not chrome: the 3d editor's dock of editing controls stays at the bottom center of its canvas.
- **Corner tips**: an item in a corner can carry a tip, the stock tooltip on hover (and on keyboard focus for a link or button), which says what its label leaves out: where the mark goes, whose the copyright is, what a page holds, which sites a policy covers. A tip never restates a text label, and an item whose label says it all has none; an icon's tip says what it does or where it goes. Tips open at once, toward the page (below the top corners, above the bottom ones) and lined up with the item's outer edge, so they never leave the viewport. Touch never opens them, so nothing depends on one. Wrap the item in `CornerTip`, and the corner it sits in sets the side; the mark, the copyright and `LegalLinks` bring their own (`markTip`, `copyrightTip`, `tips`), and www.zyx.tw's own Privacy and Terms reuse `LEGAL_TIPS`.
- **One column**: `mx-auto w-full max-w-xl px-5 lg:max-w-3xl 2xl:max-w-5xl`, so 576, 768 and 1024px wide with 20px gutters (`column` in `lib/layout.ts`). Content sits in it and the corners sit outside it. Long-form prose narrows further, to at most `max-w-[65ch]`.
- **Skeleton**:

  | Part                  | Value                                               | Classes                           |
  | --------------------- | --------------------------------------------------- | --------------------------------- |
  | Corners               | 20px from each viewport corner, 16px between items  | `TopCorners`, `BottomCorners`     |
  | Top of page to title  | 120px, 80px under the top corners                   | `pt-30` on `<main>`               |
  | Title, subtitle       | 12px apart                                          | `mt-3`                            |
  | Hero to content       | 100px                                               | `pb-25`                           |
  | Content to the bottom | 100px, 60px clear of the bottom corners | `pb-25` on `<main>` |

- **The corners stay put**: they are fixed, so they stay in the corners while the page scrolls. Where content scrolls under them, the background color fades out over 64px from the top and bottom edges (`fade`), so no text runs into theirs. Pages that fill the viewport without scrolling (link, time, good, 3d and the www.zyx.tw home) leave the fade off.
- **No menu button**: the nav stays short enough to fit a 320px viewport beside the mark, so phones show it as it is, with no hamburger and no drawer. Privacy and Terms go bottom left.
- **Stable gutter**: the site's own `<html>` sets `scrollbar-gutter: stable`, so the centered column stays put when a page gains or loses its scrollbar. One edge only: a left gutter would put the left corners 20px in from the gutter instead of from the window's edge. Tool apps that fill the viewport (`w-dvw`, `fixed inset-0`) leave it off.
- **Breakpoint transitions**: the column's width eases between breakpoints (`motion-safe:transition-[max-width] motion-safe:duration-300`), and so does the body text size (`motion-safe:transition-[font-size] motion-safe:duration-300` on `<body>`). They are the only motion of ours that reflows the page, for 300ms when the viewport crosses a breakpoint.
- **Mobile size-up**: below `sm`, body text is 20px on 28px lines (`text-xl`) instead of 16px on 24px (`sm:text-base`), and icon buttons such as the theme toggle stay 32px at every width. Corner text stays 14px at every width. Spacing is the same at every width.
- **Rows are exactly their content's height**: a control alone on its row sits in a flex or block box, never in a line box, where baseline alignment grows a 24px pill's row to 26px.

## Radius

- **The stock scale only**: `--radius` is 0.625rem; use its steps (`rounded-sm` 6px, `rounded-md` 8px, `rounded-lg` 10px, `rounded-xl` 14px, `rounded-2xl` 18px), not arbitrary radii. Cards are `rounded-lg`.
- **Concentric**: a surface that wraps rounded children at a small inset takes outer radius = inner radius + padding. The ask-ai menu is `rounded-2xl` (18px) with `p-1` (4px) around `rounded-xl` (14px) items. Once the padding reaches the inner radius, the shapes read as separate and the rule no longer binds, as in a `rounded-lg p-5` card.
- **An item's radius is at most half its height**: past that the browser scales the corners down and the concentric sum breaks (on a 24px item, 14px becomes 12px). Items with a 14px radius are at least 28px tall (`min-h-7`).
- **Pills without `rounded-full`**: a pill takes a scale step larger than half its height, which the browser draws as a capsule. The ask-ai pill is `rounded-2xl` (18px) on a 24 or 32px control. Our code never uses `rounded-full` for a pill; true circles inside stock components (avatar, radio, switch thumb) stay as shipped.

## Lines

- **Only where they carry meaning**: a visible line bounds a surface (a card, a menu) or separates groups (a menu separator). No decorative rules, and no lines between rows that spacing already separates.
- **White at 10%**: a line is 1px of `--border` (white at 10% in dark, its stock counterpart in light) or the stock `ring-foreground/10` on popups. A separator inside a menu, whose items already form the groups, may drop to 5% (`bg-foreground/5`, as in `ask-ai`).
- **Transparent borders reserve focus space**: a control keeps a 1px `border-transparent` that its focus state colors, so focusing moves nothing (the stock `button` does this). Links draw an outline with an offset instead.

## Optical alignment

- **Offsets live at the call site**: they depend on the surrounding layout, so they go in the caller's `className`, never inside a component (component contract 6).
- **Pills pull out**: `-ml-1` on the pill's wrapper starts the pill box 4px left of the text column. With its 1px transparent border and `bg-clip-padding`, the visible edge sits 3px out, which reads as flush with the text.
- **The trailing icon side is 2px tighter**: a control with an icon at its end takes 2px less padding on that side (the stock `has-data-[icon=inline-end]:pr-2` on a `px-2.5` button; the ask-ai pill's `pl-3 pr-2.5`, then `sm:pl-2.5 sm:pr-2`), because an icon leaves more air than a letter.
- **Separators span the menu**: a separator inside a `p-1` menu takes `-mx-1`, so it meets both edges of the popup (the stock `dropdown-menu` separator does).
- **Right edges align**: right-aligned labels (install commands, years) and cards end on the column's right edge; the top and bottom right corners end 20px from the viewport's. An icon button in a text row takes its icon inset back on every side (`-m-2` on a 32px button with a 16px icon), so layout sees only the icon: it meets the edge and keeps the row's gaps and height (the theme toggle in the top right corner does this).
- **Menus follow their trigger**: a menu opens 4px under its trigger with the same start edge (`align="start"`), so an offset pill carries its menu along.

## Motion

- **CSS first**: keyframes and transitions, no animation library. A script drives an animation only where CSS cannot express it, such as the per-character glyphs of `scramble-text` and the word timing of `rotating-text`.
- **Inventory**:

  | Motion                       | Timing                                                      | Where                             |
  | ---------------------------- | ----------------------------------------------------------- | --------------------------------- |
  | Enter fade                   | opacity 0 to 1 over 300ms, `ease-out`, rows 25ms apart      | page rows, through tw-animate-css |
  | Scramble                     | one character every 50ms, left to right (12 in about 600ms) | `scramble-text`, the page title   |
  | Rotating word                | a new word every 3.2s                                       | `rotating-text`                   |
  | Mask sweep                   | starts after 1s, runs 5s, `cubic-bezier(.16,1,.3,1)`        | `mask-reveal`                     |
  | Mark mirror                  | flips left to right over 300ms, stock easing                | the zyx mark, on hover            |
  | Shimmer                      | a 2s linear loop                                            | `shimmering-text`                 |
  | HDR fade back                | 2s after hover or focus ends                                | `hdr-highlight`                   |
  | Breakpoints                  | width and text size over 300ms                              | the column, `<body>`              |
  | Menus, dialogs, sheets, tips | the stock tw-animate-css timings                            | stock components                  |

- **Stagger**: rows fade in 25ms apart in document order, counting the top corners as row 0: the title at 25ms, the subtitle at 50ms, then each group heading and each demo. The bottom corners come in at 375ms. Delays go through tw-animate-css's `--tw-animation-delay` (`enterDelay` in `lib/layout.ts`), never `delay-*`, which would also delay transitions.
- **Easing**: `ease-out` for entrances, the stock `cubic-bezier(.4,0,.2,1)` for state changes, `cubic-bezier(.16,1,.3,1)` for the mask sweep.
- **Pages do not animate out**: a new page replaces the old one and its rows fade in.
- **Entrances never move layout**: entrances and running animations change opacity, masks, transforms and color only. `rotating-text` reserves its widest word and `scramble-text` keeps its final text in flow, so CLS stays 0. The breakpoint transitions are the only motion of ours that reflows the page.
- **Reduced motion covers every animation**: our CSS animations and movement transitions sit behind `motion-safe:` (or `prefers-reduced-motion: no-preference`), and scripted ones read `prefers-reduced-motion` before they start. Under `reduce`, content shows at once in its final state: no fade, no mask, no scramble, no auto-rotation, no breakpoint easing, and the mark mirrors without turning. Stock components animate through tw-animate-css without `motion-safe:`, and `components/ui/` is CLI-owned, so the site's `globals.css` also cuts every animation and transition to 1ms under `prefers-reduced-motion: reduce` (1ms rather than 0 keeps the end events Base UI waits for). That guard is also what stops the unprefixed color transitions on links.

## Typography

- **Two weights**: 400 for all the text we set, headings included; 500 only where stock components set it (buttons, labels, badges, table heads). Bold never makes hierarchy.
- **Hierarchy by size and gray**: sizes come from the Tailwind scale at 12, 14, 16, 20, 24 and 30px (`text-xs` to `text-3xl`). The page title is `text-3xl`, a group heading `text-2xl`, and body text and item titles take the body size. Secondary text is `text-muted-foreground`, never a lighter weight.
- **Numbers**: `tabular-nums` wherever digits line up or change: years, counts, tables, pagination, timers. Inter's open digits (`ss01`) and slashed zero (`zero`) are on everywhere.
- **The CJK chain**: Inter for Latin, then Noto Sans JP and Noto Sans TC for CJK, and Geist Mono for code only (install commands, file names, tokens); brand names and numbers stay in Inter. The subsets and loading rules are in Anchor decisions.
- **Real styles only**: bold and italic come from the variable font files (Inter's upright and italic, the Noto weight axes), never from browser synthesis. CJK text is never set in italic.

## Color

- **Grayscale chrome**: headers, nav, cards, menus and text use the gray tokens only. The only chroma is `--destructive` and content itself, such as photos, 3D scenes and syntax colors.
- **Pure black dark by default**: dark `--background` is `oklch(0 0 0)`, and every app starts dark.
- **The contrast rule**: body text is `--foreground`, and secondary text is `--muted-foreground`, which reaches at least 4.5:1 on every surface in both themes (Anchor decisions has the ratios). Readable text never goes below it, so no `text-muted-foreground/50` and no lighter gray; disabled controls are the only exception.
- **Tokens, not hex**: chrome takes its colors from shadcn tokens through utilities (`text-muted-foreground`, `border-border`); raw values live only in the theme.

## Content

- **English UI copy**: the public zyx.tw sites write their interface in English (`lang="en"`). An app written for Chinese readers, such as `1909` (`lang="zh-TW"`), writes its UI in Chinese and follows the CJK rules below.
- **Spaces between CJK and Latin**: put a space between CJK text and Latin letters or digits (`使用 shadcn/ui 的元件`, `共 7 個元件`), but not next to full-width punctuation.
- **Full-width CJK punctuation**: CJK sentences take full-width marks (`，。：；！？「」（）`); Latin sentences take half-width ones.
- **Short declarative sentences**: one idea per sentence, in the present tense. Say what a thing does, not what it might do.
- **One form of address**: "you" in English; in Chinese, a site picks 你 or 您 and keeps it.
- **No em dashes**: use a colon, a comma, a period or parentheses.

## Agent surfaces

Every zyx.tw site is written for people and for agents. A static export (`output: "export"`) has no server to answer `Accept: text/markdown`, so each surface is a file at its own URL, and `vercel.json` adds the headers.

- **Markdown for every content page**: `/index.md` for the home page and `<path>.md` for the others, built from the same data as the HTML by route handlers with `dynamic = "force-static"`. Each starts with YAML front matter (`site`, `url`, `title`, `description`). Agents find it through the `Link` header and the `<link rel="alternate">` in the head; the page shows no link to it.
- **`/llms.txt`**: an H1, a one-paragraph summary, "When to use", "How an agent should use it" as numbered steps, and Markdown links to the Markdown pages ([llmstxt.org](https://llmstxt.org)).
- **`/agent-instructions.md`**: when to use the site and when not to, the call order, and the rules an agent must follow, including that the index is complete, so nothing else may be invented.
- **Link headers**: the HTML for `/` answers with `Link: </llms.txt>; rel="describedby", </index.md>; rel="alternate"; type="text/markdown"`, and `<head>` repeats the alternate (`alternates.types` in the page metadata). Markdown is served as `text/markdown; charset=utf-8`, and `llms.txt` as `text/plain; charset=utf-8`.
- **JSON-LD**: one script says what the site is (`WebSite`) and what it offers (`SoftwareSourceCode` for a registry, `Person` for a profile), with `<` escaped.
- **robots.txt and sitemap.xml**: robots allows everything and names the sitemap; the sitemap lists the HTML pages, since their Markdown versions are alternates, not extra pages.
- **An agent-friendly 404**: the not-found page says in plain words that nothing is there and where to look next: the home page, `/index.md` and `/llms.txt`.
- **Privacy statements match what loads**: a privacy line lists exactly what the page loads and from where (scripts, analytics, fonts, images from other origins), checked against the browser's network log, not memory. A site that loads analytics says so.

## Component contracts (zyx components only)

Base components are stock; these rules bind only what we add under `registry/ui/`:

1. **Token-driven**: colors come from shadcn tokens (`--foreground`, `--muted-foreground`, ...), never raw hex. Dark mode must flip cleanly.
2. **Zero or minimal dependencies**: prefer CSS-only (`shimmering-text` animates with a keyframe, not framer-motion). A dependency needs to earn its install.
3. **Reduced motion respected**: animations behind `motion-safe:`; scripted animations check `prefers-reduced-motion` before they start (see Motion).
4. **`data-slot`** on the root element so consumers can target it from outside.
5. **Standalone file**: a registry item must drop into any shadcn project without sibling imports (registry deps declared in `registry.json`).
6. **Optical offsets at the call site**: nudges such as `-ml-1`, which line a pill's rounded end up with a text column, depend on the surrounding layout, so they go in the caller's `className`, never inside a component.

Per item:

- `scramble-text`: glyphs resolve left to right at `speed` ms per character (50, so 12 characters take about 600ms) on `trigger` `mount` or `in-view`. The element keeps its own display and the final text stays one untouched text node: while running it is painted transparent and an `aria-hidden`, `select-none` overlay draws one cell per character, pinned to that character's measured box before paint. Line breaks, size and the accessible text never change, and afterwards `textContent` holds the text exactly once. The server text is held invisible for at most 1.5s until the client starts; reduced motion shows the text at once.
- `rotating-text`: advances every `interval` ms (3200) with a `scramble-text` scramble or a `fade`; `index`, `defaultIndex`, `onIndexChange` (once per auto-advance and once per controlled change) and `paused` make it controllable. Every word sits invisible in one grid cell so CLS stays 0, hidden tabs pause, and reduced motion never auto-advances while a controlled change still swaps the word instantly. Screen readers get one stable word, falling back to the current one if `words` shrinks, and a copy gets the word on screen, once.
- `mask-reveal`: a mask three times the element's width, with alpha 1 - smoothstep over its middle third, moves from 100% to 0% after `delay` (1s) over `duration` (5s) with `cubic-bezier(.16,1,.3,1)`. The mask exists only inside the keyframes (`backwards` fill), so focus rings and shadows are intact afterwards, and reduced motion plays nothing.
- `ask-ai`: a pill 32px tall (24px from `sm`) composing the stock `dropdown-menu` and `button` through `className` only; the menu is `rounded-2xl` with `p-1` and its items are `rounded-xl` and at least 28px tall, so outer radius = inner radius + 4px at a 0.625rem `--radius`. The default page URL is `link[rel=canonical]`, else origin + pathname, never the query or fragment; prompts are `encodeURIComponent`-ed, links open in a new tab with `rel="noopener noreferrer"`, and copies confirm inline and in a `role="status"` region.
- `hdr-highlight`: a bare span. Under `@media (dynamic-range: high)` inside `.dark` its own glyphs are filled from a PQ / BT.2020 AVIF data URI through `background-clip: text`, over a `currentcolor` fallback layer. No layout property changes, so SDR pixels, wrapping and text decorations match a plain span; `hover` lights it on hover or focus of itself or an enclosing control and fades back over 2s (motion-safe).

## Adding a new item

Only if shadcn/ui doesn't have it:

1. Drop source at `registry/ui/<name>.tsx`
2. Append item to `registry.json` (declare `dependencies` / `registryDependencies`; keyframes go in the item's `css` field, mirrored into `app/globals.css` for this site)
3. Add its demo to `components/showcase.tsx`; `/index.md`, `/llms.txt` and `/agent-instructions.md` pick the item up from `registry.json` at build time
4. `bun run registry:build` regen `public/r/`
5. Merge to `main`: Vercel builds and serves `main` only (the deploy guard in `vercel.json`)

## What we explicitly don't do

- **No forked base components.** `components/ui/` is CLI-owned; edits there get overwritten by the next `shadcn add`.
- **No composite content blocks (Hero / CTA / Pricing) in the registry.** Primitives compose at the call site; this site's header, hero and footer are call-site components in `components/` (the corners inside them come from `@workspace/ui`), not items in `registry/ui/`.
- **No CSS-in-JS libraries.** Styling is Tailwind utilities. Inline `style` holds only what is known at runtime: a per-instance value passed as a CSS custom property (`mask-reveal`'s delay and duration), a prop-driven value (`shimmering-text`'s gradient) or a position measured by script (`scramble-text`'s cells).
- **No color in chrome.** Grayscale palette; color belongs to content.
- **No header or footer bars, no menu buttons for a short nav, no bold for hierarchy, no `rounded-full` pills.** The chrome is the four corners; the sections above say what to do instead.
