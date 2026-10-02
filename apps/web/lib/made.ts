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
      "A person squeezes an oversized chrome Plump shape through a narrow tiled doorway, their cheek pressed against it.",
  },
  {
    id: "time",
    name: "Time",
    purpose: "Your local time",
    description: "A clock showing your local time.",
    href: "https://time.zyx.tw",
    material: "Amber glass",
    imageAlt:
      "Friends at a basketball court look through a thick amber glass Time ring, refracting the afternoon light.",
  },
  {
    id: "link",
    name: "Link",
    purpose: "Short links",
    description: "Paste a URL and copy a short link.",
    href: "https://link.zyx.tw",
    material: "Vermilion silicone",
    imageAlt:
      "Two friends lean shoulder to shoulder against a pale wall, holding a red double-loop Link shape.",
  },
] as const

export type Product = (typeof PRODUCTS)[number]
export type ProductId = Product["id"]
export const asset = (id: ProductId, suffix: string) =>
  `/made/identities/${id}${suffix}`
