```
 ██╗ █████╗  ██████╗  █████╗
███║██╔══██╗██╔═████╗██╔══██╗
╚██║╚██████║██║██╔██║╚██████║
 ██║ ╚═══██║████╔╝██║ ╚═══██║
 ██║ █████╔╝╚██████╔╝ █████╔╝
 ╚═╝ ╚════╝  ╚═════╝  ╚════╝
```

# 1909

Hsinchu Science Park, Run Long Bldg A, Unit 19F-9 — a shared-expense dashboard for three flatmates.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Backend**: Supabase
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: Bun

## Getting Started

```bash
bun install
bun dev
```

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

## License

[MIT](LICENSE.md) — if a flatmate won't pay up, his tab goes open source.
