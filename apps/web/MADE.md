# Publishing a Made product

Made presents selected apps and infrastructure through a shared index and individual product pages. Use this guide with the [product brief](./templates/made-product.md) when adding a product or replacing a campaign.

The [design contract](../ui/DESIGN.md) owns site-wide rules. This guide owns the publishing workflow. The [asset README](./public/made/identities/README.md) and each product's generation JSON preserve the current creative direction, prompts and processing history.

## Page roles

| Surface                      | Purpose                            | Shared behavior                                                                                    |
| ---------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| About                        | Personal background and CV         | The layout and typography reference for the site                                                   |
| Works                        | The full project inventory         | Project names, purposes and screenshot previews from `lib/projects.json`                           |
| `/made`                      | A curated product collection       | One artwork card per `PRODUCTS` entry, linking to its introduction                                 |
| `/made/<id>`                 | A product introduction             | Campaign photograph/video, purpose, primary action, optional 3D viewer and optional story sections |
| Product URL or setup section | The way to start using the product | The primary action leads here, using the product's `href` and `action`                             |

Keep the index within the main site's visual system. The individual campaign can express a product's material, color, setting and photography. Made cards lead to introductions. The primary action opens an application or reaches setup instructions on the same page.

## Product types and page composition

Keep product type and platform separate: `kind` is `app` or `infrastructure`, while `platforms` can contain `web`, `ios` and `macos`. A product can support multiple platforms. Cards show the resulting category label; only add collection filters when the number of products makes them useful.

Each product has one introduction at `/made/<id>`. A compact product can end after the campaign. A more involved product can pass story content as children to `MadeExperience`. Alternate a full-bleed photograph occupying `100dvh` and the available viewport width with a separate content section of at least `100dvh`. Only the content section's inner wrapper uses the shared column. Let long content grow on short or narrow screens. Do not inset photographs into that column, round their viewport edges or place copy under an image within the same section. Preserve rounded cards and controls, the common type scale and reduced-motion behavior. Use ordinary document scrolling, without forced snapping.

Carrel is the first extended page: [its story component](./components/carrel-story.tsx) alternates editorial images, short text and interactive explanations. [Its content module](./lib/carrel.ts) feeds both HTML and Markdown. The examples explain a workflow and do not run real infrastructure operations. Its primary action reaches MCP setup on the same page. Availability is stated accurately; do not link visitors to a private repository or an unavailable public landing page.

## Accepted design baseline

These decisions were confirmed in October 2026. Apply the current design contract if shared values change, and update this guide alongside the implementation.

| Concern | Index                                                                                                   | Product introduction                                                              |
| ------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Layout  | Reuse `column` and `page`: centered 576/768/1024px column, 20px inner gutters, title 120px from the top | Full viewport with separately composed landscape and portrait artwork             |
| Type    | 24/32px page title, 16/24px product names, 14/20px supporting text                                      | 24/32px product name, 16/24px prose and controls, 14/20px supporting text         |
| Font    | Shared Inter and CJK stack                                                                              | Same stack, with the established Helvetica Neue exception for Plump campaign copy |
| Corners | Current page foreground, other links muted; shared top/bottom fade                                      | Image-aware ink for legibility; the zyx mark remains the site signature           |
| Cards   | 16px radius, one column below 1024px, three columns from 1024px                                         | Reuse the shared campaign component and controls                                  |
| Motion  | Shared 300ms fade, rows 25ms apart, 600ms `MaskReveal`, 1.025 image scale on hover or keyboard focus    | Near-still video, inline, muted and looping, with visible Pause/Play              |

The index shows material artwork directly. Keep the Material/Shape and Photo/Print switches removed. Made uses exactly three font sizes, 24px, 16px and 14px, on both index and product pages. There is no oversized campaign-title exception. Keep the index title, left edge and navigation aligned when moving between Made, Works and About.

Two breakpoints have different jobs: the index grid changes at 1024px, while campaign images and videos select portrait at 900px and below. Do not conflate them.

