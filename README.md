```

███████╗██╗   ██╗██╗  ██╗████████╗██╗    ██╗
╚══███╔╝╚██╗ ██╔╝╚██╗██╔╝╚══██╔══╝██║    ██║
  ███╔╝  ╚████╔╝  ╚███╔╝    ██║   ██║ █╗ ██║
 ███╔╝    ╚██╔╝   ██╔██╗    ██║   ██║███╗██║
███████╗   ██║   ██╔╝ ██╗██╗██║   ╚███╔███╔╝
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝    ╚══╝╚══╝

```

# www.zyx.tw

Loki 的個人網站。Turborepo monorepo — Next.js 16 + Tailwind v4 + shadcn/ui，純黑白配一點 accent。

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

新元件會落地到 `packages/ui/src/components/`，從 app 端直接 import：

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Design tokens

集中在 `packages/ui/src/styles/globals.css` 的 `@theme`。可讀版本看 [`packages/ui/src/styles/tokens.md`](./packages/ui/src/styles/tokens.md)。
