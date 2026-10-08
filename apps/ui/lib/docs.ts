import { COMPONENTS, type RegistryItem } from "@/lib/registry";

// The site has one page per component, at /<name>. The groups here are the
// order on the home page, the same groups as DESIGN.md's component list.
// Import from server code only, like lib/registry.

const GROUPS = [
  {
    title: "Controls",
    names: [
      "button",
      "toggle",
      "input",
      "input-group",
      "textarea",
      "label",
      "checkbox",
      "switch",
      "slider",
      "select",
      "combobox",
      "command",
      "calendar",
    ],
  },
  {
    title: "Overlays",
    names: [
      "dialog",
      "alert-dialog",
      "sheet",
      "popover",
      "dropdown-menu",
      "tooltip",
      "sonner",
      "toolbar",
    ],
  },
  {
    title: "Content",
    names: [
      "badge",
      "avatar",
      "table",
      "tabs",
      "collapsible",
      "separator",
      "skeleton",
      "chart",
      "resizable",
    ],
  },
  { title: "Chat", names: ["message", "bubble", "attachment"] },
  { title: "zyx", names: ["scramble-text", "mask-reveal", "theme-toggle"] },
] as const;

// Items that only other components use; they have no page of their own.
const HELPERS = new Set(["field-trigger"]);

export interface DocGroup {
  title: string;
  items: RegistryItem[];
}

function resolve(): DocGroup[] {
  const byName = new Map(COMPONENTS.map((item) => [item.name, item]));
  const listed = new Set<string>(GROUPS.flatMap((group) => group.names));
  const missing = COMPONENTS.filter(
    (item) => !listed.has(item.name) && !HELPERS.has(item.name)
  );
  if (missing.length > 0) {
    throw new Error(
      `lib/docs.ts lists no group for ${missing.map((item) => item.name).join(", ")}`
    );
  }
  return GROUPS.map((group) => ({
    title: group.title,
    items: group.names.map((name) => {
      const item = byName.get(name);
      if (!item) throw new Error(`registry.json has no component "${name}"`);
      return item;
    }),
  }));
}

export const DOC_GROUPS = resolve();

export const DOCS = DOC_GROUPS.flatMap((group) => group.items);

export function getDoc(name: string) {
  return DOCS.find((item) => item.name === name);
}

/** The Markdown version of a component page. */
export function docMarkdownPath(name: string) {
  return `/${name}.md`;
}
