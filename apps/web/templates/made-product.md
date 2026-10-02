# Made product brief: <name>

Copy this template into the product's task notes and fill it in using the [publishing guide](../MADE.md). Put public implementation and validation facts in the PR; keep local archive paths, job details and handoff notes in project notes.

## Product

| Field | Decision |
| --- | --- |
| Stable ID | `<lowercase-id>` |
| Display name | |
| One-line purpose | |
| Description | |
| Working application URL | |
| Index order | |
| Existing or new Works entry | |
| Shape, holes and geometry constraints | |
| Material and color | |

## Creative direction

| Field | Decision |
| --- | --- |
| Setting, subject and wardrobe | |
| Landscape composition and text space | |
| Portrait composition and text space | |
| Selected references and source filenames | |
| Selection confirmed by and date | |
| Rejected directions to avoid | |
| Final photograph alt text | |
| Allowed motion | |
| Features that must remain rigid | |
| Accepted loop limitations | |

## Production record

| Field | Record |
| --- | --- |
| Image provider/model and selected job IDs | |
| Video provider/model and selected job IDs | |
| Source and raw-video archive location | Keep private locations in project notes |
| Prompts and generation JSON | `public/made/identities/<id>-generation.json` |
| Grading script revision and settings | |
| Final asset dimensions, bytes and hashes | Include both orientations |
| Actual generation spend | Include rejected attempts separately |

## Completion checklist

- [ ] Identity assets complete: SVG, scene `v1`, GLB and square material WebP, with matching geometry.
- [ ] Landscape and portrait complete: selected source, graded WebP, graded motion MP4, inspected exports and generation record.
- [ ] Site registration complete: `PRODUCTS`, HTML route, Markdown route, `site.json`, metadata and any Works entry.
- [ ] Sandbox checks and Safari acceptance passed: shared layout, 320px/1024px/desktop, keyboard, navigation, model, motion controls, reduced motion and failure fallback. Attach measurements and any remaining limitations.
- [ ] Published and verified: CI, merged commit, READY production alias, live HTML/Markdown/media and Safari playback. Remove temporary QA and task-owned processes.

## Release evidence

| Evidence | Result or link |
| --- | --- |
| PR and merged commit | |
| Required CI checks | |
| Safari layout and motion evidence | |
| Production deployment and alias | |
| Live product introduction | |
| Published media hashes and range response | |
| Known limitations | |
