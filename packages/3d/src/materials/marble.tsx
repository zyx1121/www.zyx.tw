import { defineMaterial } from "../registry"
import { TexturedMaterial } from "../textures"

/** Poly Haven "Marble Rock 02 by Amal Kumar", CC0. */
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
      label: "Polish",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.6,
    },
    alt: { type: "boolean", fixed: true, label: "TUNE alt", default: false },
  },
  render: ({ color, roughness, clearcoat, alt }) => (
    <TexturedMaterial
      maps={{ map: `${alt ? "marble_cliff_05" : "marble_rock_02"}/diffuse.webp` }}
      average={alt ? "#958e86" : "#c7b49c"}
      color={color}
      metalness={0}
      roughness={roughness}
      clearcoat={clearcoat}
      clearcoatRoughness={0.08}
    />
  ),
})