Under reduced motion, the index is immediately visible without fades, masks or zoom. The campaign keeps its photograph and does not request a motion video. Hidden tabs pause video; returning to the tab must not undo a visitor's manual pause. A failed video falls back to its photograph, and blocked autoplay must still offer Play.

## Files to update

Paths in this table are relative to `apps/web/`.

| File                                                                 | Responsibility                                                                                        |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [`lib/made.ts`](./lib/made.ts)                                       | `PRODUCTS`, display order, copy, external URL, alt text, inferred product ID type and asset filenames |
| `app/made/<id>/page.tsx`                                             | Static HTML route, canonical metadata and campaign Open Graph image                                   |
| `app/made/<id>.md/route.ts`                                          | Static Markdown twin using `productMarkdown(id)`                                                      |
| [`lib/site.json`](./lib/site.json)                                   | Route discovery, sitemap, `llms.txt`, Markdown negotiation and alternate links                        |
| [`components/made-experience.tsx`](./components/made-experience.tsx) | Index cards, campaign, video lifecycle and on-demand model dialog                                     |
| [`app/made/made.css`](./app/made/made.css)                           | Layout and campaign composition; scope any product-specific adjustment                                |
| [`public/made/identities/`](./public/made/identities/)               | Published assets and generation records                                                               |
| [`lib/projects.json`](./lib/projects.json)                           | Optional corresponding Works entry, with its own screenshot previews                                  |

The index, asset URLs and `ProductId` automatically follow `PRODUCTS`. HTML routes, Markdown routes and `site.json` are currently explicit and must be added. Select products by ID with `getProduct(id)`, including in page metadata, so changing the index order cannot change a page's identity.

## Product brief

Copy the [brief template](./templates/made-product.md) into the product's task notes. Fill in the product ID, name, one-line purpose, application URL, shape, material, campaign direction and approved references before preparing final assets. Keep the current selection and rejected directions in those notes, so a later session does not regenerate an abandoned design.

The current series casts original young adult women with a stylish, attractive Japanese/Korean fashion-editorial look and youthful energy, following the owner's selected references. An unspecified adult subject is not enough. Inspect the actual face, hair, wardrobe, pose and mood against those references; an age written in a prompt is not acceptance evidence. Keep the everyday setting and oversized geometric object. Carrel uses long black hair with wispy bangs, a white blouse and relaxed study styling. Its earlier black bob, gray office shirt and mature corporate-portrait direction was rejected. Preserve each existing product's accepted casting and rejected directions in its brief. Plump is a chrome four-lobed form, Time an open amber C-ring, Link a vermilion double-loop with two holes and one broad bridge, and Carrel a cobalt ceramic squared arch in a library.

Product copy stays literal: a name, a short purpose and a clear primary action. Extended sections explain real use cases and supported behavior. Keep interface text out of generated images, including titles, labels, signage and watermarks. Render operational labels and controls as accessible HTML. Write alt text for each selected photograph, including the subject, object and setting.

## Asset contract

Use a stable lowercase, hyphenated product ID. All published files live in `public/made/identities/` and use the same ID prefix.

| Filename                   | Expected content                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `<id>.svg`                 | Canonical geometric silhouette used by the product mark                                                |
| `<id>.scene.json`          | Required when `model: true`: Plump scene schema `v1`, embedding the matching SVG and material settings |
| `<id>.glb`                 | Required when `model: true`: export of that geometric model for download                               |
| `<id>-material.webp`       | Square 1024 × 1024 material artwork for the index, matching Plump's backdrop, light, framing and turn  |
| `<id>-hero.webp`           | Graded 1920 × 1080 landscape photograph and video poster                                               |
| `<id>-portrait.webp`       | Separately composed, graded 1080 × 1920 mobile photograph and poster                                   |
| `<id>-hero-motion.mp4`     | Required when `motion: true`: landscape motion clip derived from the selected landscape source         |
| `<id>-portrait-motion.mp4` | Required when `motion: true`: portrait motion clip derived from the selected portrait source           |
| `<id>-generation.json`     | Generation steps, references, prompts, model, processing settings and export facts                     |

