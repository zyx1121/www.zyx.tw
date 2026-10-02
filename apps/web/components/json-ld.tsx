import { getI18n } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import type { Project } from "@/lib/projects"
import {
  EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL,
} from "@/lib/site"

const PERSON = `${SITE_URL}/#person`

function JsonLd({ data }: { data: object }) {
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

/** Who the site is by and what it is: on every page. */
export async function SiteJsonLd() {
  const { locale, t } = await getI18n(MESSAGES)
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": PERSON,
            name: "Zhan Yong Xiang",
            alternateName: ["Loki", "詹詠翔"],
            url: SITE_URL,
            email: EMAIL,
            jobTitle: "MS student in Computer Science",
            affiliation: {
              "@type": "EducationalOrganization",
              name: "National Yang Ming Chiao Tung University",
              url: "https://www.nycu.edu.tw",
            },
            alumniOf: {
              "@type": "CollegeOrUniversity",
              name: "National Taiwan University of Science and Technology",
              url: "https://www.ntust.edu.tw",
            },
            sameAs: SOCIAL.map(({ href }) => href),
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: `${SITE_URL}/`,
            name: SITE_NAME,
            description: t(SITE_DESCRIPTION),
            inLanguage: locale,
            author: { "@id": PERSON },
            publisher: { "@id": PERSON },
          },
        ],
      }}
    />
  )
}

/** The works page's list, one ListItem per project. */
export async function ProjectsJsonLd({ projects }: { projects: Project[] }) {
  const { t } = await getI18n(MESSAGES)
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: t("Works"),
        itemListElement: projects.map(({ name, href, purpose }, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          url: href,
          description: t(purpose),
        })),
      }}
    />
  )
}
