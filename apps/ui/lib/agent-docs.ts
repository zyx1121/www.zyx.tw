import { APPLICATION_PRIMITIVES } from "@/lib/application-primitives";
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
    "ui.zyx.tw is the design system of the zyx.tw sites, served as a shadcn/ui registry. Base components are stock shadcn/ui on the `base-nova` preset (Base UI primitives), and the shadcn CLI owns them. The registry adds a grayscale theme and the components shadcn/ui does not have. Each item is a JSON file that the shadcn CLI installs.",
    "",
    "## Application components",
    "",
    "The home page previews combobox, calendar, chart, resizable panels, messages, bubbles, attachments, plus Markdown/code/JSON response rendering. The primitives remain stock shadcn base-nova components; MarkdownResponse is an app-level composition using react-markdown, remark-gfm and lowlight; the zyx registry does not re-publish them.",
    "",
    ...APPLICATION_PRIMITIVES.map(
      (group) => `- ${group.title}: ${group.items.join(", ")}.`
    ),
    "",
    "Data table, date picker, login form and chat are app-level compositions. Install their primitives from shadcn, then compose them at the call site. Keep the four-corner chrome; a sidebar or resizable workspace lives inside the center content area.",
    "",
    "## Get started",
    "",
    "Init a project on the Base UI base, then add the theme:",
    "",
    "```bash",
    INIT_COMMAND,
    addCommand("theme"),
    "```",
    "",
    "Add base components straight from shadcn/ui:",
    "",
    "```bash",
    "bunx shadcn@latest add button dialog tabs",
    "```",
    "",
    "Add a zyx component by its URL, or point `components.json` at the registry once and use its name:",
    "",
    "```json",
    JSON.stringify(
      { registries: { "@zyx1121": `${SITE_URL}/r/{name}.json` } },
      null,
      2
    ),
    "```",
    "",
    "```bash",
    "bunx shadcn@latest add @zyx1121/ask-ai",
    "```",
    "",
    "## Items",
    "",
    itemSection(getItem("theme"), [
      `- Fonts are not part of it: load Inter, then Noto Sans JP and Noto Sans TC for CJK, and Geist Mono for code. [DESIGN.md](${DESIGN_URL}) has the details.`,
    ]),
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
    "> The design system of the zyx.tw sites as a shadcn/ui registry: a grayscale theme for stock shadcn/ui and the components shadcn/ui does not ship. The shadcn CLI installs each item from its JSON URL.",
    "",
    "Base components are stock shadcn/ui on the base-nova preset (Base UI primitives), and the shadcn CLI owns them. This registry never forks them.",
    "",
    "## When to use",
    "",
    "- You are building or restyling a zyx.tw site, or a user asks for the ui.zyx.tw look.",
    "- A shadcn/ui project needs the grayscale theme: pure black dark mode, the stock radius, muted text at 4.5:1.",
    "- A shadcn/ui project needs one of the components listed under Registry.",
    "",
    "## How an agent should use it",
    "",
    `1. Read [index.md](${INDEX_URL}) for every item, its description and its install command.`,
    `2. If the project has no components.json yet, run ${code(INIT_COMMAND)}.`,
    `3. Add the theme: ${code(addCommand("theme"))}.`,
    `4. Add each item you need: ${code(ANY_ITEM_COMMAND)}. The CLI installs its dependencies.`,
    `5. Follow [agent-instructions.md](${INSTRUCTIONS_URL}) for what not to do.`,
    "",
    "## Docs",
    "",
    `- [Index](${INDEX_URL}): what ui.zyx.tw is, how to pull the theme, every item`,
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
    "- The project uses shadcn/ui and wants the zyx.tw theme or one of its components.",
    "- The user names ui.zyx.tw, a zyx.tw site, or one of the items below.",
    "",
    "## Do not use it when",
    "",
    "- You need a base component such as button, dialog or tabs. Add it from shadcn/ui: `bunx shadcn@latest add button`.",
    "- The project does not use the shadcn CLI. The items are source files that the CLI copies into a project; there is no npm package.",
    "",
    "## Call order",
    "",
    `1. Read ${INDEX_URL}. It lists every item.`,
    `2. If the project has no components.json, run ${code(INIT_COMMAND)}.`,
    `3. Run ${code(addCommand("theme"))}.`,
    `4. For each item you need, run ${code(ANY_ITEM_COMMAND)}.`,
    "5. Load the fonts yourself. The theme carries colors, radius, overlay styles and the 24/14/12px interface scale; DESIGN.md names the fonts.",
    "",
    "## Rules",
    "",
    `- The items are exactly ${ITEMS.map((item) => code(item.name)).join(", ")}, the same set as ${REGISTRY_INDEX_URL}. Do not invent others.`,
    "- Never edit files under `components/ui/`. The shadcn CLI owns them, and the next add overwrites them.",
    "- The components assume the Base UI base (`init -b base`): compose with the `render` prop, not Radix's `asChild`.",
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
