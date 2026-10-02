# Publishing a Made product

Made presents selected zyx products through a shared index and individual visual campaigns. Use this guide with the [product brief](./templates/made-product.md) when adding a product or replacing a campaign.

The [design contract](../ui/DESIGN.md) owns site-wide rules. This guide owns the publishing workflow. The [asset README](./public/made/identities/README.md) and each product's generation JSON preserve the current creative direction, prompts and processing history.

## Page roles

| Surface | Purpose | Shared behavior |
| --- | --- | --- |
| About | Personal background and CV | The layout and typography reference for the site |
| Works | The full project inventory | Project names, purposes and screenshot previews from `lib/projects.json` |
| `/made` | A curated product collection | One artwork card per `PRODUCTS` entry, linking to its introduction |
| `/made/<id>` | A product introduction | Campaign photograph/video, purpose, Open link, 3D viewer and All products link |
| Product URL | The working application | Open leads here, using the product's `href` |

Keep the index within the main site's visual system. The individual campaign can express a product's material, color, setting and photography. Made cards lead to introductions; the introduction's Open action leads to the application.

## Accepted design baseline

These decisions were confirmed in October 2026. Apply the current design contract if shared values change, and update this guide alongside the implementation.

| Concern | Index | Product introduction |
| --- | --- | --- |
| Layout | Reuse `column` and `page`: centered 576/768/1024px column, 20px inner gutters, title 120px from the top | Full viewport with separately composed landscape and portrait artwork |
| Type | 24/32px page title, 16/24px product names, 14/20px supporting text | 80/80px product name, shared interface sizes for copy and controls |
| Font | Shared Inter and CJK stack | Same stack, with the established Helvetica Neue exception for Plump campaign copy |
| Corners | Current page foreground, other links muted; shared top/bottom fade | Image-aware ink for legibility; the zyx mark remains the site signature |
| Cards | 16px radius, one column below 1024px, three columns from 1024px | Reuse the shared campaign component and controls |
| Motion | Shared 300ms fade, rows 25ms apart, 600ms `MaskReveal`, 1.025 image scale on hover or keyboard focus | Near-still video, inline, muted and looping, with visible Pause/Play |

The index shows material artwork directly. Keep the Material/Shape and Photo/Print switches removed. The 80px title belongs to the product introduction. Keep the index title, left edge and navigation aligned when moving between Made, Works and About.

Two breakpoints have different jobs: the index grid changes at 1024px, while campaign images and videos select portrait at 900px and below. Do not conflate them.

Under reduced motion, the index is immediately visible without fades, masks or zoom. The campaign keeps its photograph and does not request a motion video. Hidden tabs pause video; returning to the tab must not undo a visitor's manual pause. A failed video falls back to its photograph, and blocked autoplay must still offer Play.

## Files to update

Paths in this table are relative to `apps/web/`.

| File | Responsibility |
| --- | --- |
| [`lib/made.ts`](./lib/made.ts) | `PRODUCTS`, display order, copy, external URL, alt text, inferred product ID type and asset filenames |
| `app/made/<id>/page.tsx` | Static HTML route, canonical metadata and campaign Open Graph image |
| `app/made/<id>.md/route.ts` | Static Markdown twin using `productMarkdown(id)` |
| [`lib/site.json`](./lib/site.json) | Route discovery, sitemap, `llms.txt`, Markdown negotiation and alternate links |
| [`components/made-experience.tsx`](./components/made-experience.tsx) | Index cards, campaign, video lifecycle and on-demand model dialog |
| [`app/made/made.css`](./app/made/made.css) | Layout and campaign composition; scope any product-specific adjustment |
| [`public/made/identities/`](./public/made/identities/) | Published assets and generation records |
| [`lib/projects.json`](./lib/projects.json) | Optional corresponding Works entry, with its own screenshot previews |

The index, asset URLs and `ProductId` automatically follow `PRODUCTS`. HTML routes, Markdown routes and `site.json` are currently explicit and must be added. Existing product pages select `PRODUCTS` by array position, so preserve the order when appending; if reordering, update and verify all page metadata. New pages should select their product by ID.

## Product brief

Copy the [brief template](./templates/made-product.md) into the product's task notes. Fill in the product ID, name, one-line purpose, application URL, shape, material, campaign direction and approved references before preparing final assets. Keep the current selection and rejected directions in those notes, so a later session does not regenerate an abandoned design.

The current series uses original adult fashion-editorial subjects, restrained clothing, everyday settings and one oversized geometric object. Plump is a chrome four-lobed form, Time an open amber C-ring, and Link a vermilion double-loop with two holes and one broad bridge. New products should have a distinct silhouette and material while fitting the same photographic series. Record intentional changes to that direction in the brief.

