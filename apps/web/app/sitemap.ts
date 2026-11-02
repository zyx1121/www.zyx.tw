import type { MetadataRoute } from "next"

import { projectPath, projects } from "@/lib/projects"
import { absoluteUrl, PAGES } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    ...PAGES.map(({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency,
      priority,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(projectPath(project)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]
}
