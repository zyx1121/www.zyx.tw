/** A run of a paragraph; a run with `href` renders as a link. */
export type Run = { text: string; href?: string }

export type LegalSection = { heading: string; paragraphs: Run[][] }

/**
 * A policy page (Privacy, Terms) as data, so the page and its Markdown twin
 * say the same thing. Both cover every site under zyx.tw.
 */
export type LegalDoc = {
  title: string
  /** ISO date of the last change, shown as "Last updated". */
  updated: string
  sections: LegalSection[]
}