Product copy stays literal: a name, a short purpose and a clear Open action. Keep interface text out of generated images, including titles, labels, signage and watermarks. Write alt text for the selected photograph, including the subject, object and setting.

## Asset contract

Use a stable lowercase, hyphenated product ID. All published files live in `public/made/identities/` and use the same ID prefix.

| Filename | Expected content |
| --- | --- |
| `<id>.svg` | Canonical geometric silhouette used by the product mark |
| `<id>.scene.json` | Plump scene schema `v1`, embedding the matching SVG and material settings |
| `<id>.glb` | Export of that geometric model for download |
| `<id>-material.webp` | Square 1024 × 1024 material artwork for the index |
| `<id>-hero.webp` | Graded 1920 × 1080 landscape photograph and video poster |
| `<id>-portrait.webp` | Separately composed, graded 1080 × 1920 mobile photograph and poster |
| `<id>-hero-motion.mp4` | Landscape motion clip derived from the approved landscape source |
| `<id>-portrait-motion.mp4` | Portrait motion clip derived from the approved portrait source |
| `<id>-generation.json` | Generation steps, references, prompts, model, processing settings and export facts |

The current renderer and Markdown downloads expect the SVG, scene and GLB for every product. The current video player expects both MP4s for every product. A photo-only or model-free product requires an explicit component capability change; fallback behavior is not a substitute for completing the asset set.

Generated material and campaign images interpret the geometric reference. They are not renderer screenshots or evidence of a physical product. Preserve the actual silhouette in the SVG, scene and GLB, even when the photographic rendering differs.

## Image and motion workflow

1. **Establish the object.** Prepare the canonical SVG, scene and GLB. Use the exact silhouette and chosen material as the reference for the square artwork and campaign. Check holes, connecting bridges, thickness and orientation before selecting an image.
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

1. Add the product to `PRODUCTS` with `id`, `name`, `purpose`, `description`, `href`, `material` and `imageAlt`. The array order is the index order. Use the existing `asset(id, suffix)` naming convention.
2. Add `app/made/<id>/page.tsx`, using an existing product page as the structure. Select the product by ID, export `dynamic = "force-static"`, call `pageMetadata` with the product's path and landscape poster, and render `<MadeExperience product="<id>" />`. Ensure metadata and the rendered product refer to the same ID.
3. Add `app/made/<id>.md/route.ts`, exporting `GET()` with `markdownResponse(productMarkdown("<id>"))` and `dynamic = "force-static"`. Add one entry to `lib/site.json` with `path: "/made/<id>"`, `markdown: "/made/<id>.md"`, the product name as `label`, a useful summary, `changeFrequency: "monthly"` and `priority: 0.8`. Omit `nav` on the product entry so the fixed corner nav remains short.
4. Add the complete asset set and generation record. Reuse the shared campaign and player; product-specific CSS should only solve an actual composition or readability problem. If a new aspect ratio changes metadata, update the declared dimensions too.
5. Add or update the corresponding Works entry when it belongs in the full project inventory. Works uses screenshot previews, not Made campaign images. The existing preview script's capture mode uses Chromium; use Safari captures under Loki's browser preference, then use its `--dither-only` processing mode as needed. Do not run its capture mode without explicit Chromium authorization.

## Acceptance and publishing

Use the brief's checklist to attach evidence to the product task or PR. A completed generation job, an uploaded preview or a merged commit alone is not proof that a product is live.

| Check | Evidence |
| --- | --- |
| Shared layout | Switch About → Works → Made. Compare title size, left edge, top offset, navigation colors, radius and entrance motion. Verify all cards after adding a row. |
| Responsive layout | Safari desktop, 1024px and 320px viewports; all artwork loaded, no horizontal overflow, no overlap among title, face, Open, Pause/Play and bottom controls. Also cross the 900px campaign breakpoint. |
| Interaction | Card → introduction → application, All products return, keyboard focus and download links. Open the 3D viewer and confirm the correct model. |
| Motion | Observe decoded video frames and advancing `currentTime`, including a loop boundary. Test Pause/Play, hidden-tab behavior, reduced motion and a failed-video fallback. Confirm portrait/landscape requests use the correct product. |
| Discovery | HTML and Markdown routes, `Accept: text/markdown`, canonical and Open Graph metadata, sitemap and `llms.txt` all identify the new product correctly. |
| Production media | Images and MP4s return 200 with correct content types and committed hashes; MP4 byte-range requests return 206. Verify the actual production domain and deployment commit. |

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
