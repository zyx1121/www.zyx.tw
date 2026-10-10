import registry from "@/registry.json";

export interface RegistryItem {
  name: string;
  type: string;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
}

// registry.json is the one list of what ui.zyx.tw ships. The page, index.md,
// llms.txt and agent-instructions.md all read it at build time. Import this
// module from server code only, so the JSON stays out of the client bundle.
const data: { items: RegistryItem[] } = registry;

export const ITEMS = data.items;

// Everything a project adds by name: primitives (registry:ui), the chrome
// (registry:component) and blocks that serve one purpose (registry:block).
const ADDABLE = new Set([
  "registry:ui",
  "registry:component",
  "registry:block",
]);

export const COMPONENTS = ITEMS.filter((item) => ADDABLE.has(item.type));

// The agent kit: server code for agent apps (model, tools with MCP, sealing,
// public fetch, tracing), installed into lib/agent/.
export const AGENT_KIT = ITEMS.filter(
  (item) => item.type === "registry:lib" && item.name.startsWith("agent-")
);

export function getItem(name: string) {
  const item = ITEMS.find((entry) => entry.name === name);
  if (!item) throw new Error(`registry.json has no item "${name}"`);
  return item;
}
