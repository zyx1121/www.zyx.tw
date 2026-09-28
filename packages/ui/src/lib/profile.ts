/**
 * The copy of the about components (days alive and status),
 * kept apart from their markup so the Markdown pages apps/web serves to agents
 * are built from the same strings and cannot drift from the HTML.
 */

/** The address the site shows, on Contact and About. */
export const EMAIL = "mail@zyx.tw"

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
