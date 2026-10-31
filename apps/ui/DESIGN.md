# Design system: ui.zyx.tw

> One base of tokens and a set of lightweight components, served as a shadcn registry. Every component is our own rewrite on Base UI: only the variants the zyx.tw apps use, only token values.

The look is a terminal: one monospace face on a character grid, square fills, glyph-framed windows and fields, soft grayscale, inverted highlights, and text that decodes in as a terminal prints it.

This file is the design contract for every zyx.tw app. `bun run theme:check` and `bun run tokens:check` enforce the parts a script can see; the rest is review.

## Architecture

- **One source**: the components live in `packages/ui/src/components/ui/`. Every app in this repo imports them from `@workspace/ui/components/ui/<name>`; no app keeps its own copy.
- **One stylesheet**: `packages/ui/src/styles/globals.css` holds the tokens, the utilities and the keyframes. Every app imports `@workspace/ui/globals.css`. An app may add a stylesheet only for its own content (Plump's font stack), never to restyle a component.
- **The registry**: `apps/ui/registry.json` publishes the same files to projects outside this repo. `registry/zyx/ui` is a symlink to `packages/ui/src/components/ui`, and `shadcn build` writes `public/r/` from it. The `base` item (`registry:base`, `extends: "none"`) carries the tokens, utilities and fonts; `shadcn init https://ui.zyx.tw/r/base.json` sets up a project and registers `@zyx1121`.
- **In sync by check**: `theme:check` fails when globals.css and the `base` item (plus the components' keyframes and animations) drift. CI also inits a fresh project from the built base, adds every component and builds it.
- **Components import each other relatively** (`./button`), so the files work both in `packages/ui` and in a project's `components/ui`. `cn` comes from `lib/utils` (`../../lib/utils`), which extends the `cn` package so the four type sizes survive next to a text color.

## Tokens

### Color

Grayscale. The only chroma on screen is `destructive` and content itself (photos, 3D scenes, the koi pond).

| Token                            | Use                                      |
| -------------------------------- | ---------------------------------------- |
| `background` / `foreground`      | The page and its text                    |
| `primary` / `primary-foreground` | The main action                          |
| `muted` / `muted-foreground`     | The one neutral fill, and secondary text |
| `destructive`                    | Errors and deleting                      |
| `border` / `input` / `ring`      | Lines, control outlines, focus rings     |

There is no `secondary`, `accent` or `card` (they duplicated `muted` or `background`), no `popover` or `overlay` (windows are `background`), no `sidebar-*` (the chrome is the four corners) and no `chart-*` (charts use the colors above). `tokens:check` rejects them, Tailwind palette colors (`bg-gray-500`, `bg-black`) and color literals. The few literals that are content rather than chrome (Open Graph images, a scene's background color) are waived file by file in `scripts/check-tokens.mjs`, each with its reason.

- **Dark first, soft extremes**: every app server-renders `<html class="dark">` and starts dark (`ThemeProvider` from `@workspace/ui/components/theme-provider`); the `d` key toggles. There is no pure white or pure black: dark sits on near black (`oklch(0.17 0 0)`) with text at `oklch(0.88 0 0)`, light on warm paper (`oklch(0.97 0.005 85)`) with text at `oklch(0.25 0 0)`. Contrast is about 14:1 (WCAG AAA asks for 7:1).
- **Primary is the text color**: `primary` equals `foreground` and `primary-foreground` equals `background`, so the main action is an inverted block, as a terminal highlights.
- **Muted text at 4.5:1**: `muted-foreground` reaches at least 4.5:1 on `background` and `muted` in both themes: light `oklch(0.52 0 0)`, dark `oklch(0.62 0 0)`. Readable text never goes lighter (no `text-muted-foreground/50`); disabled controls are the only exception.
- **Focus is the text color**: `ring` equals `foreground`, so focus is a box in the text color, not a soft gray ring.
- **Highlights invert**: selected text (`::selection`) and a hovered or focused link in running text (`terminal-link`) swap `foreground` and `background`, with no fade.

### Type

Four sizes by role, the same on phones and desktops. Tailwind's own sizes are cleared (`--text-*: initial`), so `text-sm` and friends do not exist.

| Utility        | Size    | Use                                                                     |
| -------------- | ------- | ----------------------------------------------------------------------- |
| `text-display` | 80/80px | One oversized value per page: the time app's clock, a tool app's result |
| `text-title`   | 24/32px | Page and dialog titles                                                  |
| `text-body`    | 16/24px | Everything else: body, controls, tables, corners, section headings      |
| `text-caption` | 14/20px | Timestamps, counts, code, chart axes                                    |

- **Hierarchy by weight and color**: 400 for text, 500 for titles, section headings, labels and buttons. Secondary text is `text-muted-foreground`.
- **CSS** may only name the scale: `font-size: var(--text-body); line-height: var(--text-body--line-height)`.
- **One face**: Sarasa Mono TC sets everything, text, headings and code alike (`font-sans`, `font-heading` and `font-mono` are the same stack). Every glyph keeps its cell, a Han character two, so text lines up on a character grid and digits never shift. The files are subset to Latin, symbols, box drawing and the Han characters the apps use (`packages/ui/src/fonts/README.md`); other Han characters fall back to Noto Sans TC. Projects outside this repo load the same files from `https://ui.zyx.tw/fonts/`.
- **Real styles only**: 400 and 500 (Sarasa's SemiBold) only, never synthesis, and no italic.
- **Labels in capitals**: corner links and section headings are uppercase (`SectionTitle`); tooltips are lowercase, like a shell. Body text keeps its own case.
- **No content exceptions**: Markdown, code, charts and notices use the same four sizes; change wrapping and layout instead.

### Square fills, glyph frames

Fills are square cells, as in a terminal: buttons, highlights, badges, switches, avatars and focus boxes. `--radius` is 0 for libraries that read it, and `tokens:check` rejects every `rounded-*` except `rounded-none` (to clear a radius a library sets), `var(--radius*)` and a nonzero `border-radius`.

Outlines are drawn with box-drawing characters (`╭ ─ ╮ │ ╰ ╯`), not CSS borders, so each line runs through the middle of a character cell and the corners are the font's own arcs (`frame`, globals.css "Glyph frames").

- **Who draws one**: every layer-2 window (dialog, alert dialog, popover, menus, select menu, tooltip, toolbar, chart tooltip), every field (input, textarea, input group, select and combobox triggers, the command input) and the outline button. A sheet draws the one vertical edge that faces the page (`FrameSide`).
- **Nothing moves**: `FrameEdges` overhangs its parent by half a cell (8px across, 10px down), which puts each line where a 1px border was. The parent is positioned and does not clip; a window whose content scrolls scrolls an inner box (dialog, sheet) or draws the frame in its positioner (`WindowEdges`, menus).
- **20px rows**: Sarasa's vertical bar is 1.25em tall, so the frame's rows are the caption line height and the bars meet with no gap.
- **Colors**: windows `muted-foreground`; fields and the outline button `muted-foreground` at 30% and 20% opacity, which match `input` and `border` but stay opaque inside, so the 1px overlaps where glyphs meet never brighten. Focus turns a field's frame to `ring` (the text color), invalid to `destructive`, and hover lights the outline button's frame to `foreground`.
- **Labels on the edge**: `Frame` (and `FrameEdges`) take a `label` for the top edge and a `detail` for the bottom right, as a terminal dashboard titles a panel.
- Toasts and outline badges still use a 1px border.

### Motion

| Utility             | Duration       | Use                                                                                    |
| ------------------- | -------------- | -------------------------------------------------------------------------------------- |
| `duration-state`    | 150ms ease-out | A control changing state: hover, focus, check, switch, the tab highlight               |
| `duration-overlay`  | 200ms ease-out | Something appearing or leaving: dialogs, menus, popovers, tooltips, the mark mirroring |
| `enter-row-<n>`     | n × 25ms delay | The page's staggered entrance (`enterRow`, below)                                      |
| `animate-cursor`    | 1s, stepped    | The block cursor at an idle prompt (`Cursor`): on for half a second, off for half      |
| `transition-column` | 300ms          | The column easing its width between breakpoints                                        |

- **Page entrance: text decodes**: every app mounts `PageDecode` (`@workspace/ui/components/page-decode`) once in its root layout. A page's text starts scrambled and resolves left to right, 50ms per character (a long line within 600ms), row by row 25ms apart in document order, counting the top corners as row 0: the title is row 1, the subtitle row 2, each block after them one row further. The bottom corners come in at row 15 (375ms). Scrambled glyphs keep each character's cell (Han glyphs for Han characters), so nothing moves. Use `enterRow(n)` and `enterFooter` from `@workspace/ui/lib/layout`; the decoder reads the row from the class.
- **Page exit: text scrambles**: following a link within the app first scrambles the page being left over 200ms, from the end of each line, then the next page decodes in. Something that draws its own characters (www.zyx.tw's ASCII mark) listens for `LEAVE_EVENT` and scrambles with the page.
- **Both directions alike**: every animation runs the same way in and out: what zooms in zooms out, what fades in fades out, at the same duration. A select menu that sits over its trigger only fades, opening and closing.
- **Entrances never move layout**: they change glyphs, opacity, masks, transforms and color only, so CLS stays 0.
- **Windows do not zoom**: menus, dialogs and tooltips fade in and out at `duration-overlay`; a terminal window does not scale or slide.
- **Reduced motion covers everything**: our animations sit behind `motion-safe:`, and globals.css cuts every animation and transition to 1ms under `prefers-reduced-motion: reduce` (1ms keeps the end events Base UI waits for).
- `tokens:check` rejects other durations (`duration-300`) and delays.

## Layers

The interface is flat and has exactly two layers.

| Layer     | What lives there                                                                                                                   | Surface                                                                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Page   | Everything on the page when it loads: titles, text, lists, tables, forms, demos                                                    | None: no borders around groups, no shadows, no card backgrounds                                                                                                   |
| 2. Window | Anything called up over the page or a working surface: dialog, alert dialog, sheet, menus, popovers, tooltips, toasts, the toolbar | A terminal window: opaque `bg-background`, a glyph frame in `muted-foreground`, no shadow. Backdrops behind dialogs and sheets are a 12px blur alone with no tint |

- Group page content with spacing and, where a line helps, a divider (`border-t` / `border-b`). Never wrap a group in a frame. `tokens:check` rejects `shadow-*` and a whole `border` in page code; only the components draw layer 2.
- Controls keep their own outline: inputs, selects and outline buttons are controls, not containers.
- Tooltips are small windows like the rest, in lowercase.
- A form either is the page (layer 1, no frame) or is called up in a dialog. Short edits go in a dialog.
- Every pick-a-value control (select, combobox) looks like an input when closed: they share `fieldTriggerClassName`.

## Layout

A page is one centered column on a 4px grid, framed by the four corners of the viewport, and the spacing between its parts moves in steps of 20px.

- **4px grid**: every spacing, size and line height is a multiple of 4px. Half steps of 2px are for optical corrections and the inside of controls only.
- **20px module**: spacing between page parts is a multiple of 20px: gutters `px-5`, corner insets 20px, demos `gap-15`, groups `gap-20`, hero to content `pb-25`, the top of the page to the title `pt-30`. Inside a part the 4px grid rules (12px from a title to its subtitle).
- **Spotlight pages**: a page about one thing (a component page on ui.zyx.tw, a result) centers its content on both axes in the column and falls back to scrolling from the top when it is taller than the viewport.
- **One column**: `column` from `@workspace/ui/lib/layout`, 576, 768 and 1024px wide with 20px gutters. `page` adds the 120px top and 100px bottom space.
- **Four corners**: the chrome of every app is four fixed corners, 20px in from the viewport's corners, 16px between items, all `text-body`, links in capitals (`cornerLink`). A page nav marks the current page in brackets, `[WORKS]`, with `CornerLabel`; the other labels keep invisible brackets so nothing shifts, and the nav takes `gap-2`. Top left is always the zyx mark (to www.zyx.tw; to `/` on www.zyx.tw itself), which mirrors itself on hover. Top right holds the page nav and the page's function buttons. Bottom left is Privacy and Terms and nothing else (`LegalLinks`). Bottom right is the copyright. They come from `@workspace/ui/components/corners`, published as `@zyx1121/corners`; an app leaves a corner empty rather than filling it with something else. An app's own working surface is content, not chrome: Plump's toolbar stays at the bottom center of its canvas.
- **TV frame**: www.zyx.tw wears a TV frame (`tv` on `<html>`): a 24px black bezel, a screen with 40px squircle corners, a dark glow at the screen's edge and faint scanlines. The corners then sit 20px in from the screen, not the viewport.
- **Corner tips**: an item in a corner can carry a tip (`CornerTip`) that says what its label leaves out; it never restates a text label. Tips open at once, toward the page; touch never opens them.
- **The corners stay put**: where content scrolls under them, a transparent 12px blur fades out over 64px from the top and bottom edges (`fade`). Pages that fill the viewport leave it off.
- **No menu button**: the nav stays short enough to fit a 320px viewport beside the mark.
- **Stable gutter**: the site's `<html>` sets `scrollbar-gutter: stable` (one edge), except tool apps that fill the viewport.
- **Secondary columns fold away on phones**: an aside that does not fit beside its item on a phone is `max-sm:sr-only` rather than wrapping under it.
- **Rows are exactly their content's height**: a control alone on its row sits in a flex or block box, never in a line box.

## Lines and optical alignment

- **Lines only where they carry meaning**: a line bounds a layer-2 surface or separates groups. It is 1px of `--border` (white at 10% in dark).
- **Frames carry focus**: a field shows focus by coloring its glyph frame, so focusing moves nothing.
- **Offsets live at the call site**: nudges such as `-ml-1` or `-m-3` depend on the surrounding layout, so they go in the caller's `className`, never inside a component. An icon button in a text row takes its icon inset back on every side (`-m-3` on a 40px button with a 16px icon), so layout sees only the icon.
- **Menus follow their trigger**: a menu opens 4px under its trigger. A select menu is as wide as the trigger plus its padding (`w-menu`); a combobox menu keeps the popover's width and grows to the trigger's when that is wider, so a short trigger never truncates the options.

## Lists

- Rows are separated by dividers (`border-b`), never framed: no card per row, no border around the list. A row's text lines up with the page's left edge.
- Row actions follow how many there are:

| Actions on a row | Shape                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| One or two       | Ghost icon buttons, each with a tooltip naming the verb ("Edit", "Delete")               |
| Three or more    | One `⋯` button opening a `dropdown-menu`; the destructive action last, after a separator |

- A delete button stays muted on the row. Red belongs to the confirmation that follows, not to the trigger.
- Every action that cannot be undone asks first, in an `alert-dialog`. Its confirm button names the verb ("Delete", "Revoke"), never "OK" or "Confirm".

## Status and categories

The chrome is grayscale, so a badge tells states apart by fill, not by hue. A category (a kind, a tag, a group) never looks like a state.

| What it is                       | Badge         |
| -------------------------------- | ------------- |
| Open, active, running, done      | `default`     |
| Waiting, closed, inactive, draft | `muted`       |
| Rejected or failed               | `destructive` |
| A category or tag, not a state   | `outline`     |

- Each app maps its status values to these variants in one place, next to the status labels, and every page reads that map.
- A status that only applies to some rows shows nothing on the others; do not add a "normal" badge.

## Components

`packages/ui/src/components/ui/`, published as `@zyx1121/<name>`:

- **Controls**: button, toggle, input, input-group, textarea, label, checkbox, switch, slider, select, combobox, command, calendar
- **Overlays**: dialog, alert-dialog, sheet, popover, dropdown-menu, tooltip, sonner, toolbar
- **Content**: badge, avatar, table, tabs, collapsible, separator, skeleton, chart, resizable, frame
- **Chat**: message, bubble, attachment
- **zyx**: scramble-text, mask-reveal, theme-toggle
- **Layout** (`registry:component`, in `packages/ui/src/components/`): corners (with corner-tip and zyx-mark), page-decode, section-title, shell
- **Blocks** (`registry:block`, in `packages/ui/src/components/`): confirm-dialog, empty-state, status-page (a shell session: the failed command, the title as output, the way out, an idle cursor; every 404 is `cd <RequestedPath />`). A block serves one purpose and fixes its copy pattern; a component is a part with no purpose of its own. Blocks have no description slot.

Contract for every component:

1. **Only what an app uses**: one button height (40px) with sizes `default` and `icon`; variants are added when an app needs one, not ahead of time.
2. **Tokens only**: no arbitrary values (`rounded-[10px]`), no palette colors, no literals, no inline styles. Arbitrary variants (`data-[state=open]:`, `[&_svg]:`) are fine.
3. **`data-slot`** on the root element, so consumers and the overlay styles can target it.
4. **Built on Base UI**: compose with the `render` prop, not Radix's `asChild`.
5. **Reduced motion respected**, through `motion-safe:` or the global rule.
6. **Keyframes travel with the item**: a component that animates puts its keyframes in the item's `css` and its `--animate-*` in `cssVars.theme`, mirrored in globals.css (`theme:check`).

Per item:

- `scramble-text`: glyphs resolve left to right at `speed` ms per character (50) on `trigger` `mount` or `in-view`. The final text stays one untouched text node, painted transparent while an `aria-hidden` overlay draws one cell per character, pinned to that character's measured box before paint, so line breaks, size and the accessible text never change. The server text is held invisible for at most 1.5s until the client starts; reduced motion shows the text at once.
- `mask-reveal`: a feathered mask three times the element's width sweeps from 100% to 0% over 600ms with `cubic-bezier(.16,1,.3,1)`. The delay comes from an `enter-row-<n>` class on the same element (`rowDelay(n)`), so it keeps time with the row fades. The mask exists only inside the keyframes, so focus rings and shadows are intact afterwards.
- `chart`: series colors are `primary`, `muted` (muted-foreground) or `destructive`, set per key in the config and reaching Recharts as `--color-<key>`. Bars are square, lines are 2px, the grid is horizontal only, and two series always come with `ChartLegendContent`, so color is never the only label. More than two series to tell apart by color means small multiples or a table.
- `toolbar`: a window of 40px controls over a working surface, 4px around them.
- `page-decode`: see Motion. Text inside a `scramble-text` is left to it; text nodes of symbols alone (an ASCII frame) are left to their owners.
- `shell`: `Command` (a muted `$ ` prompt, then the command), `Cursor` (a blinking block) and `RequestedPath` (the path a 404 was asked for, filled in on the client).

## Content

Say it once, in as few words as the thing needs. No sentence explains what the screen already shows.

- **Buttons are the verb**: "Save", "Delete", "Sign in". While it runs, the verb + "ing…" ("Saving…").
- **Titles name the thing or ask the question**: "Receipts", "Delete this receipt?", "Nothing here". A subtitle, where a page has one, adds a fact the title lacks; it never explains the screen.
- **Toasts are the outcome or the reason**, a few words: "Saved", "The file is over 10 MB".
- **No helper text under fields**: the label carries what a field needs; an error goes in a toast.
- **English UI copy**: the public zyx.tw sites write their interface in English (`lang="en"`). An app written for Chinese readers, such as `1909` (`lang="zh-TW"`), writes its UI in Chinese.
- **Spaces between CJK and Latin** (`共 7 個元件`), but not next to full-width punctuation. CJK sentences take full-width marks.
- **Short declarative sentences**: one idea per sentence, in the present tense.
- **One form of address**: "you" in English; in Chinese a site picks 你 or 您 and keeps it.
- **No em dashes**: use a colon, a comma, a period or parentheses.

## Agent surfaces

Every zyx.tw site is written for people and for agents. A static export has no server to negotiate `Accept: text/markdown`, so each surface is a file at its own URL, and `vercel.json` adds the headers.

- **Markdown for every content page**: `/index.md` for the home and `<path>.md` for the others, built from the same data as the HTML, each with YAML front matter (`site`, `url`, `title`, `description`). Agents find it through the `Link` header and `<link rel="alternate">`.
- **`/llms.txt`**: an H1, a summary, "When to use", "How an agent should use it" and links to the Markdown pages.
- **`/agent-instructions.md`**: when to use the site and when not to, the call order and the rules.
- **JSON-LD**: one script says what the site is and what it offers, with `<` escaped.
- **robots.txt and sitemap.xml**: robots allows everything; the sitemap lists the HTML pages.
- **An agent-friendly 404** says nothing is there and where to look next.
- **Privacy statements match what loads**, checked against the browser's network log.

## Agent kit

Web apps with an agent in them (Handy, Stamp, the FDE demos) share the server half too. The kit lives in `packages/agent/src/`, is published as `registry:lib` items named `agent-*`, and installs into a project's `lib/agent/`. Each file is the app's own afterwards, like a component.

| Item                 | What it gives                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `agent-tools`        | `defineTool` and `createTools`: one registry, `run` for pages, `forChat` for `streamText`, `mcp` for `/mcp` |
| `agent-model`        | `modelConfigFromEnv(prefix)` and `buildModel`: any OpenAI-compatible endpoint, traced, waiting out 429s     |
| `agent-seal`         | `seal`, `open` and `redact`: AES-256-GCM for stored credentials, and scrubbing their values from any output |
| `agent-public-fetch` | `publicFetch`: requests on an agent's behalf reach public addresses only, checked at connect time           |
| `agent-telemetry`    | `registerTelemetry`, `inSpan` and the traced model fetch, to Sensorium over OTLP/HTTP                       |

- **Every action is a tool**: what a person can do on the page goes through the registry, so the chat agent and MCP clients get it with the same parsing, permissions and span. A tool stays off MCP only with `mcpExcludedBecause` saying why.
- **Errors say only what is safe**: a `ToolError` message reaches the person, the model or the MCP client as written; any other error becomes "The tool failed." and its name goes on the span.
- **Mutations announce themselves**: `createTools(tools, { afterMutation })` is where an app sends `pg_notify`, so open pages refresh (nextjs-dev rule 14).
- **Credentials never reach the model**: the model gets a credential's name, a step gets its values from `open`, and whatever comes back goes through `redact`.
- **The server fetches public addresses only**, unless the operator allows a host by name.
- **Spans carry names, ids, counts and timings**, never prompts, file content or credentials.
- **Node.js runtime**: the kit uses `node:crypto`, `node:async_hooks` and undici; route handlers that use it run on Node.js, not the edge.

## Adding or changing a component

1. Edit or add `packages/ui/src/components/ui/<name>.tsx`. Import siblings relatively.
2. For a new one, add its item to `apps/ui/registry.json` (dependencies, `registryDependencies` by URL, keyframes in `css`) its demo to `apps/ui/components/demos.tsx` and its name to a group in `apps/ui/lib/docs.ts`. The build fails while a component has no group, and each one gets a page at `/<name>` and `/<name>.md`.
3. Run `bun run theme:check`, `bun run tokens:check` and `bun run build` (it runs `shadcn build`).
4. Merge to `main`: Vercel builds and serves `main` only.

## What we explicitly don't do

- **No stock copies.** A component exists once, in `packages/ui`. Restyling happens in that file, not in a theme override aimed at someone else's markup.
- **No marketing blocks (Hero, CTA, Pricing) in the registry.** Blocks exist for interface patterns that repeat across apps (confirming, empty lists, status pages); page content is composed at the call site.
- **No CSS-in-JS.** Tailwind utilities on tokens; app stylesheets only for content.
- **No color in chrome**, **no header or footer bars**, **no menu button for a short nav**, **no bold for hierarchy**, **no cards on the page**, **no rounded fills**, **no shadows**, **no frosted glass**, **no second typeface.**
