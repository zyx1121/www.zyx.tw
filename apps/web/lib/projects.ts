import data from "./projects.json"

export type Project = {
  /** File-safe id; the preview files are named after it. */
  slug: string
  name: string
  href: string
  /** Its source code, when the repository is public. */
  code?: string
  /** What it is for, in about 32 characters: the row shows it on one line. */
  purpose: string
  /** Its page at /works/<slug>: a few short paragraphs, one idea each. */
  intro: string[]
  /** What it is built with, a handful of names. */
  stack: string[]
  /**
   * Written by `bun run previews` (scripts/previews.py): a 1440x1080 color
   * screenshot and its dithered twin. The window uses a matching 4:3 image
   * area and contains other aspect ratios without cropping.
   * `focus` places any spare space as two percentages ("50% 0%" aligns top).
   */
  preview: { image: string; dither: string; focus: string }
}

/**
 * The single project list: /works with its preview stage, each project's
 * page at /works/<slug>, their Markdown twins and llms.txt (lib/markdown.ts),
 * the JSON-LD and the preview capture script all read lib/projects.json, so adding a project is one edit there.
 */
export const projects: Project[] = data

/** The project's own page on this site. */
export function projectPath(project: Pick<Project, "slug">) {
  return `/works/${project.slug}`
}

export function findProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}
