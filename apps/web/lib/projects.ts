import data from "./projects.json"

export type Project = {
  /** File-safe id; the preview files are named after it. */
  slug: string
  name: string
  href: string
  /** What it is for, in about 32 characters: the row shows it on one line. */
  purpose: string
  /**
   * Written by `bun run previews` (scripts/previews.py): a 1440x900 color
   * screenshot and its dithered twin that the preview stage shows at rest.
   * `focus` is the CSS object-position that keeps the screenshot's content in
   * frame, as two percentages ("50% 0%" keeps the top edge).
   */
  preview: { image: string; dither: string; focus: string }
}

/**
 * The single project list: /works with its preview stage, /works.md, the
 * Latest list's site names and the preview capture script all read
 * lib/projects.json, so adding a project is one edit there.
 */
export const projects: Project[] = data
