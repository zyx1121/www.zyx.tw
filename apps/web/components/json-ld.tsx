export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Zhan Yong Xiang",
    alternateName: ["Loki", "詹詠翔"],
    url: "https://zyx.tw",
    email: "mail@zyx.tw",
    jobTitle: "MS student in Computer Science",
    affiliation: {
      "@type": "EducationalOrganization",
      name: "National Yang Ming Chiao Tung University",
      url: "https://www.nycu.edu.tw",
    },
    sameAs: [
      "https://github.com/zyx1121",
      "https://www.instagram.com/__zyx1121__",
    ],
  }
  return (
    <script
      type="application/ld+json"
      // Build-time literal — no user input ever flows in.

      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
