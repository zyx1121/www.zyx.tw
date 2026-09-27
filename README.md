```

███████╗██╗   ██╗██╗  ██╗████████╗██╗    ██╗
╚══███╔╝╚██╗ ██╔╝╚██╗██╔╝╚══██╔══╝██║    ██║
  ███╔╝  ╚████╔╝  ╚███╔╝    ██║   ██║ █╗ ██║
 ███╔╝    ╚██╔╝   ██╔██╗    ██║   ██║███╗██║
███████╗   ██║   ██╔╝ ██╗██╗██║   ╚███╔███╔╝
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝    ╚══╝╚══╝

```

# www.zyx.tw

> Every idea that outgrows a scratch file gets its own subdomain here: one Turborepo, seven apps, one shared design system.

`nextjs` · `turborepo` · `tailwind` · `shadcn` · `supabase`

[![CI](https://github.com/zyx1121/www.zyx.tw/actions/workflows/ci.yml/badge.svg)](https://github.com/zyx1121/www.zyx.tw/actions) &nbsp;[![Live](https://img.shields.io/badge/live-zyx.tw-111111)](https://zyx.tw) &nbsp;[![version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzyx1121%2Fwww.zyx.tw%2Fmain%2Fpackage.json&query=%24.version&label=version&color=111111)](package.json) &nbsp;[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](#license)

```
zyx.tw          the site itself, home base
link.zyx.tw     your URLs, but shorter
time.zyx.tw     what time is it?
good.zyx.tw     a digital 乖乖 taped onto servers
3d.zyx.tw       an SVG, extruded into 3D
ui.zyx.tw       the component registry every app above imports from
1909            a shared-expense dashboard for three flatmates
```
<sub>One Turborepo, one CI pipeline, seven live apps.</sub>

Every subdomain of zyx.tw used to mean a fresh repo and copying the same eslint config, Tailwind tokens, and OTel bootstrap into it by hand. This monorepo folds the personal site and every side-project subdomain into one Turborepo instead, so a new idea is a new folder under `apps/`, not a new setup decision.

## Quickstart

```bash
git clone https://github.com/zyx1121/www.zyx.tw && cd www.zyx.tw
bun install
cp apps/web/.env.example apps/web/.env.local   # fill in the keys below
bun dev --filter=web                            # -> http://localhost:3000
```

Plain `bun dev` boots turbo across all 7 apps at once. `--filter=<app>` (or `cd apps/<app> && bun dev`) runs just one.

## What it gives you

| App | Live at | What it does |
|-----|---------|---------------|
| `web` | [zyx.tw](https://zyx.tw) | the actual website: home, projects, GitHub heatmap |
| `link` | [link.zyx.tw](https://link.zyx.tw) | your URLs, but shorter |
| `time` | [time.zyx.tw](https://time.zyx.tw) | what time is it? |
| `good` | [good.zyx.tw](https://good.zyx.tw) | a digital 乖乖, the snack engineers tape onto servers |
| `3d` | [3d.zyx.tw](https://3d.zyx.tw) | an SVG, extruded into 3D, lit and saved as one scene.json |
| `ui` | [ui.zyx.tw](https://ui.zyx.tw) | the shadcn registry every app above pulls components from |
| `1909` | (private) | a shared-expense dashboard for three flatmates |

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.1 (App Router + Turbopack) |
| UI | React 19, Tailwind CSS v4, shadcn/ui (`base-nova`, Base UI) + the [ui.zyx.tw](https://ui.zyx.tw) theme |
| Language | TypeScript 5.9, strict + `noUncheckedIndexedAccess` |
| Backend | Supabase (`1909`, `link`) |
| 3D | three.js, React Three Fiber, drei and postprocessing (`good`, `3d`) |
| Observability | `@workspace/otel`, shared bootstrap shipping logs to Sensorium |
| Tooling | Bun 1.3 workspaces + Turbo 2 |

Shared packages: `packages/ui` (design system + components) · `packages/3d` (scene.json v1, preset registries, `<Scene3D>`; see [its README](./packages/3d/README.md)) · `packages/otel` (the Sensorium bootstrap) · `packages/eslint-config` (flat config: base / next-js / react-internal) · `packages/typescript-config` (base / nextjs / react-library).

## Design system

Every app follows [`apps/ui/DESIGN.md`](./apps/ui/DESIGN.md): stock shadcn/ui on the `base-nova` preset (Base UI primitives, so `asChild` is the `render` prop) and the grayscale ui.zyx.tw theme with the stock `--radius: 0.625rem`. Apps start dark on a pure black background, whatever the OS prefers. Text is Inter (self-hosted, with open digits and a slashed zero), then Noto Sans JP and Noto Sans TC for CJK; Geist Mono is for code only, and numbers use Inter's `tabular-nums`. Base components are never forked; the CLI owns `components/ui/`.

Apps on `@workspace/ui` load the fonts from `packages/ui/src/lib/fonts.ts` and put its `fontVariables` on `<html>`.

Shared components live in `packages/ui`. Add a stock component there with the shadcn CLI:

```bash
cd packages/ui
bunx --bun shadcn@latest add button
```

It lands in `packages/ui/src/components/ui/` and imports from any app:

```tsx
import { Button } from "@workspace/ui/components/ui/button"
```

zyx components (`theme-toggle`, `shimmering-text`) come from the registry, already configured in `components.json`:

```bash
bunx --bun shadcn@latest add @zyx1121/theme-toggle
```

The theme tokens in `packages/ui/src/styles/globals.css` and `apps/1909/app/globals.css` must match `apps/ui/app/globals.css` and the `theme` item in `apps/ui/registry.json`. CI runs the check; run it locally with:

```bash
bun run theme:check
```

## Pulling the design system into another project

Outside this monorepo, init on the Base UI base and add the theme from ui.zyx.tw:

```bash
bunx shadcn@latest init -b base -p nova
bunx shadcn@latest add https://ui.zyx.tw/r/theme.json
```

Base components come straight from `bunx shadcn@latest add <name>`; zyx-only components come from the registry (see [`apps/ui/README.md`](./apps/ui/README.md)).

## Environment variables

`web` and `link` each ship their own `.env.example`; `1909` lists its variables in [its README](./apps/1909/README.md#environment-variables). One gotcha worth knowing: `GITHUB_TOKEN` on `web` is optional, a fine-grained PAT with `read:user` scope. Without it the GitHub contribution heatmap is hidden but the events list still works.

## Contributing

Issues and PRs welcome: start with [CONTRIBUTING.md](https://github.com/zyx1121/.github/blob/main/CONTRIBUTING.md).

## License

[MIT](LICENSE) · one license file for six subdomains and counting.
