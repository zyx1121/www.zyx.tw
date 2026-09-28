/**
 * The copy of the about components (intro, photo, days alive and status),
 * kept apart from their markup so the Markdown pages apps/web serves to agents
 * are built from the same strings and cannot drift from the HTML.
 */

/** The address the site shows, on Contact and About. */
export const EMAIL = "mail@zyx.tw"

/** A run of the one-line intro; a run with `href` renders as a link. */
export type IntroRun = { text: string; href?: string }

/** The one-line intro under the home and about titles. */
export const INTRO: readonly IntroRun[] = [
  { text: "cs grad @ " },
  { text: "nycu", href: "https://www.cs.nycu.edu.tw" },
  { text: ", " },
  { text: "winlab", href: "https://www.winlab.tw" },
  { text: ". i build things." },
]

/** The about page photo, served from each app's public folder. */
export const PHOTO = { src: "/me.webp", alt: "Ralph Wiggum waving" } as const

/** Days alive count from this date. */
export const BIRTHDAY = "2002-11-21"

/** Whole days from BIRTHDAY to `now`. */
export function daysAlive(now: number) {
  return Math.max(
    0,
    Math.floor((now - new Date(BIRTHDAY).getTime()) / 86_400_000)
  )
}

/** The GitHub account the status card reads. */
export const GITHUB_USER = "zyx1121"

export const STATUS_COPY = {
  title: "Status",
  empty: "No public activity lately.",
} as const
