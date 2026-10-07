// Names, URLs and commands shared by the page, the metadata and the agent
// documents, so the HTML and the Markdown never disagree.

export const SITE_NAME = "ui.zyx.tw";
export const SITE_URL = "https://ui.zyx.tw";
export const SITE_DESCRIPTION =
  "Loki's design system. Grayscale tokens and lightweight components, served as a shadcn registry.";
/** The hero's one line. */
export const TAGLINE =
  "Grayscale tokens and lightweight components, one shadcn registry.";

export const AUTHOR = { name: "Loki", url: "https://www.zyx.tw" } as const;

export const REPO_URL = "https://github.com/zyx1121/www.zyx.tw";
export const SOURCE_URL = `${REPO_URL}/tree/main/apps/ui`;
export const DESIGN_URL = `${REPO_URL}/blob/main/apps/ui/DESIGN.md`;

// Agent documents, written to out/ at build time by the route handlers under
// app/. vercel.json gives them their Content-Type and links them from "/".
export const MARKDOWN_PATH = "/index.md";
export const LLMS_PATH = "/llms.txt";
export const AGENT_INSTRUCTIONS_PATH = "/agent-instructions.md";

export const INIT_COMMAND = `bunx shadcn@latest init ${SITE_URL}/r/base.json`;

export function itemUrl(name: string) {
  return `${SITE_URL}/r/${name}.json`;
}

export function addCommand(name: string) {
  return `bunx shadcn@latest add ${itemUrl(name)}`;
}
