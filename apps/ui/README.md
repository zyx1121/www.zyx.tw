```
██╗   ██╗██╗   ███████╗██╗   ██╗██╗  ██╗████████╗██╗    ██╗
██║   ██║██║   ╚══███╔╝╚██╗ ██╔╝╚██╗██╔╝╚══██╔══╝██║    ██║
██║   ██║██║     ███╔╝  ╚████╔╝  ╚███╔╝    ██║   ██║ █╗ ██║
██║   ██║██║    ███╔╝    ╚██╔╝   ██╔██╗    ██║   ██║███╗██║
╚██████╔╝██║██╗███████╗   ██║   ██╔╝ ██╗██╗██║   ╚███╔███╔╝
 ╚═════╝ ╚═╝╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝    ╚══╝╚══╝
```

# ui.zyx.tw

My component registry. Copy in, own outright — the shadcn way.

## Use it

In any shadcn project, point `components.json` at the registry:

```json
{
  "registries": {
    "@zyx1121": "https://ui.zyx.tw/r/{name}.json"
  }
}
```

Then add what you want:

```bash
bunx shadcn@latest add @zyx1121/button
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Registry**: shadcn CLI
- **Package Manager**: Bun

## Getting Started

```bash
bun install
bun dev
```

## Add a Component

1. Drop the source in `registry/ui/<name>.tsx`
2. Register it in `registry.json`
3. `bun run registry:build` to regen `public/r/<name>.json`
4. Push — Vercel rebuilds + serves

## License

[MIT](LICENSE.md) — fork it, butcher it, the registry pattern is the gift.
