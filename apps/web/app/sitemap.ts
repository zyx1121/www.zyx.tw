import { localeUrl } from "@workspace/ui/lib/i18n"
import type { MetadataRoute } from "next"

import { absoluteUrl, PAGES } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PAGES.flatMap(({ path, changeFrequency, priority }) =>
    ["zh-TW", "en"].map((locale) => ({
      url:
        locale === "en"
          ? localeUrl(absoluteUrl(path), "en")
          : absoluteUrl(path),
      alternates: {
        languages: {
          "zh-Hant": absoluteUrl(path),
          en: localeUrl(absoluteUrl(path), "en"),
        },
      },
      lastModified,
      changeFrequency,
      priority,
    }))
  )
}
