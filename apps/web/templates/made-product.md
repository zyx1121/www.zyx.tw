# Made product brief: <name>

Copy this template into the product's task notes and fill it in using the [publishing guide](../MADE.md). Put public implementation and validation facts in the PR; keep local archive paths, job details and handoff notes in project notes.

## Product

| Field                                 | Decision                                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Stable ID                             | `<lowercase-id>`                                                                                      |
| Display name                          |                                                                                                       |
| One-line purpose                      |                                                                                                       |
| Description                           |                                                                                                       |
| Working application URL               |                                                                                                       |
| Product type and platforms            | `app` or `infrastructure`; `web`, `ios`, `macos` as applicable                                        |
| Primary action and destination        | Application, download or an on-page setup section                                                     |
| Motion / 3D viewer                    | Set `motion` and `model` explicitly                                                                   |
| Page sections and demonstrations      | One `/made/<id>` page; alternate full-bleed `100dvh` images and content sections of at least `100dvh` |
| Availability and access requirements  |                                                                                                       |
| Index order                           |                                                                                                       |
| Existing or new Works entry           |                                                                                                       |
| Shape, holes and geometry constraints |                                                                                                       |
| Material and color                    |                                                                                                       |

## Creative direction

| Field                                    | Decision                                                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Setting, subject and wardrobe            |                                                                                                                               |
| Casting requirements                     | Young adult women, Japanese/Korean fashion-editorial styling and youthful energy; verify visually against selected references |
| Landscape composition and text space     |                                                                                                                               |
| Portrait composition and text space      |                                                                                                                               |
| Full-screen chapter compositions         | Landscape and portrait sources; meaningful objects survive the actual viewport crop                                           |
| Selected references and source filenames |                                                                                                                               |
| Selection confirmed by and date          |                                                                                                                               |
| Rejected directions to avoid             |                                                                                                                               |
| Final photograph alt text                |                                                                                                                               |
| Allowed motion                           |                                                                                                                               |
| Features that must remain rigid          |                                                                                                                               |
| Accepted loop limitations                |                                                                                                                               |

## Production record

| Field                                     | Record                                        |
| ----------------------------------------- | --------------------------------------------- |
| Image provider/model and selected job IDs |                                               |
| Video provider/model and selected job IDs |                                               |
| Source and raw-video archive location     | Keep private locations in project notes       |
| Prompts and generation JSON               | `public/made/identities/<id>-generation.json` |
| Grading script revision and settings      |                                               |
| Final asset dimensions, bytes and hashes  | Include both orientations                     |
| Actual generation spend                   | Include rejected attempts separately          |

## Completion checklist

- [ ] Identity assets complete: SVG and a square material WebP matching Plump's material card setup; matching scene `v1` and GLB when `model: true`.
- [ ] Landscape and portrait complete: selected source, graded WebP, motion MP4 when `motion: true`, any chapter images, inspected exports and generation record.
- [ ] Site registration complete: `PRODUCTS`, HTML route, Markdown route, `site.json`, metadata and any Works entry.
- [ ] Sandbox checks and Safari acceptance passed: shared layout, only 24/16/14px rendered text, 320px/1024px/desktop, keyboard, navigation, model, motion controls, reduced motion and failure fallback. Attach measurements and any remaining limitations.
- [ ] Published and verified: CI, merged commit, READY production alias, live HTML/Markdown/media and Safari playback. Remove temporary QA and task-owned processes.

## Release evidence

| Evidence                                  | Result or link |
| ----------------------------------------- | -------------- |
| PR and merged commit                      |                |
| Required CI checks                        |                |
| Safari layout and motion evidence         |                |
| Production deployment and alias           |                |
| Live product introduction                 |                |
| Published media hashes and range response |                |
| Known limitations                         |                |

## Localization

- Traditional Chinese copy (default):
- English copy:
- Dictionary entries, translated metadata and Markdown checked:
- Both languages checked at 320px and desktop, using the same three type sizes:
