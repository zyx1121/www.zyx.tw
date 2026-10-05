import { PLUMP } from "@/lib/plump"

export const MADE = {
  title: "Made",
  description: "Apps and infrastructure by zyx.",
} as const

export type ProductPlatform = "web" | "ios" | "macos"

type ProductDefinition = {
  id: string
  name: string
  purpose: string
  description: string
  href: string
  material: string
  kind: "app" | "infrastructure"
  platforms: readonly ProductPlatform[]
  motion: boolean
  model: boolean
  action: string
  imageAlt: string
}

export const PRODUCTS = [
  {
    id: "plump",
    name: "Plump",
    purpose: "SVG to 3D",
    description: PLUMP.description,
    href: PLUMP.href,
    material: "Chrome",
    kind: "app",
    platforms: ["web"],
    motion: true,
    model: true,
    action: "Open Plump",
    imageAlt:
      "A woman in a white blouse sits on a metal stool in a doorway, holding an oversized four-lobed chrome Plump shape.",
  },
  {
    id: "time",
    name: "Time",
    purpose: "Your local time",
    description: "A clock showing your local time.",
    href: "https://time.zyx.tw",
    material: "Amber glass",
    kind: "app",
    platforms: ["web"],
    motion: true,
    model: true,
    action: "Open Time",
    imageAlt:
      "A woman with long black hair waits in a cool green laundromat beside an amber glass Time ring, with soft focus and film grain.",
  },
  {
    id: "link",
    name: "Link",
    purpose: "Short links",
    description: "Paste a URL and copy a short link.",
    href: "https://link.zyx.tw",
    material: "Vermilion silicone",
    kind: "app",
    platforms: ["web"],
    motion: true,
    model: true,
    action: "Open Link",
    imageAlt:
      "A woman in a white blouse and gray waistcoat sits on a bench, holding a vermilion double-loop Link shape.",
  },
  {
    id: "carrel",
    name: "Carrel",
    purpose: "Infrastructure through conversation",
    description:
      "Describe the machines and connections you need. Carrel gives you a development environment, SSH access and service URLs through MCP.",
    href: "/made/carrel#get-started",
    material: "Cobalt ceramic",
    kind: "infrastructure",
    platforms: [],
    motion: true,
    model: false,
    action: "Get started",
    imageAlt:
      "A young woman with long black hair and a white blouse sits at an oak library desk beside a cobalt ceramic arch.",
  },
  {
    id: "peck",
    name: "Peck",
    purpose: "Visual feedback for coding agents",
    description:
      "A browser you share with your coding agent. Point at an element and leave a comment; Claude Code or Codex gets the screenshot, source location, console and network records through local MCP.",
    href: "https://github.com/zyx1121/peck/releases/latest",
    material: "Black piano lacquer",
    kind: "app",
    platforms: ["macos"],
    motion: true,
    model: false,
    action: "Get Peck",
    imageAlt:
      "A young woman with long black hair and a white shirt sits on a pale wooden bench in a bright corridor, holding an oversized glossy black cursor on her lap.",
  },
] as const satisfies readonly ProductDefinition[]

export type Product = (typeof PRODUCTS)[number]
export type ProductId = Product["id"]
export const getProduct = (id: ProductId) =>
  PRODUCTS.find((product) => product.id === id)!

const PLATFORM_LABELS: Record<ProductPlatform, string> = {
  web: "Web",
  ios: "iOS",
  macos: "macOS",
}

export function productCategory(product: Product) {
  return product.kind === "infrastructure"
    ? "Infra"
    : `${product.platforms.map((platform) => PLATFORM_LABELS[platform]).join(" / ")} app`
}

export const asset = (id: ProductId, suffix: string) =>
  `/made/identities/${id}${suffix}`
