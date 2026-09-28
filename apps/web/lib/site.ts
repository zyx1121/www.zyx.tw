import type { Metadata, MetadataRoute } from "next"

import { EMAIL } from "@workspace/ui/lib/profile"

import site from "./site.json"

export { EMAIL }

export const SITE_NAME = "zyx"
export const SITE_URL = site.url
export const SITE_DESCRIPTION =
  "Loki (詹詠翔), CS grad student at NYCU WinLab. Side projects, lab work and GitHub activity."

export const SOCIAL = [
  { label: "GitHub", handle: "@zyx1121", href: "https://github.com/zyx1121" },
  {
    label: "Instagram",
    handle: "@__zyx1121__",
    href: "https://www.instagram.com/__zyx1121__",
  },
] as const

export type Page = {
  path: string
  label: string
  /** Its Markdown twin, served to agents (app/<name>.md/route.ts). */
  markdown: string
  /** What an agent finds there, for llms.txt and the 404 pages. */
  summary: string
  /** Listed in the header nav. */
  nav?: boolean
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
  priority: number
}

/**
 * Every page, in lib/site.json so next.config.mjs can read it too: the header
 * nav, the sitemap, the per-page metadata, the Markdown negotiation and
 * llms.txt all come from this list.
 */
export const PAGES = site.pages as Page[]

/** The Markdown twin of the page at `path`, if it has one. */
export function markdownFor(path: string) {
  return PAGES.find((page) => page.path === path)?.markdown
}

/** `path` on the canonical origin, e.g. https://www.zyx.tw/works. */
export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).href
}

/**
 * Per-page metadata. Next.js replaces nested objects instead of merging them,
 * so every page restates its canonical path and Open Graph fields here rather
 * than inheriting the home page's "/".
 */
export function pageMetadata({
  title,
  path,
}: {
  title?: string
  path: string
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const markdown = markdownFor(path)
  return {
    ...(title ? { title } : {}),
    // <link rel="alternate" type="text/markdown"> to the Markdown twin.
    alternates: {
      canonical: path,
      ...(markdown ? { types: { "text/markdown": markdown } } : {}),
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName: SITE_NAME,
      title: fullTitle,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: SITE_DESCRIPTION,
    },
  }
}
