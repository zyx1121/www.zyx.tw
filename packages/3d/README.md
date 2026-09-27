# @workspace/3d

Turns an SVG into a 3D object and renders it from one `scene.json`. The editor at [3d.zyx.tw](https://3d.zyx.tw) (`apps/3d`) writes the file; any app in this monorepo renders it with `<Scene3D>`.

## Render a scene in another app

1. Depend on the package and let Next.js transpile it:

   ```jsonc
   // apps/<app>/package.json
   "dependencies": { "@workspace/3d": "workspace:*" }
   ```

   ```js
   // apps/<app>/next.config.mjs
   transpilePackages: ["@workspace/3d" /* , ... */]
   ```

2. Export a scene.json from 3d.zyx.tw, keep it next to your component, and render it from a client component:

   ```tsx
   "use client"

   import { parseScene, Scene3D } from "@workspace/3d"

   import logo from "./logo.scene.json"

   const scene = parseScene(logo)

   export function Logo() {
     return <Scene3D scene={scene} controls={false} autoRotate />
   }
   ```

`<Scene3D>` fills its parent, so give the parent a size. `autoRotate` turns the shape itself, so it works with `controls` off. `view` sets the starting camera angle in degrees; the default, `DEFAULT_VIEW`, looks from 45° to the left and 30° above. Environment maps load from `https://3d.zyx.tw/env/`, which sends `Access-Control-Allow-Origin: *`; pass `envBaseUrl` to serve them from somewhere else.

## scene.json v1

| Field | What it holds |
| --- | --- |
| `version` | Always `"v1"`. A breaking change becomes `"v2"`. |
| `shape` | The SVG markup, plus `depth`, `bevel`, `bevelSegments` and `curveSegments`, in scene units where the shape's longer side is 2. |
| `material` | A material preset `id` and its `params`. |
| `environment` | An environment preset `id`, its `intensity`, `rotation` in degrees, and whether it shows as the `background`. |
| `staging` | The `background` color and the key light's `lightAzimuth`, `lightElevation` (degrees) and `lightIntensity`. |
| `effects` | Postprocessing effects, each an `id` and its `params`. They run in registry order, one of each, whatever order the file lists them in. |

Fixed params are still written, always at their defaults. Numbers outside a control's range are clamped. An unknown material or environment id falls back to the first preset and an unknown effect is skipped, so old files keep rendering as presets come and go.

## Add a preset

Each preset is one file. Its `params` define the editor's controls, so the panel needs no changes.

1. Create the file in `src/materials/`, `src/effects/` or `src/environments/`:

   ```tsx
   // src/materials/chrome.tsx
   import { defineMaterial } from "../registry"

   export const chrome = defineMaterial({
     id: "chrome",
     label: "Chrome",
     params: {
       roughness: {
         type: "number",
         label: "Roughness",
         min: 0,
         max: 1,
         step: 0.01,
         default: 0.05,
       },
     },
     render: ({ roughness }) => (
       <meshPhysicalMaterial metalness={1} roughness={roughness} />
     ),
   })
   ```

2. List it in that folder's `index.ts`.
3. For an environment, also put its `.hdr` in `apps/3d/public/env/`.

A param is a `number` (slider), a `color` (color picker) or a `boolean` (switch). Mark it `fixed: true` to keep it at its default: the editor hides it and the renderer ignores other values, so a look that needs another value becomes its own preset instead of another slider. An effect also names its `stage`: `"scene"` effects run on the linear frame before tone mapping, which glow needs; `"display"` effects run on the finished image, background included, which a vignette or grain needs.

## Credits

Environment maps from [Poly Haven](https://polyhaven.com), CC0: Studio Small 03 and Potsdamer Platz, both by Greg Zaal.
