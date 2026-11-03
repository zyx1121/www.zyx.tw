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

- Every app except `apps/stamp` runs as a container on VM 117. The pull request builds the root `Dockerfile` with `APP=<app>` (`apps/ui/Dockerfile` for the static ui.zyx.tw) through the shared `image.yml`, and `deploy/smoke.sh <app>` tests it. The image is `ghcr.io/zyx1121/<host>`, where `<host>` is the app's domain (`www.zyx.tw`, `ui.zyx.tw`, `3d.zyx.tw`).
- A merge to `main` ships every app at once through land: carrel-deployd on VM 117 runs `deploy/carrel-start.sh`, which sets each `*_VERSION` in `/opt/www-zyx-tw/.env` to `sha-<commit>` and restarts the stack. Wait for it with `golem-watch zyx1121/www.zyx.tw <sha>`. Ports go in `.env` (`.env.example`); each app's own settings go in `env/<app>.env` (`apps/<app>/.env.example`).
- Vercel deploys nothing (`git.deploymentEnabled` is off in every `vercel.json`). `apps/stamp` is retired and not deployed.
- After a merge, verify that each changed app serves the merge commit: the image's `sha-<commit>` tag and the live page.
