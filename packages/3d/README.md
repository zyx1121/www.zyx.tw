# @workspace/3d

Turns an SVG into a 3D object and renders it from one `scene.json`. The editor at [Plump](https://plump.zyx.tw) (`apps/3d`) writes the file; any app in this monorepo renders it with `<Scene3D>`.

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

2. Export a scene.json from plump.zyx.tw, keep it next to your component, and render it from a client component:

   ```tsx
   "use client"

   import { parseScene, Scene3D } from "@workspace/3d"

   import logo from "./logo.scene.json"

   const scene = parseScene(logo)

   export function Logo() {
     return <Scene3D scene={scene} controls={false} autoRotate />
   }
   ```

`<Scene3D>` fills its parent, so give the parent a size. `autoRotate` turns the shape itself, so it works with `controls` off. The camera angle comes from the scene's staging; `view` overrides it, in degrees (`DEFAULT_VIEW` is Oblique's: 30° to the left and 30° above), and when either changes the camera swings over. The scene's `motion.hover` needs nothing on your side: the shape leans toward a mouse over the canvas, up to 18° at its edge, and grows a little under it. With `deviceTilt`, a touch screen's turns stand in for the mouse: the shape holds still in the room while the device turns around it, up to the same 18°, and faces front again once the device rests. iOS lets a page read the device's orientation only after the visitor allows it, and asks only on a tap, so the first tap on the canvas asks; the answer holds for the rest of the session. Environment maps load from `https://plump.zyx.tw/env/`, which sends `Access-Control-Allow-Origin: *`; pass `envBaseUrl` to serve them from somewhere else.

## scene.json v1

| Field | What it holds |
| --- | --- |
| `version` | Always `"v1"`. A breaking change becomes `"v2"`. |
| `shape` | The SVG markup, plus `depth`, `bevel`, `bevelSegments` and `curveSegments`, in scene units where the shape's longer side is 2. A shape typed as text in the editor also keeps `text`: the `value` typed and the editor's `font` id, so it can be edited again. Its outlines are in `svg` like any other shape, so renderers never read `text`. |
| `material` | A material preset `id` and its `params`. |
| `environment` | An environment preset `id`, its `intensity`, `rotation` in degrees, and whether it shows as the `background`. |
| `staging` | A staging preset `id`, which sets the camera angle, the key light and, for Floor, a soft shadow on an invisible floor; and the `background` color. |
| `motion` | `hover`: whether the shape leans toward the mouse and grows under it. |
| `effects` | Postprocessing effects, each an `id` and its `params`. They run in registry order, one of each, whatever order the file lists them in. |

Fixed params are still written, always at their defaults. Numbers outside a control's range are clamped. An unknown material, environment or staging id falls back to the first preset and an unknown effect is skipped, so old files keep rendering as presets come and go. A file from before stagings, with no `staging.id` and no `motion`, gets Oblique, the look it had, and hover on; its `lightAzimuth`, `lightElevation` and `lightIntensity` are ignored, since Oblique carries the same light.

## Add a preset

Each preset is one file. Its `params` define the editor's controls, so the panel needs no changes.

1. Create the file in `src/materials/`, `src/effects/`, `src/environments/` or `src/stagings/`:

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
3. For an environment, convert its HDRI to a gain map first (for example with the free [Gain map creator](https://gainmap-creator.monogrid.com): WebP output, 4096 × 2048) and put `sdr.webp`, `gainmap.webp` and `metadata.json` in `apps/3d/public/env/<name>/`; the preset then sets `files: gainMapFiles("<name>")`. A plain `.hdr` path works too, but weighs about 30 times as much.

A param is a `number` (slider), a `color` (color picker) or a `boolean` (switch). Mark it `fixed: true` to keep it at its default: the editor hides it and the renderer ignores other values, so a look that needs another value becomes its own preset instead of another slider. An effect also names its `stage`: `"scene"` effects run on the linear frame before tone mapping, which glow needs; `"display"` effects run on the finished image, background included, which a vignette or grain needs.

A staging (`defineStaging`) has no params. It sets the camera `view` and the key `light`, both in degrees around and above the shape, plus the light's intensity; optionally an `object` transform (`position` in scene units, `rotation` in degrees); and optionally a `floor`: the `gap` under the shape, and the shadow's `opacity` and `blur` in scene units. Oblique stays first in `src/stagings/index.ts`, since files without a staging id get it.

## Credits

Environment maps from [Poly Haven](https://polyhaven.com), CC0, converted to 4096 × 2048 gain maps: Studio Small 03, Potsdamer Platz and Shanghai Bund by Greg Zaal; Wooden Studio 10 and Wooden Studio 14 by Alexander Scholten; Ferndale Studio 05 and Pretville Cinema by Dimitrios Savva and Jarod Guest; Ferndale Studio 06 by Dimitrios Savva and Greg Zaal; The Sky Is On Fire by Greg Zaal and Rico Cilliers; Kloofendal 48d Partly Cloudy (Pure Sky) by Greg Zaal and Jarod Guest.

Pink castle, Crystal cave, Dream garden and Underwater were generated with OpenAI image generation (via Codex) and upscaled with [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) x4plus. Each was made to wrap seamlessly, resized to 4096 × 2048 and smoothed at the zenith and nadir, then lifted to HDR: midtones scaled by 0.9 and near-white highlights brightened, keeping their hue. Their gain maps use linear tone mapping for the SDR image, where the Poly Haven maps use ACES.

The former editor address, `3d.zyx.tw`, remains an alias with working environment maps. Browser storage is per origin: scenes saved there stay there. Export a `scene.json` from the old address and open it in Plump to move it; the scene format and storage keys remain compatible.
