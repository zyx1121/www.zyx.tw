/**
 * The copy of the about components (the status card),
 * kept apart from their markup so the Markdown pages apps/web serves to agents
 * are built from the same strings and cannot drift from the HTML.
 */

/** The address the site shows, on Contact and About. */
export const EMAIL = "mail@zyx.tw"

/** The GitHub account the status card reads. */
export const GITHUB_USER = "zyx1121"

export const STATUS_COPY = {
  title: "Status",
  empty: "No public activity lately.",
} as const
