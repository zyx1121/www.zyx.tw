import { EMAIL, GITHUB_USER } from "@workspace/ui/lib/profile"

/**
 * The about page's resume, as data so /about and /about.md say the same
 * thing. Every entry is checked against a record: the degrees against the
 * schools, the paper against its DOI.
 */

/** A labelled fact; one with `href` renders as a link. */
export type Fact = { label: string; value: string; href?: string }

export const FACTS: Fact[] = [
  { label: "Based", value: "Hsinchu, Taiwan" },
  { label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
  {
    label: "GitHub",
    value: `@${GITHUB_USER}`,
    href: `https://github.com/${GITHUB_USER}`,
  },
]

/** A timeline entry: when, what, and where it happened. */
export type Milestone = {
  when: string
  what: string
  where: string
  href?: string
}

/** Newest first. */
export const TIMELINE: Milestone[] = [
  {
    when: "2025–now",
    what: "M.S., Computer Science",
    where: "NYCU, WinLab",
    href: "https://www.winlab.tw",
  },
  {
    when: "2024",
    what: "Co-authored a paper on automated frequency coordination for 6 GHz Wi-Fi in Taiwan",
    where: "ICS 2024",
    href: "https://doi.org/10.1109/ICS64339.2024.00032",
  },
  {
    when: "2021–2025",
    what: "B.S., Electronic Engineering",
    where: "NTUST",
    href: "https://www.ntust.edu.tw",
  },
]
