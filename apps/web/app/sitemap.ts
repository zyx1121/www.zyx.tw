import type { MetadataRoute } from "next"

import { systemPath, systems } from "@/lib/map"
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
    ...systems.map((system) => ({
      url: absoluteUrl(systemPath(system)),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]
}
