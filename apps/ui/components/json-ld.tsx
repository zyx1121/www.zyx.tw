import {
  AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOURCE_URL,
} from "@/lib/site";

const author = { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url };

const DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      author,
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": `${SITE_URL}/#registry`,
      name: `${SITE_NAME} registry`,
      description:
        "A shadcn/ui registry: a grayscale theme for stock shadcn/ui and the components shadcn/ui does not ship, installed with the shadcn CLI.",
      url: `${SITE_URL}/`,
      codeRepository: SOURCE_URL,
      programmingLanguage: ["TypeScript", "CSS"],
      runtimePlatform: "React",
      license: "https://opensource.org/license/mit",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      author,
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      // Constants only, but `<` is escaped anyway, as the Next.js JSON-LD
      // guide recommends, so no string can close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(DATA).replace(/</g, "\\u003c"),
      }}
    />
  );
}
