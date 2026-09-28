import { defineMaterial } from "../registry"
import { TexturedMaterial, type TextureMaps } from "../textures"

/** Poly Haven "Marble Rock 02 by Amal Kumar", CC0. */
const MAPS: TextureMaps = { map: "marble_rock_02/diffuse.webp" }

export const marble = defineMaterial({
  id: "marble",
  label: "Marble",
  params: {
    color: { type: "color", label: "Tint", default: "#ffffff" },
    roughness: {
      type: "number",
      fixed: true,
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.25,
    },
    clearcoat: {
      type: "number",
      fixed: true,
      label: "Clearcoat",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.6,
    },
  },
  render: ({ color, roughness, clearcoat }) => (
    <TexturedMaterial
      maps={MAPS}
      average="#c7b49c"
      color={color}
      metalness={0}
      roughness={roughness}
      clearcoat={clearcoat}
      clearcoatRoughness={0.08}
    />
  ),
})
