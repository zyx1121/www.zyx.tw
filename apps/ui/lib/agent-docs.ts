import { COMPONENTS, getItem, ITEMS, type RegistryItem } from "@/lib/registry";
import {
  addCommand,
  AGENT_INSTRUCTIONS_PATH,
  DESIGN_URL,
  INIT_COMMAND,
  itemUrl,
  LLMS_PATH,
  MARKDOWN_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOURCE_URL,
  TAGLINE,
} from "@/lib/site";

// The Markdown and text documents for agents, built from registry.json at
// build time. The route handlers under app/ serve them; the static export
// writes each one to a file in out/.

const INDEX_URL = `${SITE_URL}${MARKDOWN_PATH}`;
const LLMS_URL = `${SITE_URL}${LLMS_PATH}`;
const INSTRUCTIONS_URL = `${SITE_URL}${AGENT_INSTRUCTIONS_PATH}`;
const REGISTRY_INDEX_URL = `${SITE_URL}/r/registry.json`;
const ANY_ITEM_COMMAND = `bunx shadcn@latest add ${SITE_URL}/r/<name>.json`;

function code(text: string) {
  return `\`${text}\``;
}

function lines(...parts: (string | string[])[]) {
  return `${parts.flat().join("\n")}\n`;
}

function itemSection(item: RegistryItem, extra: string[] = []) {
  return [
    `### ${item.title} (${code(item.name)})`,
    "",
    item.description,
    "",
    `- Install: ${code(addCommand(item.name))}`,
    `- JSON: [${item.name}.json](${itemUrl(item.name)})`,
    ...(item.dependencies?.length
      ? [`- npm dependencies: ${item.dependencies.map(code).join(", ")}`]
      : []),
    ...(item.registryDependencies?.length
      ? [
          `- Registry dependencies: ${item.registryDependencies.map(code).join(", ")}`,
        ]
      : []),
    ...extra,
    "",
  ];
}

/** /index.md: the home page as Markdown. */
export function indexMarkdown() {
  return lines(
    "---",
    `site: ${SITE_NAME}`,
    `url: ${SITE_URL}/`,
    `title: ${SITE_NAME}`,
    `description: ${JSON.stringify(SITE_DESCRIPTION)}`,
    "---",
    "",
    `# ${SITE_NAME}`,
    "",
    TAGLINE,
    "",
    "ui.zyx.tw is the design system of the zyx.tw sites, served as a shadcn/ui registry. One `base` item carries the grayscale tokens, four type sizes (80, 24, 16 and 14px), a concentric radius scale, two motion durations and the fonts. Every component is a lightweight rewrite on Base UI primitives that keeps only the variants the zyx.tw apps use and takes every value from the tokens.",
    "",
    "## Get started",
    "",
    "Init a project on the base. It writes the tokens, adds the fonts and registers the `@zyx1121` registry:",
    "",
    "```bash",
    INIT_COMMAND,
    "```",
    "",
    "Then add components by name:",
    "",
    "```bash",
    "bunx shadcn@latest add @zyx1121/button @zyx1121/dialog",
    "```",
    "",
    "The CLI installs a stock button during init; add `@zyx1121/button` with `-o` to overwrite it.",
    "",
    "## Items",
    "",
    itemSection(getItem("base")),
    COMPONENTS.flatMap((item) => itemSection(item)),
    "## More",
    "",
    `- [llms.txt](${LLMS_URL}): the short index for agents`,
    `- [Agent instructions](${INSTRUCTIONS_URL}): when to use this registry, the call order and the rules`,
    `- [Registry index](${REGISTRY_INDEX_URL}): every item in one JSON file`,
    `- [DESIGN.md](${DESIGN_URL}): the design contract behind the theme and the components`,
    `- [Source](${SOURCE_URL}): the Next.js app behind this site`
  );
}

