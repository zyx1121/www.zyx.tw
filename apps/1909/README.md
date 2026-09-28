```
 ██╗ █████╗  ██████╗  █████╗
███║██╔══██╗██╔═████╗██╔══██╗
╚██║╚██████║██║██╔██║╚██████║
 ██║ ╚═══██║████╔╝██║ ╚═══██║
 ██║ █████╔╝╚██████╔╝ █████╔╝
 ╚═╝ ╚════╝  ╚═════╝  ╚════╝
```

# 1909

A shared-expense dashboard for three flatmates.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon Postgres (schema `app_1909` in the shared zyx-tw database)
- **Auth**: Better Auth with Google sign-in, limited to the emails in `app_1909.members`
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
DATABASE_URL=            # pooled Neon URL; the Vercel Neon integration injects it
BETTER_AUTH_SECRET=      # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=    # redirect URI: <BETTER_AUTH_URL>/api/auth/callback/google
```

The schema lives in `db/schema.sql` (app tables) and `db/auth.sql` (Better Auth tables). Apply both with the unpooled URL, for example `psql "$DATABASE_URL_UNPOOLED" -f db/schema.sql`.

## License

[MIT](LICENSE.md) — if a flatmate won't pay up, his tab goes open source.
