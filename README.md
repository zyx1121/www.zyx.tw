<div align="center">

<h1>www.zyx.tw</h1>

<p><strong>zyx.tw and its subdomain apps in one Turborepo, with one shared design system.</strong></p>

[![CI](https://img.shields.io/github/actions/workflow/status/zyx1121/www.zyx.tw/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/zyx1121/www.zyx.tw/actions)
[![Live](https://img.shields.io/badge/live-zyx.tw-000000?style=flat-square)](https://zyx.tw)
[![License](https://img.shields.io/github/license/zyx1121/www.zyx.tw?style=flat-square)](LICENSE)

**English** | [繁體中文](README.zh-TW.md) | [简体中文](README.zh-CN.md)

</div>

```
zyx.tw          the site: a 3D home, works and a resume
link.zyx.tw     a URL shortener
time.zyx.tw     a clock
good.zyx.tw     a digital 乖乖, the snack that engineers tape onto servers
plump.zyx.tw    Plump: SVG, shaped and lit in 3D
ui.zyx.tw       the component registry that every app imports from
1909            a private shared-expense dashboard for three flatmates
```

A new subdomain used to mean a new repo and another copy of the same lint config, design tokens and telemetry setup. Here, a new idea is a new folder under `apps/`.

## Features

- **Hosts 7 apps**: each app deploys to its own subdomain from one repo and one CI pipeline.
- **Shares one design system**: every component lives once in `packages/ui`, and every app imports it from there.
- **Enforces the design rules**: CI fails when an app drifts from the theme or uses a value that is not a design token.
- **Serves agents**: the site and ui.zyx.tw give each page a Markdown version, plus `/llms.txt`, `/agent-instructions.md` and JSON-LD.
- **Publishes the registry**: other projects install the components from ui.zyx.tw with the shadcn CLI.

## Quick start

```sh
git clone https://github.com/zyx1121/www.zyx.tw && cd www.zyx.tw
bun install
cp apps/web/.env.example apps/web/.env.local
bun dev --filter=web
```

Open http://localhost:3000. You should see the zyx.tw home page.

## Usage

| App | Folder | Live at |
|-----|--------|---------|
| Site | `apps/web` | [zyx.tw](https://zyx.tw) |
| URL shortener | `apps/link` | [link.zyx.tw](https://link.zyx.tw) |
| Clock | `apps/time` | [time.zyx.tw](https://time.zyx.tw) |
| Snack | `apps/good` | [good.zyx.tw](https://good.zyx.tw) |
| Plump | `apps/3d` | [plump.zyx.tw](https://plump.zyx.tw) |
| Component registry | `apps/ui` | [ui.zyx.tw](https://ui.zyx.tw) |
| Shared expenses | `apps/1909` | private |

- Run one app: `bun dev --filter=<folder name>`. `bun dev` starts all of them.
- Import a component in an app: `import { Button } from "@workspace/ui/components/ui/button"`.
- Use the design system in another project:

  ```sh
  bunx shadcn@latest init https://ui.zyx.tw/r/base.json
  bunx shadcn@latest add @zyx1121/button @zyx1121/dialog
  ```


The design rules (theme, type scale, layout, motion and copy) are in [apps/ui/DESIGN.md](apps/ui/DESIGN.md).

## Configuration

`apps/web` and `apps/link` each have a `.env.example`. `apps/1909` lists its variables in [its README](apps/1909/README.md#environment-variables).

`GITHUB_TOKEN` in `apps/web` is optional. It is a fine-grained token with `read:user`. Without it, the site hides the contribution heatmap and still shows the events list.

## How it works

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Base UI, [ui.zyx.tw](https://ui.zyx.tw) components |
| Language | TypeScript, strict, with `noUncheckedIndexedAccess` |
| Data | Supabase (`1909`, `link`) |
| 3D | three.js, React Three Fiber (`good`, `3d`) |
| Telemetry | `packages/otel` sends logs to [sensorium](https://github.com/zyx1121/sensorium) |
| Tooling | Bun workspaces and Turborepo |

Shared packages: `packages/ui` (design system), `packages/3d` (the Plump scene format and renderer), `packages/agent` (the agent kit), `packages/otel`, `packages/eslint-config` and `packages/typescript-config`.

## For AI agents

Facts for coding agents and LLM tools. The rules for changing the code are in [AGENTS.md](AGENTS.md).

- **Summary**: Bun and Turborepo monorepo with 8 Next.js apps for zyx.tw and its subdomains, and the shared ui.zyx.tw design system.
- **Type**: web
- **Interfaces**: HTTP, the live sites in the Usage table. Each page also has a Markdown version, and `/llms.txt` lists them.
- **Install**: `bun install --frozen-lockfile`
- **Run**: `bun dev --filter=web`
- **Verify**: `bun run theme:check && bun run tokens:check && bun run typecheck`
- **Config**: `.env.example` in `apps/web` and `apps/link`, and the variables in `apps/1909/README.md`
- **Secrets**: Supabase keys and the optional `GITHUB_TOKEN` in each app's `.env.local`, never in the repo
- **Limits**: `apps/3d` and `apps/stamp` deploy with the Vercel CLI, not from Git. `apps/1909` is private.

## Development

```sh
bun install --frozen-lockfile
bun run theme:check && bun run tokens:check
bun run lint && bun run format:check && bun run typecheck && bun run build
```

CI runs the same steps, plus the agent kit tests in `packages/agent`.

## License

[MIT](LICENSE)
