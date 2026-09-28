/**
 * Page copy that is not in the shared profile (packages/ui/src/lib/profile.ts),
 * lib/resume.ts or lib/projects.json, so every page and its Markdown twin read
 * one string.
 */
export const HOME = { title: "loki, 詹詠翔." } as const

export const LATEST = { title: "Latest" } as const

export const WORKS = { title: "Works" } as const

export const ABOUT = { title: "About" } as const

export const CONTACT = { title: "Contact" } as const

export const NOT_FOUND = {
  title: "Not found.",
  lead: "These pages exist:",
  agents: "For agents",
  llms: "what this site is and how an agent should read it",
  twin: "as Markdown",
} as const
