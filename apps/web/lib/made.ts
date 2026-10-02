import { PLUMP } from "@/lib/plump"

export const MADE = {
  title: "Made",
  description: "Products by zyx.",
} as const

export const PRODUCTS = [
  {
    id: "plump",
    name: "Plump",
    purpose: "SVG to 3D",
    description: PLUMP.description,
    href: PLUMP.href,
    material: "Chrome",
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
    imageAlt:
      "A woman in a white blouse and gray waistcoat sits on a bench, holding a vermilion double-loop Link shape.",
  },
] as const

export type Product = (typeof PRODUCTS)[number]
export type ProductId = Product["id"]
export const asset = (id: ProductId, suffix: string) =>
  `/made/identities/${id}${suffix}`
