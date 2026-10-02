# Web app guidance

Read the [repository README](../../README.md) and [design contract](../ui/DESIGN.md) before changing this app. For framework changes, consult the relevant installed Next.js guide under `node_modules/next/dist/docs/` in the validation environment.

## Made products

Read [MADE.md](./MADE.md) before adding a product or changing Made layout, imagery, motion, metadata or navigation. Start new product work with the [product brief](./templates/made-product.md). Follow the existing product's generation record when replacing its assets.

- The Made index shares About and Works layout, typography, corners and entrance motion. Product detail pages own their full-viewport campaign imagery.
- Reuse `MadeExperience`, the orientation-aware video player, the shared layout helpers and `MaskReveal`. Preserve photo fallback, pause controls and reduced motion.
- Complete both desktop and mobile assets, HTML and Markdown routes, and the page registry. Adding an entry to `PRODUCTS` alone does not publish a complete product.
- Keep universal design rules in `apps/ui/DESIGN.md`, the publishing workflow in `MADE.md`, and product prompts and processing facts in `public/made/identities/<id>-generation.json`. Update the relevant source when its behavior changes.

In Loki's environment, local work is editing and git only. Run installs, builds, typechecks, tests, servers and image/video processing on the sandbox through `ssh sandbox` and a login shell, using an isolated directory and port. Use Safari for browser verification. Repository documents and comments are English; local handoff notes are Traditional Chinese.