/** /llms.txt: the llmstxt.org index. */
export function llmsText() {
  return lines(
    `# ${SITE_NAME}`,
    "",
    "> The design system of the zyx.tw sites as a shadcn/ui registry: a `base` item with the grayscale tokens and fonts, and lightweight components on Base UI. The shadcn CLI installs each item from its JSON URL.",
    "",
    "## When to use",
    "",
    "- You are building or restyling a zyx.tw site, or a user asks for the ui.zyx.tw look.",
    "- A shadcn/ui project wants the zyx.tw base: pure black dark mode, four type sizes, concentric radii, muted text at 4.5:1.",
    "- A project on the base needs one of the components listed under Registry.",
    "",
    "## How an agent should use it",
    "",
    `1. Read [index.md](${INDEX_URL}) for every item, its description and its install command.`,
    `2. Start the project from the base: ${code(INIT_COMMAND)}.`,
    `3. Add each item you need: ${code(ANY_ITEM_COMMAND)}. The CLI installs its dependencies.`,
    `4. Follow [agent-instructions.md](${INSTRUCTIONS_URL}) for what not to do.`,
    "",
    "## Docs",
    "",
    `- [Index](${INDEX_URL}): what ui.zyx.tw is, how to start from the base, every item`,
    `- [Agent instructions](${INSTRUCTIONS_URL}): when to use the registry, the call order, the rules`,
    `- [DESIGN.md](${DESIGN_URL}): the design contract behind the theme and the components`,
    "",
    "## Registry",
    "",
    ITEMS.map(
      (item) => `- [${item.name}](${itemUrl(item.name)}): ${item.description}`
    ),
    "",
    "## Optional",
    "",
    `- [Registry index](${REGISTRY_INDEX_URL}): every item in one JSON file`,
    `- [Source](${SOURCE_URL}): the Next.js app behind this site`
  );
}

/** /agent-instructions.md: when and how an agent should use the registry. */
export function agentInstructions() {
  return lines(
    `# Agent instructions for ${SITE_NAME}`,
    "",
    "ui.zyx.tw is a static shadcn/ui registry. It serves JSON for the shadcn CLI and Markdown for agents. There is no API, no search and no account.",
    "",
    "## Use it when",
    "",
    "- The project uses shadcn/ui and wants the zyx.tw base or one of its components.",
    "- The user names ui.zyx.tw, a zyx.tw site, or one of the items below.",
    "",
    "## Do not use it when",
    "",
    "- The project keeps another design system's tokens. The components assume the base's tokens and break without them.",
    "- The project does not use the shadcn CLI. The items are source files that the CLI copies into a project; there is no npm package.",
    "",
    "## Call order",
    "",
    `1. Read ${INDEX_URL}. It lists every item.`,
    `2. Start the project from the base: ${code(INIT_COMMAND)}. It brings the tokens, the fonts and the @zyx1121 registry.`,
    `3. For each item you need, run ${code(ANY_ITEM_COMMAND)}.`,
    "",
    "## Rules",
    "",
    `- The items are exactly ${ITEMS.map((item) => code(item.name)).join(", ")}, the same set as ${REGISTRY_INDEX_URL}. Do not invent others.`,
    "- Use only the type sizes `text-display`, `text-title`, `text-body` and `text-caption`, and the radii `rounded-control`, `rounded-menu`, `rounded-surface` and `rounded-full`.",
    "- Pages are flat: no cards, frames or shadows on the page itself. Only overlays (dialogs, menus, popovers) have a border and a frosted surface.",
    "- The components are built on Base UI: compose with the `render` prop, not Radix's `asChild`.",
    "- Put optical offsets such as `-ml-1` on the call site, never inside an item.",
    "- Keep every animation behind reduced motion (`motion-safe:`).",
    "- Take colors from the theme tokens (`bg-background`, `text-muted-foreground`), never from raw hex.",
    "",
    "## Sources",
    "",
    `- Index: ${INDEX_URL}`,
    `- llms.txt: ${LLMS_URL}`,
    `- Registry index: ${REGISTRY_INDEX_URL}`,
    `- Design contract: ${DESIGN_URL}`,
    `- Source: ${SOURCE_URL}`
  );
}
