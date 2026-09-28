import type { Registry } from "@workspace/3d"

/** A Google Fonts family a text shape can be set in. */
export type TextFont = {
  /** Stored in scene.json as `shape.text.font`, so it never changes. */
  id: string
  label: string
  /** The family as the CSS2 API takes it, weight included. */
  family: string
  /** Baseline to baseline, in em. */
  lineHeight: number
  /** Has Chinese characters, Traditional included. */
  han?: boolean
}

/** Every font the Text shape offers; the first is the default. */
export const fonts: Registry<TextFont> = [
  {
    id: "inter",
    label: "Inter Bold",
    family: "Inter:wght@700",
    lineHeight: 1.15,
  },
  {
    id: "playfair-display",
    label: "Playfair Display Bold",
    family: "Playfair Display:wght@700",
    lineHeight: 1.15,
  },
  {
    id: "bebas-neue",
    label: "Bebas Neue",
    family: "Bebas Neue",
    lineHeight: 1,
  },
  { id: "pacifico", label: "Pacifico", family: "Pacifico", lineHeight: 1.45 },
  {
    id: "noto-sans-tc",
    label: "Noto Sans TC Bold",
    family: "Noto Sans TC:wght@700",
    lineHeight: 1.25,
    han: true,
  },
  {
    id: "noto-serif-tc",
    label: "Noto Serif TC Bold",
    family: "Noto Serif TC:wght@700",
    lineHeight: 1.25,
    han: true,
  },
]
