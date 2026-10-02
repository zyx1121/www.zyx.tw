import { PLUMP } from "@/lib/plump"

export const MADE = {
  title: "Made, in shape.",
  description: "Small ideas, made into things you can use. Products by zyx.",
} as const

export const PRODUCTS = [
  {
    id: "plump",
    name: "Plump",
    purpose: "SVG to 3D",
    headline: ["Give flat", "some fat."],
    tagline: "Your SVG, with a little more body.",
    description: PLUMP.description,
    href: PLUMP.href,
    material: "Chrome / volume",
    imageAlt:
      "A person squeezes an oversized chrome Plump shape through a narrow tiled doorway, their cheek pressed against it.",
    note: "From a flat outline to something you can almost hold.",
    body: "Give an SVG depth, a material and a little light. A familiar shape takes up space, gets in the way and finds a new personality.",
    steps: PLUMP.steps,
  },
  {
    id: "time",
    name: "Time",
    purpose: "Your local time",
    headline: ["Here.", "Now."],
    tagline: "A little less checking. A little more being here.",
    description:
      "Open a quiet clock with your local time, down to the second. Hours and minutes stay in the browser tab.",
    href: "https://time.zyx.tw",
    material: "Amber / light",
    imageAlt:
      "Friends at a basketball court look through a thick amber glass Time ring, refracting the afternoon light.",
    note: "What time is it? This moment, right here.",
    body: "One glance, then back to the day. An open ring catches the light and frames a moment with someone else.",
    steps: [
      {
        title: "Open it.",
        body: "Your device's local time appears as soon as the page loads.",
      },
      {
        title: "Keep it nearby.",
        body: "Seconds update on the page. Hours and minutes stay in the browser tab.",
      },
      {
        title: "Get back to now.",
        body: "No timer to set and no account to create. Just the time, when you need it.",
      },
    ],
  },
  {
    id: "link",
    name: "Link",
    purpose: "Short links",
    headline: ["Pass it", "on."],
    tagline: "A shorter link. Ready for someone else.",
    description:
      "Paste a long URL, create a short link and copy it to share. A small connection from one person to the next.",
    href: "https://link.zyx.tw",
    material: "Silicone / connection",
    imageAlt:
      "Two friends pass a vermilion double-loop Link object between the windows of adjacent parked cars.",
    note: "A little shorter. A little easier to pass around.",
    body: "A link only needs to get to the next person. Two loops, one connection, ready to move from your window to theirs.",
    steps: [
      {
        title: "Paste a URL.",
        body: "Bring the address you want someone else to open.",
      },
      {
        title: "Make it shorter.",
        body: "Create a short address that redirects to your original URL.",
      },
      {
        title: "Pass it on.",
        body: "Copy the result and share it. Anyone with the short link can open it.",
      },
    ],
  },
] as const

export type Product = (typeof PRODUCTS)[number]
export type ProductId = Product["id"]
export const asset = (id: ProductId, suffix: string) =>
  `/made/identities/${id}${suffix}`
