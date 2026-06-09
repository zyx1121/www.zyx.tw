```

███████╗██╗   ██╗██╗  ██╗████████╗██╗    ██╗
╚══███╔╝╚██╗ ██╔╝╚██╗██╔╝╚══██╔══╝██║    ██║
  ███╔╝  ╚████╔╝  ╚███╔╝    ██║   ██║ █╗ ██║
 ███╔╝    ╚██╔╝   ██╔██╗    ██║   ██║███╗██║
███████╗   ██║   ██╔╝ ██╗██╗██║   ╚███╔███╔╝
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝    ╚══╝╚══╝

```

# www.zyx.tw

Loki's personal site. Turborepo monorepo — Next.js 16 + Tailwind v4 + shadcn/ui, pure black-and-white with a touch of accent.

## Stack

- **Next.js 16** App Router + Turbopack
- **React 19**
- **Tailwind CSS v4** + shadcn/ui (`radix-luma`)
- **TypeScript 5.9** strict + `noUncheckedIndexedAccess`
- **Bun 1.3** workspaces
- **Turbo 2** task pipeline

## Layout

```
apps/
  web/                    # Next.js app — the actual site
packages/
  ui/                     # @workspace/ui — design system + components
  eslint-config/          # @workspace/eslint-config — flat config (base / next-js / react-internal)
  typescript-config/      # @workspace/typescript-config — base / nextjs / react-library
```

## Commands

```bash
bun install
bun dev                   # turbo dev — apps/web on http://localhost:3000
bun run build             # production build
bun run lint              # eslint across the monorepo
bun run typecheck         # tsc --noEmit
bun run format            # prettier --write
```

## Adding shadcn components

```bash
cd apps/web
bunx --bun shadcn@latest add button
```

New components land in `packages/ui/src/components/` and are imported straight from the app:

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Design tokens

Centralized in the `@theme` block of `packages/ui/src/styles/globals.css`. For a readable version see [`packages/ui/src/styles/tokens.md`](./packages/ui/src/styles/tokens.md).
