import { EMAIL, SITE_DESC, SITE_NAME, SITE_URL } from "@/lib/content"

/** What the site is and what it offers, for search engines and agents. */
export function SiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    audience: {
      "@type": "Audience",
      audienceType: "School administrative offices",
    },
    author: { "@type": "Person", name: "Loki", url: "https://www.zyx.tw" },
    email: EMAIL,
  }
  return (
    <script
      type="application/ld+json"
      // Build-time data only; "<" is escaped so no string can end the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
