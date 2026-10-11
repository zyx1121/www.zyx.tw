# www.zyx.tw

Bun and Turborepo monorepo for zyx.tw and its subdomain apps. Read [README.md](README.md) and [apps/ui/DESIGN.md](apps/ui/DESIGN.md) before you change anything. Some apps have their own `AGENTS.md` (`apps/web`, `apps/ui`). Read it before you change that app.

## Rules

- Every component lives once, in `packages/ui/src/components/ui/`. Apps import it from `@workspace/ui`. Do not copy or fork a component into an app.
- Use design tokens only. `bun run theme:check` and `bun run tokens:check` must pass.
- Interface copy and documents are English, with no em dashes and no middle dots.
- A new subdomain is a new folder under `apps/`, on the same packages.
- For a Next.js change, read the guide for the installed version under `node_modules/next/dist/docs/`.

## Where to run things

In Loki's environment, the MacBook is for editing and git only. Run installs, builds, typechecks, tests and dev servers on `ssh sandbox` in a login shell (`bash -lc`), with a separate directory and port for each task. Do not install dependencies in the iCloud clone.

## Verify

```sh
bun install --frozen-lockfile
bun run theme:check && bun run tokens:check
bun run lint && bun run format:check && bun run typecheck && bun run build
```

Then open the changed page in a browser. Look at it in dark mode, at desktop and phone widths.

## Deploy

- Vercel deploys the apps from `main`, except `apps/3d` (Plump) and `apps/stamp`. Those two are not connected to Git, so deploy them with the Vercel CLI.
- When several merges land while Vercel limits builds, a live site can serve a mix of versions. After a merge, verify that the live deployment of each changed app is on the merge commit.
