import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  // Front page yes; short-code redirects are not search content.
  return {
    rules: [{ userAgent: "*", allow: "/$", disallow: "/" }],
    host: "https://link.zyx.tw",
  }
}
