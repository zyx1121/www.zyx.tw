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

The base components are shadcn/ui as-is — the shadcn CLI owns them, this registry does not fork them. What this registry ships is the theme (full grayscale, radius raised to 1rem) and the components shadcn doesn't have.

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

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
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
3. `bun run registry:build` to regen `public/r/<name>.json`
4. Push — Vercel rebuilds + serves

## License

[MIT](LICENSE.md) — fork it, butcher it, the registry pattern is the gift.
