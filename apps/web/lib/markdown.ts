import { describeEvent, type StatusData } from "@workspace/ui/lib/github-events"
import {
  EMAIL,
  GITHUB_USER,
  STATUS_COPY as SOURCE_STATUS_COPY,
} from "@workspace/ui/lib/profile"

import {
  ABOUT as SOURCE_ABOUT,
  HOME as SOURCE_HOME,
  NOT_FOUND as SOURCE_NOT_FOUND,
  WORKS as SOURCE_WORKS,
} from "@/lib/copy"
import { CARREL as SOURCE_CARREL } from "@/lib/carrel"
import type { LegalDoc, Run } from "@/lib/legal"
import { PRIVACY as SOURCE_PRIVACY } from "@/lib/privacy"
import { projects as SOURCE_projects } from "@/lib/projects"
import {
  asset,
  MADE as SOURCE_MADE,
  PRODUCTS as SOURCE_PRODUCTS,
  productCategory,
  type ProductId,
} from "@/lib/made"
import {
  FACTS as SOURCE_FACTS,
  SECTIONS as SOURCE_SECTIONS,
} from "@/lib/resume"
import { TERMS as SOURCE_TERMS } from "@/lib/terms"
import {
  absoluteUrl as sourceAbsoluteUrl,
  PAGES as SOURCE_PAGES,
  SITE_DESCRIPTION as SOURCE_SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site"

import { getI18n } from "@workspace/ui/lib/i18n-server"
import {
  localeUrl,
  translator,
  mergeMessages,
  COMMON_MESSAGES,
  type Locale,
} from "@workspace/ui/lib/i18n"
import { MESSAGES } from "@/lib/messages"

export async function getMarkdown(forcedLocale?: Locale) {
  const resolved = await getI18n(MESSAGES)
  const locale = forcedLocale ?? resolved.locale
  const t = translator(locale, mergeMessages(COMMON_MESSAGES, MESSAGES))
  function localize<T>(value: T): T {
    if (typeof value === "string") return t(value) as T
    if (Array.isArray(value)) return value.map(localize) as T
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [
          key,
          [
            "id",
            "href",
            "command",
            "endpoint",
            "path",
            "markdown",
            "name",
            "slug",
          ].includes(key)
            ? entry
            : localize(entry),
        ])
      ) as T
    return value
  }
  const ABOUT = localize(SOURCE_ABOUT)
  const HOME = localize(SOURCE_HOME)
  const NOT_FOUND = localize(SOURCE_NOT_FOUND)
  const WORKS = localize(SOURCE_WORKS)
  const CARREL = localize(SOURCE_CARREL)
  const PRIVACY = localize(SOURCE_PRIVACY)
  const projects = localize(SOURCE_projects)
  const MADE = localize(SOURCE_MADE)
  const PRODUCTS = localize(SOURCE_PRODUCTS)
  const FACTS = localize(SOURCE_FACTS)
  const SECTIONS = localize(SOURCE_SECTIONS)
  const TERMS = localize(SOURCE_TERMS)
  const PAGES = localize(SOURCE_PAGES)
  const SITE_DESCRIPTION = localize(SOURCE_SITE_DESCRIPTION)
  const STATUS_COPY = localize(SOURCE_STATUS_COPY)
  function absoluteUrl(path: string) {
    const url = sourceAbsoluteUrl(path)
    const page = PAGES.some(
      (page) => page.path === path || page.markdown === path
    )
    return locale === "en" && page ? localeUrl(url, locale) : url
  }
  /*
   * The Markdown twins of the pages, for agents. Each one is built from the
   * data its HTML page renders (lib/copy.ts, lib/projects.json, lib/privacy.ts,
   * lib/site.json and packages/ui/src/lib), so the two cannot drift.
   */

  /** Plain text that Markdown shows as written. */
  function text(value: string) {
    return t(value).replace(/[\\`*_[\]<>]/g, "\\$&")
  }

  function link(label: string, href: string) {
    return `[${text(label)}](${href})`
  }

  /** Text runs with optional links, such as a privacy paragraph, as Markdown. */
  function runs(parts: readonly Run[]) {
    return parts
      .map(({ text: value, href }) => (href ? link(value, href) : text(value)))
      .join("")
  }

  /** YAML front matter; JSON strings are valid YAML scalars. */
  function frontMatter(fields: Record<string, string>) {
    return [
      "---",
      ...Object.entries(fields).map(
        ([key, value]) => `${key}: ${JSON.stringify(value)}`
      ),
      "---",
    ].join("\n")
  }

  /** A page: front matter, then blocks separated by blank lines. */
  function markdownDocument(
    fields: { title: string; path?: string; description?: string },
    blocks: (string | false | null | undefined)[]
  ) {
    const { title, path } = fields
    const head = frontMatter({
      site: SITE_NAME,
      title,
      description: t(fields.description ?? SITE_DESCRIPTION),
      language: locale,
      ...(path ? { url: absoluteUrl(path) } : {}),
    })
    return (
      [head, ...blocks.filter(Boolean).map((block) => t(String(block)))].join(
        "\n\n"
      ) + "\n"
    )
  }

  const day = (iso: string) => iso.slice(0, 10)

  function pagesList() {
    return PAGES.map(
      (page) =>
        `- ${link(page.label, absoluteUrl(page.markdown))}: ${text(page.summary)}`
    ).join("\n")
  }

  /** A value with its link, if it has one. */
  function linked(value: string, href?: string) {
    return href ? link(value, href) : text(value)
  }

  function homeMarkdown() {
    return markdownDocument({ title: SITE_NAME, path: "/" }, [
      `# ${text(HOME.title)}`,
      "The home page is the zyx mark in 3D. The pages below have the rest.",
      [t("## Pages"), pagesList()].join("\n\n"),
    ])
  }

  function worksMarkdown() {
    return markdownDocument({ title: WORKS.title, path: "/works" }, [
      `# ${text(WORKS.title)}`,
      projects
        .map(
          ({ name, href, purpose }) => `- ${link(name, href)}: ${text(purpose)}`
        )
        .join("\n"),
    ])
  }

  function madeMarkdown() {
    return markdownDocument(
      { title: MADE.title, path: "/made", description: MADE.description },
      [
        `# ${MADE.title}`,
        MADE.description,
        PRODUCTS.map(
          (product) =>
            `- ${link(product.name, absoluteUrl(`/made/${product.id}`))}: ${product.purpose}. ${productCategory(product)}.`
        ).join("\n"),
      ]
    )
  }

  function productMarkdown(id: ProductId) {
    const product = PRODUCTS.find((item) => item.id === id)!
    return markdownDocument(
      {
        title: product.name,
        path: `/made/${id}`,
        description: product.description,
      },
      [
        `# ${product.name}`,
        product.description,
        productCategory(product),
        link(
          product.action,
          product.href.startsWith("/")
            ? absoluteUrl(product.href)
            : product.href
        ),
        ...(id === "carrel" ? carrelBlocks() : []),
        product.model && t("## 3D icon"),
        product.model && product.material,
        link("SVG", absoluteUrl(asset(id, ".svg"))),
        product.model && link("Scene", absoluteUrl(asset(id, ".scene.json"))),
        product.model && link("GLB", absoluteUrl(asset(id, ".glb"))),
        link("All Made products", absoluteUrl("/made")),
      ]
    )
  }

  function carrelBlocks() {
    return [
      `## ${CARREL.introduction.title}`,
      CARREL.introduction.body,
      ...CARREL.chapters.flatMap((chapter) => [
        `## ${chapter.title}`,
        chapter.body,
        `![${text(chapter.alt)}](${absoluteUrl(asset("carrel", chapter.image))})`,
      ]),
      t("## Example workflow"),
      `> ${CARREL.request}`,
      ...CARREL.workflow.map(
        (step) =>
          `### ${step.label}\n\n${step.body}\n\n${step.lines.map((line) => `- ${line}`).join("\n")}`
      ),
      t("## Connections"),
      ...CARREL.network.map((node) => `- ${node.label}: ${node.detail}`),
      t("## Environment management"),
      ...CARREL.lifecycle.map((item) => `- ${item.label}: ${item.body}`),
      `## ${CARREL.start.title}`,
      CARREL.start.body,
      `![${text(CARREL.start.alt)}](${absoluteUrl(asset("carrel", CARREL.start.image))})`,
      `MCP endpoint: ${CARREL.start.endpoint}`,
      ...CARREL.start.clients.map(
        (client) => `### ${client.name}\n\n\`\`\`sh\n${client.command}\n\`\`\``
      ),
      `First request: ${CARREL.start.firstRequest}`,
      "Your agent can use a saved public SSH key, or ask you for one.",
    ]
  }

  function plumpMarkdown() {
    return productMarkdown("plump")
  }

  function aboutMarkdown(status: StatusData) {
    const { heatmap, events } = status
    const github = link(`@${GITHUB_USER}`, `https://github.com/${GITHUB_USER}`)
    return markdownDocument({ title: ABOUT.title, path: "/about" }, [
      `# ${text(HOME.title)}`,
      FACTS.map(
        ({ label, value, href }) => `- ${label}: ${linked(value, href)}`
      ).join("\n"),
      ...SECTIONS.map(({ title, entries }) =>
        [
          `## ${text(title)}`,
          entries
            .map(
              ({ when, what, note, where, href }) =>
                `- ${text(when)}: ${text(what)}, ${linked(where, href)}${note ? ` (${text(note)})` : ""}`
            )
            .join("\n"),
        ].join("\n\n")
      ),
      [
        `## ${text(STATUS_COPY.title)}`,
        heatmap
          ? `${github} on GitHub, ${heatmap.totalContributions.toLocaleString("en-US")} contributions this year.`
          : `${github} on GitHub.`,
        events.length
          ? events
              .map((event) => {
                const { text: what } = describeEvent(event, locale)
                const repo = link(
                  event.repo.name,
                  `https://github.com/${event.repo.name}`
                )
                return `- ${text(what)} in ${repo}, ${day(event.created_at)}`
              })
              .join("\n")
          : text(STATUS_COPY.empty),
      ].join("\n\n"),
    ])
  }

  /** Privacy or Terms: the title, the date of the last change, the sections. */
  function legalMarkdown(doc: LegalDoc, path: string) {
    return markdownDocument({ title: doc.title, path }, [
      `# ${text(doc.title)}`,
      `${t("Last updated")} ${doc.updated}.`,
      ...doc.sections.map(({ heading, paragraphs }) =>
        [`## ${text(heading)}`, ...paragraphs.map(runs)].join("\n\n")
      ),
    ])
  }

  function privacyMarkdown() {
    return legalMarkdown(PRIVACY, "/privacy")
  }

  function termsMarkdown() {
    return legalMarkdown(TERMS, "/terms")
  }

  /** /llms.txt, in the llmstxt.org shape: H1, summary, then link sections. */
  function llmsTxt() {
    const names = projects.map((project) => project.name).join(", ")
    return (
      [
        `# ${SITE_NAME}`,
        `> ${text(SITE_DESCRIPTION)}`,
        `${absoluteUrl("/")} is Loki's personal site. Every page has a Markdown version, linked below, and the HTML pages return it to requests that send \`Accept: text/markdown\`.`,
        [
          "## When to use this site",
          [
            "- To learn who Loki (詹詠翔, zyx1121 on GitHub) is: his studies, papers, projects and what he builds.",
            `- To find what one of his projects is for and where it lives: ${text(names)}.`,
            "- To get in touch with him.",
          ].join("\n"),
        ].join("\n\n"),
        [
          "## How an agent should read it",
          [
            `1. Start with ${link("About", absoluteUrl("/about.md"))}: his CV (facts, education, experience, publications, projects, awards) and his GitHub status.`,
            `2. Read ${link("Works", absoluteUrl("/works.md"))} for every project with its purpose and link.`,
            `3. Follow ${link("the agent instructions", absoluteUrl("/agent-instructions.md"))} when you answer, and take his email only from ${link("About", absoluteUrl("/about.md"))}.`,
          ].join("\n"),
        ].join("\n\n"),
        [t("## Pages"), pagesList()].join("\n\n"),
        [
          "## For agents",
          `- ${link("Agent instructions", absoluteUrl("/agent-instructions.md"))}: what to use this site for and how to answer from it`,
        ].join("\n\n"),
        [
          "## Optional",
          `- ${link("Sitemap", absoluteUrl("/sitemap.xml"))}: the HTML pages`,
        ].join("\n\n"),
      ].join("\n\n") + "\n"
    )
  }

  function agentInstructions() {
    return markdownDocument(
      { title: "Agent instructions", path: "/agent-instructions.md" },
      [
        "# Agent instructions",
        `${absoluteUrl("/")} is the personal site of Loki (詹詠翔), a CS grad student at NYCU WinLab. Follow these rules when you answer questions from it.`,
        [
          "## Use it for",
          [
            "- Who Loki is: his studies, work, papers and what he builds.",
            "- What each of his projects is for, and its link.",
            "- His recent GitHub activity.",
            "- How to reach him.",
          ].join("\n"),
        ].join("\n\n"),
        [
          "## Do not use it for",
          [
            "- Facts about NYCU, WinLab or other people beyond what the pages say.",
            "- Offers, prices or availability: the site sells nothing and lists no services.",
          ].join("\n"),
        ].join("\n\n"),
        [
          "## Rules",
          [
            `1. Read the Markdown pages listed in ${link("llms.txt", absoluteUrl("/llms.txt"))}; they carry the same content as the HTML pages.`,
            `2. To reach Loki, use the email ${link(EMAIL, `mailto:${EMAIL}`)} on ${link("About", absoluteUrl("/about.md"))}. His GitHub and Instagram are on About too. Do not make up other ways, such as a phone number or a postal address.`,
            "3. Describe a project from its purpose line, its Made page (when listed) and its own site. Do not guess features, users or status the pages do not state.",
            "4. Describe his background only from the facts and sections on About. Do not add schools, jobs, papers, awards or dates they do not list, and keep each paper's author position as About states it.",
            "5. The GitHub activity on About refreshes about every 5 minutes; everything else changes when the site is deployed. Say so when freshness matters.",
            "6. Link to the page an answer comes from.",
            "7. To help someone write to Loki, draft the message and leave sending it to them.",
          ].join("\n"),
        ].join("\n\n"),
        [
          "## Privacy and terms",
          `What the zyx.tw sites store, log and send elsewhere is on ${link("Privacy", absoluteUrl("/privacy.md"))}, and the rules for using them are on ${link("Terms", absoluteUrl("/terms.md"))}. Both cover every site under zyx.tw.`,
        ].join("\n\n"),
      ]
    )
  }

  /** The Markdown 404, for requests that ask for Markdown. */
  function notFoundMarkdown() {
    return markdownDocument({ title: NOT_FOUND.title }, [
      `# ${text(NOT_FOUND.title)}`,
      text(NOT_FOUND.lead),
      pagesList(),
      [
        `## ${NOT_FOUND.agents}`,
        `- ${link("llms.txt", absoluteUrl("/llms.txt"))}: ${text(NOT_FOUND.llms)}`,
      ].join("\n\n"),
    ])
  }

  const TYPES = {
    markdown: "text/markdown; charset=utf-8",
    text: "text/plain; charset=utf-8",
  } as const

  /** A route handler's response for one of the documents above. */
  function markdownResponse(
    body: string,
    {
      status = 200,
      type = "markdown",
    }: { status?: number; type?: keyof typeof TYPES } = {}
  ) {
    return new Response(body, {
      status,
      headers: {
        "Content-Type": TYPES[type],
        "Content-Language": locale,
        "Cache-Control": "private, no-store",
        Vary: "Accept, Cookie",
      },
    })
  }

  return {
    homeMarkdown,
    worksMarkdown,
    madeMarkdown,
    productMarkdown,
    plumpMarkdown,
    aboutMarkdown,
    privacyMarkdown,
    termsMarkdown,
    llmsTxt,
    agentInstructions,
    notFoundMarkdown,
    markdownResponse,
  }
}