Set `model` and `motion` explicitly for every product. `model: false` removes the viewer and scene/GLB download links; `motion: false` does not request either MP4. When a capability is enabled, complete all its assets; failed-file fallback is not a publishing strategy. Carrel has motion and no downloadable 3D model. Extended pages add named chapter images such as `carrel-workspace.webp` and `carrel-workspace-portrait.webp`, with alt text and generation records. Use separately composed portrait sources wherever a landscape crop loses the subject or meaningful objects. Check every full-screen crop and corner contrast in Safari.

Generated material and campaign images interpret the geometric reference. They are not renderer screenshots or evidence of a physical product. Preserve the actual silhouette in the SVG, scene and GLB, even when the photographic rendering differs.

## Image and motion workflow

1. **Establish the object.** Prepare the canonical SVG and, when offering a 3D viewer, its scene and GLB. Use the silhouette and chosen material as the reference for the square artwork and campaign. Check holes, connecting bridges, thickness and orientation before selecting an image. Generate the square artwork with Plump's material card as the backdrop, light, framing and turn reference and the silhouette as the shape reference, as recorded for Time, Link and Carrel. A material reference photographed from another angle can pull the result back to that angle and light, so compare the turn and the shadow side with Plump before selecting.
2. **Select the landscape photograph.** Keep the subject and object toward the left, with quiet scenery on the right for live text and a clear top edge for navigation. The current image pipeline used OpenRouter `google/gemini-3.1-flash-image`. Model choice may change; record what actually produced the selected image.
3. **Compose the portrait from the selected source.** Preserve identity, clothes, object, lighting and setting. Leave roughly the upper 27% quiet for the title, keep the subject and object inside the central 80% of the width, and allow low-detail space near the bottom for controls. Treat these as composition targets and verify the real `object-fit: cover` crop at 320px. A center crop of the landscape is not the mobile deliverable.
4. **Grade after composition is selected.** Retain ungraded source PNGs. Use [`grade-made-photo.py`](../../scripts/grade-made-photo.py) for the established softness, bloom, lifted blacks and seeded grain. Export its graded PNG as WebP with quality 90 and method 6. Never feed an already graded image through the finish again.
5. **Create motion from each ungraded source.** The current successful baseline is OpenRouter `kwaivgi/kling-v3.0-pro`, requesting about five seconds without audio and using the same approved photograph as first and last frame. Lock the camera, pose, hands and object geometry; limit movement to subtle breathing and a natural blink. Preserve the portrait's text space explicitly. The earlier Runway trial moved too much and deformed Time's ring, so model output must be inspected rather than accepted by model name.
6. **Finish and inspect the clips.** Use [`grade-made-video.py`](../../scripts/grade-made-video.py), then inspect both the exported video and its loop boundary. The script's contact sheet samples the raw source, so it does not replace inspection of the final graded clip. The current exports are H.264, `yuv420p`, no audio, faststart, 24fps and about 5.04 seconds. Requested resolution is not proof of delivered dimensions; record the actual dimensions, frame count, duration, bytes and SHA-256.

Run processing on the development sandbox, from the repository root:

```sh
uv run --with pillow --with numpy python scripts/grade-made-photo.py /path/to/approved-source.png
uv run --with imageio-ffmpeg --with pillow --with numpy python scripts/grade-made-video.py /path/to/clip-raw.mp4
```

OpenRouter exposes video models through `/api/v1/videos/models` and generation through `/api/v1/videos`. Its default text-model listing is not a reliable test of video support. Check current model capabilities and pricing before generation. The October 2026 Kling runs cost US$0.56 per orientation; this is historical spend, not a pricing guarantee.

Use the existing [Time](./public/made/identities/time-generation.json), [Plump](./public/made/identities/plump-generation.json) and [Link](./public/made/identities/link-generation.json) records as examples. Preserve prompts, reference filenames, selected source hashes, processing parameters, script revision or hash, final export hashes and actual spend. Keep original sources, raw clips and job records in a durable project archive and record its location in the task notes. Only publish sanitized generation records, without credentials or expiring signed URLs.

