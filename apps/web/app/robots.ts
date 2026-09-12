import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://www.zyx.tw/sitemap.xml",
    host: "https://www.zyx.tw",
  }
}
