import { defineMaterial } from "../registry"
import { TexturedMaterial } from "../textures"

/** Poly Haven "Oak Veneer 01 by Jenelle van Heerden", CC0. */
export const wood = defineMaterial({
  id: "wood",
  label: "Wood",
  params: {
    color: { type: "color", label: "Tint", default: "#ffffff" },
    roughness: {
      type: "number",
      fixed: true,
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.6,
    },
    clearcoat: {
      type: "number",
      fixed: true,
      label: "Clearcoat",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.3,
    },
    normal: {
      type: "number",
      fixed: true,
      label: "Grain depth",
      min: 0,
      max: 2,
      step: 0.01,
      default: 1,
    },
    alt: { type: "boolean", fixed: true, label: "TUNE alt", default: false },
  },
  render: ({ color, roughness, clearcoat, normal, alt }) => (
    <TexturedMaterial
      maps={{
        map: `${alt ? "teak_veneer" : "oak_veneer_01"}/diffuse.webp`,
        normalMap: `${alt ? "teak_veneer" : "oak_veneer_01"}/normal.webp`,
      }}
      average={alt ? "#b08257" : "#a27f59"}
      color={color}
      metalness={0}
      roughness={roughness}
      clearcoat={clearcoat}
      clearcoatRoughness={0.2}
      normalScale={[normal, normal]}
    />
  ),
})
