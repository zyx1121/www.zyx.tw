```

███████╗██╗   ██╗██╗  ██╗████████╗██╗    ██╗
╚══███╔╝╚██╗ ██╔╝╚██╗██╔╝╚══██╔══╝██║    ██║
  ███╔╝  ╚████╔╝  ╚███╔╝    ██║   ██║ █╗ ██║
 ███╔╝    ╚██╔╝   ██╔██╗    ██║   ██║███╗██║
███████╗   ██║   ██╔╝ ██╗██╗██║   ╚███╔███╔╝
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝    ╚══╝╚══╝

```

# www.zyx.tw

> Every idea that outgrows a scratch file gets its own subdomain here: one Turborepo, nine apps, one shared design system.

`nextjs` · `turborepo` · `tailwind` · `shadcn` · `supabase`

[![CI](https://github.com/zyx1121/www.zyx.tw/actions/workflows/ci.yml/badge.svg)](https://github.com/zyx1121/www.zyx.tw/actions) &nbsp;[![Live](https://img.shields.io/badge/live-zyx.tw-111111)](https://zyx.tw) &nbsp;[![version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzyx1121%2Fwww.zyx.tw%2Fmain%2Fpackage.json&query=%24.version&label=version&color=111111)](package.json) &nbsp;[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](#license)

```
zyx.tw          the site itself, home base
things.zyx.tw   a personal scrapbook: text, links, images, video
os.zyx.tw       Windows 98, rebuilt in the browser
link.zyx.tw     your URLs, but shorter
temp.zyx.tw     a shared notepad, no account needed
time.zyx.tw     what time is it?
good.zyx.tw     a digital 乖乖 taped onto servers
ui.zyx.tw       the component registry every app above imports from
1909            a shared-expense dashboard for three flatmates
```
<sub>One Turborepo, one CI pipeline, nine live apps.</sub>

Every subdomain of zyx.tw used to mean a fresh repo and copying the same eslint config, Tailwind tokens, and OTel bootstrap into it by hand. This monorepo folds the personal site and every side-project subdomain into one Turborepo instead, so a new idea is a new folder under `apps/`, not a new setup decision.

## Quickstart

```bash
git clone https://github.com/zyx1121/www.zyx.tw && cd www.zyx.tw
bun install
cp apps/web/.env.example apps/web/.env.local   # fill in the keys below
bun dev --filter=web                            # -> http://localhost:3000
```

Plain `bun dev` boots turbo across all 9 apps at once. `--filter=<app>` (or `cd apps/<app> && bun dev`) runs just one.

## What it gives you

| App | Live at | What it does |
|-----|---------|---------------|
| `web` | [zyx.tw](https://zyx.tw) | the actual website: home, projects, GitHub heatmap |
| `things` | [things.zyx.tw](https://things.zyx.tw) | a personal scrapbook, Are.na-style |
| `os` | os.zyx.tw | Win98 desktop: real VFS, window manager, boot/shutdown chrome |
| `link` | [link.zyx.tw](https://link.zyx.tw) | your URLs, but shorter |
| `temp` | [temp.zyx.tw](https://temp.zyx.tw) | a shared notepad, one URL, no account |
| `time` | [time.zyx.tw](https://time.zyx.tw) | what time is it? |
| `good` | [good.zyx.tw](https://good.zyx.tw) | a digital 乖乖, the snack engineers tape onto servers |
| `ui` | [ui.zyx.tw](https://ui.zyx.tw) | the shadcn registry every app above pulls components from |
| `1909` | (private) | a shared-expense dashboard for three flatmates |

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.1 (App Router + Turbopack) |
| UI | React 19, Tailwind CSS v4, shadcn/ui (`radix-luma` theme) |
| Language | TypeScript 5.9, strict + `noUncheckedIndexedAccess` |
| Backend | Supabase (`1909`, `link`, `temp`, `things`) |
| Observability | `@workspace/otel`, shared bootstrap shipping logs to Sensorium |
| Tooling | Bun 1.3 workspaces + Turbo 2 |

Shared packages: `packages/ui` (design system + components) · `packages/cli` (the `zyxui` CLI, published to npm) · `packages/otel` (the Sensorium bootstrap) · `packages/eslint-config` (flat config: base / next-js / react-internal) · `packages/typescript-config` (base / nextjs / react-library).

## Adding a shadcn component

```bash
cd apps/web
bunx --bun shadcn@latest add button
```

New components land in `packages/ui/src/components/` and import straight from any app:

```tsx
import { Button } from "@workspace/ui/components/button"
```

Design tokens live in the `@theme` block of `packages/ui/src/styles/globals.css`; the readable version is [`packages/ui/src/styles/tokens.md`](./packages/ui/src/styles/tokens.md).

## Pulling the registry into another project

Outside this monorepo, use the registry's own CLI instead of shadcn's:

```bash
bunx zyxui@latest init
bunx zyxui@latest add button badge dialog
```

It writes a self-contained `app/globals.css` and `lib/utils.ts`, then copies components in with their dependencies resolved. No `components.json`, no style matrix. See [`packages/cli/README.md`](./packages/cli/README.md) for why it exists alongside `shadcn`.

## Environment variables

`web`, `1909`, `link`, `temp`, and `things` each ship their own `.env.example`. One gotcha worth knowing: `GITHUB_TOKEN` on `web` is optional, a fine-grained PAT with `read:user` scope. Without it the GitHub contribution heatmap is hidden but the events list still works.

## Contributing

Issues and PRs welcome: start with [CONTRIBUTING.md](https://github.com/zyx1121/.github/blob/main/CONTRIBUTING.md).

## License

[MIT](LICENSE) · one license file for nine subdomains and counting.
