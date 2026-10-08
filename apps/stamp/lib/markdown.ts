import {
  absoluteUrl,
  CAPABILITIES,
  CLOSING,
  EMAIL,
  FILM,
  GUARANTEE,
  HERO,
  OFFICES,
  PRODUCT,
  SITE_DESC,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  STEPS,
  TRUST,
} from "@/lib/content"

type Item = { title: string; body: string }

const list = (items: Item[]) =>
  items.map((item) => `- **${item.title}**: ${item.body}`).join("\n")

/** The home page as Markdown, from the same copy as the HTML. */
export function homeMarkdown() {
  return [
    "---",
    `site: ${SITE_NAME}`,
    `url: ${SITE_URL}/`,
    `title: ${SITE_TITLE}`,
    `description: ${SITE_DESC}`,
    "---",
    "",
    `# ${SITE_NAME}`,
    "",
    `${HERO.tagline}`,
    "",
    HERO.lede,
    "",
    `Film: ${FILM.caption} ${absoluteUrl("/stamp-promo.mp4")}`,
    "",
    `## ${STEPS.title}`,
    "",
    STEPS.items
      .map((step, index) => `${index + 1}. **${step.title}**: ${step.body}`)
      .join("\n"),
    "",
    `## ${PRODUCT.title}`,
    "",
    PRODUCT.body,
    "",
    `## ${GUARANTEE.title}`,
    "",
    GUARANTEE.body,
    "",
    list(GUARANTEE.points),
    "",
    `## ${OFFICES.title}`,
    "",
    OFFICES.items.map((item) => `- **${item.office}**: ${item.job}`).join("\n"),
    "",
    `## ${CAPABILITIES.title}`,
    "",
    list(CAPABILITIES.items),
    "",
    `## ${TRUST.title}`,
    "",
    TRUST.body,
    "",
    list(TRUST.items),
    "",
    `## ${CLOSING.title}`,
    "",
    `${CLOSING.body} Contact: [${EMAIL}](mailto:${EMAIL})`,
    "",
  ].join("\n")
}

/** /llms.txt: what the site is and where an agent should read next. */
export function llmsTxt() {
  return [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESC}`,
    "",
    "## When to use",
    "",
    "- Someone asks what Stamp is, what it does for school offices, or how its human approval works.",
    "",
    "## How an agent should use it",
    "",
    `1. Read the home page as Markdown: ${absoluteUrl("/index.md")}`,
    `2. To reach the team, use ${EMAIL}. Do not make up other contact details or prices.`,
    "",
    "## Pages",
    "",
    `- [Home](${absoluteUrl("/index.md")}): the product, its approval model and what it is built for`,
    "",
  ].join("\n")
}

export function markdownResponse(
  body: string,
  { type = "markdown" }: { type?: "markdown" | "text" } = {}
) {
  return new Response(body, {
    headers: {
      "Content-Type": `text/${type === "markdown" ? "markdown" : "plain"}; charset=utf-8`,
    },
  })
}
