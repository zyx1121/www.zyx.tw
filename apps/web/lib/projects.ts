import data from "./projects.json"

/** A picture in a section, captured so its text reads at page size. */
export type Picture = {
  kind: "picture"
  src: string
  /** The file's shape: 16:9 or 4:3. */
  ratio: "wide" | "standard"
  /** What it shows, for the Markdown twin and screen readers. */
  alt: string
}

/**
 * A drawing in box-drawing characters, set as text so it is as legible as
 * the page around it. `wide` fits 66 cells (the narrowest column from the sm
 * breakpoint up); `narrow` fits 30 cells, for phones. ASCII and box-drawing
 * characters only, so every glyph keeps one cell.
 */
export type Diagram = {
  kind: "diagram"
  wide: string[]
  narrow: string[]
  alt: string
}

/** One part of a project's page, from the overview toward the detail. */
export type Section = {
  title: string
  body: string[]
  figure?: Picture | Diagram
  /** Terms with one line each, set in the label column of the details. */
  points?: { term: string; text: string }[]
}

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
  /**
   * The rest of its page, for a project with more to say: how it works, its
   * parts and how it is built, each with a figure where one helps.
   */
  sections?: Section[]
  /** What it is built with, a handful of names. */
  stack: string[]
  /**
   * Written by `bun run previews` (scripts/previews.py): a 1440x1080 color
   * screenshot and its dithered twin. The window uses a matching 4:3 image
   * area and contains other aspect ratios without cropping.
   * `focus` places any spare space as two percentages ("50% 0%" aligns top).
   * `zoom` captures a viewport that many times smaller at that pixel density,
   * so the site's text is larger in the same 1440x1080 file. `source` is the
   * page to capture when it is not `href`, and `selector` captures one
   * element of it, centered on the page's background.
   */
  preview: {
    image: string
    dither: string
    focus: string
    zoom?: number
    source?: string
    selector?: string
  }
}

/**
 * The single project list: /works with its preview stage, each project's
 * page at /works/<slug>, their Markdown twins and llms.txt (lib/markdown.ts),
 * the JSON-LD and the preview capture script all read lib/projects.json, so adding a project is one edit there.
 */
export const projects = data as Project[]

/** The project's own page on this site. */
export function projectPath(project: Pick<Project, "slug">) {
  return `/works/${project.slug}`
}

export function findProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}
