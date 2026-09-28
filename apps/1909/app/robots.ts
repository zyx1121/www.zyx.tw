import type { MetadataRoute } from "next"

// Crawling stays allowed on purpose: the pages carry `noindex` (see the root
// layout), and a crawler that robots.txt blocks never sees it, so the URLs
// could still be listed. Letting it in is what keeps them out of results.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/" }] }
}
