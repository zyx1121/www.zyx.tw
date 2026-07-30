# zyxui

The CLI for [ui.zyx.tw](https://ui.zyx.tw). Copies components out of the registry and into a Next.js project.

```bash
bunx zyxui@latest init
bunx zyxui@latest add button badge dialog
```

## Why not shadcn's CLI

shadcn's CLI carries a style matrix: three headless bases, a dozen base colors, named styles, presets, four framework templates, and a `components.json` to remember which combination you picked. That machinery exists so thousands of projects can each pick a different point in the space.

This registry is one point in that space. So the matrix is gone:

| shadcn                                     | zyxui                            |
| ------------------------------------------ | -------------------------------- |
| `style` (new-york, base-nova, …)           | one look                         |
| `--base` (base-ui / radix / react-aria)    | base-ui                          |
| `baseColor` (neutral, slate, zinc, …)      | one palette, 8 colors            |
| `--template` (next, vite, astro, laravel…) | Next.js App Router               |
| `components.json`                          | no config file                   |
| `registries` map, namespaces               | one registry                     |
| presets, `apply`, `migrate`, `eject`       | gone                             |
| `@import "shadcn/tailwind.css"`            | self-contained `app/globals.css` |

What is left is three commands and no config file. Paths come from the registry item's own `target`, so `zyxui add button` writes `components/ui/button.tsx` because that is what the registry says. A `src/` layout is detected, not configured.

## Commands

```
zyxui init                 write app/globals.css + lib/utils.ts
zyxui add <name...>        copy components in, dependencies first
zyxui list                 everything in the registry
```

Flags: `--root <dir>`, `--overwrite`, `--dry-run`, `--no-install`.

`init` claims `app/globals.css`, because the one create-next-app generates carries nothing worth keeping. Once that file holds the zyx tokens, `init` leaves it alone unless you pass `--overwrite`.

`add` resolves `registryDependencies` depth-first, so `copy-command` pulls in `copy-button`, which pulls in `button`. `lib/utils.ts` is implied by any component rather than declared by each one.

## Design notes

**No config file.** shadcn needs one because the same registry serves many shapes of project. Here the shape is fixed, so the paths can be too.

**One index request.** `registry.json` carries every item's metadata, so resolving dependencies takes one fetch; only the items being installed are fetched individually.

**No CSS merging.** Every component in this registry shares one token set, enforced by `DESIGN.md`. So tokens are a file that `init` writes once, not a set of variables that every `add` has to merge into your stylesheet.

**Zero runtime dependencies.** `node:util`'s `parseArgs`, `fetch`, and `node:fs`. No commander, no prompts, no chalk, no ts-morph. Import rewriting is unnecessary because every component imports exactly `@/lib/utils` and its own siblings.

**Non-interactive.** Everything is a flag. Nothing to answer, nothing to remember.

## Environment

`ZYXUI_REGISTRY` overrides the registry base URL, which is how you test against a local `shadcn build` output:

```bash
ZYXUI_REGISTRY=http://localhost:3000/r zyxui add button
```
