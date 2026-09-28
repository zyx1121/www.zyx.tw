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

export const COMPONENTS = ITEMS.filter((item) => item.type === "registry:ui");

export function getItem(name: string) {
  const item = ITEMS.find((entry) => entry.name === name);
  if (!item) throw new Error(`registry.json has no item "${name}"`);
  return item;
}