Identical first and last reference images do not guarantee a seamless loop. Reject visible geometry changes, broken hands, strong pose drift or a distracting boundary jump. Record any accepted small natural pose difference in `loop_note`.

## Wire the product into the site

1. Add the product to `PRODUCTS` with `id`, `name`, `purpose`, `description`, `href`, `action`, `material`, `imageAlt`, `kind`, `platforms`, `motion` and `model`. The array order is the index order. Use the existing `asset(id, suffix)` naming convention.
2. Add `app/made/<id>/page.tsx`, using an existing product page as the structure. Select the product with `getProduct(id)`, export `dynamic = "force-static"`, call `pageMetadata` with the product's path and landscape poster, and render `<MadeExperience product="<id>" />`. Pass any product-specific story as children, give its root `id="story"` for the Explore anchor, and include that same content in its Markdown twin. Ensure metadata and the rendered product refer to the same ID.
3. Add `app/made/<id>.md/route.ts`, exporting `GET()` with `markdownResponse(productMarkdown("<id>"))` and `dynamic = "force-static"`. Add one entry to `lib/site.json` with `path: "/made/<id>"`, `markdown: "/made/<id>.md"`, the product name as `label`, a useful summary, `changeFrequency: "monthly"` and `priority: 0.8`. Omit `nav` on the product entry so the fixed corner nav remains short.
4. Add the complete asset set and generation record. Reuse the shared campaign and player; product-specific CSS should only solve an actual composition or readability problem. If a new aspect ratio changes metadata, update the declared dimensions too.
5. Add or update the corresponding Works entry when it belongs in the full project inventory. Works uses screenshot previews, not Made campaign images. The existing preview script's capture mode uses Chromium; use Safari captures under Loki's browser preference, then use its `--dither-only` processing mode as needed. Do not run its capture mode without explicit Chromium authorization.

## Acceptance and publishing

Use the brief's checklist to attach evidence to the product task or PR. A completed generation job, an uploaded preview or a merged commit alone is not proof that a product is live.

| Check             | Evidence                                                                                                                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared layout     | Switch About → Works → Made. Compare title size, left edge, top offset, navigation colors, radius and entrance motion. Verify all cards after adding a row.                                                                                                                                      |
| Responsive layout | Safari desktop, 1024px and 320px viewports; all artwork loaded, no horizontal overflow, no overlap among title, face, Open, Pause/Play and bottom controls. Also cross the 900px campaign breakpoint.                                                                                            |
| Interaction       | Card → introduction → application or setup, All products return and keyboard focus. Check story controls, anchors and copy buttons when present. For `model: true`, verify the viewer and all downloads; otherwise confirm no model requests or missing download links.                          |
| Motion            | For `motion: true`, observe decoded frames and advancing `currentTime`, including a loop boundary. Test Pause/Play, hidden-tab and offscreen pause, reduced motion and failed-video fallback. Confirm orientation requests use the correct product. For `motion: false`, confirm no MP4 request. |
| Discovery         | HTML and Markdown routes, `Accept: text/markdown`, canonical and Open Graph metadata, sitemap and `llms.txt` all identify the new product correctly.                                                                                                                                             |
| Production media  | Images and MP4s return 200 with correct content types and committed hashes; MP4 byte-range requests return 206. Verify the actual production domain and deployment commit.                                                                                                                       |

Run the repository's required checks in the sandbox or CI:

```sh
bun run theme:check
bun run typography:check
bun run lint
bun run format:check
bun run typecheck
bun run build
```

Work in an isolated worktree, commit, push and open a PR with an explicit head branch. After checks pass and the change has been reviewed, squash-merge and delete the branch. Verify the production alias points to a READY deployment of the merged commit, then verify the live behavior in Safari. Remove temporary QA elements and stop only the task's own preview server and tunnel.

If this work changes a shared rule, update the design contract. If it changes this publishing process, update this guide. If it changes a selected image or video, update that product's generation record and archive reference. Keep personal infrastructure details and session handoff notes in the existing project memory, with a pointer to this guide.
