import type { MetadataRoute } from "next";

import { DOCS } from "@/lib/docs";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// The HTML pages only. Their Markdown versions are alternates of the same
// content, declared by the Link header and <link rel="alternate">.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...DOCS.map((item) => ({
      url: `${SITE_URL}/${item.name}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
