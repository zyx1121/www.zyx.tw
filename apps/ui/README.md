```
██╗   ██╗██╗   ███████╗██╗   ██╗██╗  ██╗████████╗██╗    ██╗
██║   ██║██║   ╚══███╔╝╚██╗ ██╔╝╚██╗██╔╝╚══██╔══╝██║    ██║
██║   ██║██║     ███╔╝  ╚████╔╝  ╚███╔╝    ██║   ██║ █╗ ██║
██║   ██║██║    ███╔╝    ╚██╔╝   ██╔██╗    ██║   ██║███╗██║
╚██████╔╝██║██╗███████╗   ██║   ██╔╝ ██╗██╗██║   ╚███╔███╔╝
 ╚═════╝ ╚═╝╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝    ╚══╝╚══╝
```

# ui.zyx.tw

The zyx.tw design system: one base of grayscale tokens and lightweight components on Base UI, served as a shadcn registry.

Every component is our own rewrite that keeps only the variants the zyx.tw apps use and takes every value from the tokens: four type sizes, a concentric radius scale, two motion durations. The rules behind it live in [`DESIGN.md`](DESIGN.md).

## Use it

Init a project from the base. It writes the tokens, adds the fonts and registers the `@zyx1121` registry:

```bash
bunx shadcn@latest init https://ui.zyx.tw/r/base.json
```

Then add components by name. Init installs a stock button; overwrite it with ours:

```bash
bunx shadcn@latest add @zyx1121/button -o
bunx shadcn@latest add @zyx1121/dialog @zyx1121/select
```

## For agents

Every page has a Markdown version, and the site describes itself to agents:

- [`/index.md`](https://ui.zyx.tw/index.md): the home page as Markdown, with every item, its description, its install command and its JSON
- [`/llms.txt`](https://ui.zyx.tw/llms.txt): when to use the registry and how, as an llmstxt.org index
- [`/agent-instructions.md`](https://ui.zyx.tw/agent-instructions.md): the call order and the rules an agent follows

All three are built from `registry.json` by route handlers under `app/`, so they list exactly what `/r/` serves. The home page links them with a `Link` header (set in `vercel.json`, since the site is a static export) and a `<link rel="alternate">`, and carries JSON-LD.

## Tech Stack

- **Framework**: Next.js 16 (App Router, static export)
- **Styling**: Tailwind CSS v4, tw-animate-css
- **Components**: our own, on Base UI
- **Registry**: shadcn CLI
- **Package Manager**: Bun

## Getting Started

```bash
bun install
bun dev
```

## Add a Component

The source lives in `packages/ui/src/components/ui/`; `registry/zyx/ui` is a symlink to it.

1. Write `packages/ui/src/components/ui/<name>.tsx` (siblings imported relatively)
2. Register it in `registry.json`
3. Add its demo to `components/showcase.tsx`
4. `bun run build` regenerates `public/r/<name>.json` and checks it builds
5. Merge to `main`: Vercel builds and serves `main` only

## License

[MIT](LICENSE.md): fork it, butcher it, the registry pattern is the gift.
