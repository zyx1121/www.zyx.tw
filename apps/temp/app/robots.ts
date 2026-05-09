import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  // Pads are anonymous + ephemeral. Index the front page only;
  // disallow every random pad slug from showing up in search.
  return {
    rules: [{ userAgent: "*", allow: "/$", disallow: "/" }],
    host: "https://temp.zyx.tw",
  }
}
