```
██╗   ██╗██╗   ███████╗██╗   ██╗██╗  ██╗████████╗██╗    ██╗
██║   ██║██║   ╚══███╔╝╚██╗ ██╔╝╚██╗██╔╝╚══██╔══╝██║    ██║
██║   ██║██║     ███╔╝  ╚████╔╝  ╚███╔╝    ██║   ██║ █╗ ██║
██║   ██║██║    ███╔╝    ╚██╔╝   ██╔██╗    ██║   ██║███╗██║
╚██████╔╝██║██╗███████╗   ██║   ██╔╝ ██╗██╗██║   ╚███╔███╔╝
 ╚═════╝ ╚═╝╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝    ╚══╝╚══╝
```

# ui.zyx.tw

The zyx.tw design system. Stock shadcn/ui, grayscale palette, plus my own components.

The base components are shadcn/ui as-is: the shadcn CLI owns them, and this registry does not fork them. What this registry ships is the theme (full grayscale, stock radius, pure black dark mode) and the components shadcn doesn't have.

The rules behind it live in [`DESIGN.md`](DESIGN.md): the theme tokens and fonts, then layout (a 4px grid, a 20px module, one column), radius, lines, optical alignment, motion, typography, color, content, and the surfaces every site offers agents.

## Use it

Init a project on the Base UI base, then add the theme:

```bash
bunx shadcn@latest init -b base -p nova
bunx shadcn@latest add https://ui.zyx.tw/r/theme.json
```

Add base components straight from shadcn:

```bash
bunx shadcn@latest add button dialog tabs
```

Add zyx components from this registry:

```bash
bunx shadcn@latest add https://ui.zyx.tw/r/shimmering-text.json
```

Or point `components.json` at the registry once and use the short form:

```json
{
  "registries": {
    "@zyx1121": "https://ui.zyx.tw/r/{name}.json"
  }
}
```

```bash
bunx shadcn@latest add @zyx1121/shimmering-text
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
- **Components**: shadcn/ui (Base UI base)
- **Registry**: shadcn CLI
- **Package Manager**: Bun

## Getting Started

```bash
bun install
bun dev
```

## Add a Component

Only components shadcn/ui doesn't ship belong here. If shadcn has it, `bunx shadcn@latest add` it instead.

1. Drop the source in `registry/ui/<name>.tsx`
2. Register it in `registry.json`
3. Add its demo to `components/showcase.tsx`
4. `bun run registry:build` to regen `public/r/<name>.json`
5. Merge to `main`: Vercel builds and serves `main` only

## License

[MIT](LICENSE.md): fork it, butcher it, the registry pattern is the gift.
