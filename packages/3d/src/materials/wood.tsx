import { defineMaterial } from "../registry"
import { TexturedMaterial, type TextureMaps } from "../textures"

/** Poly Haven "Oak Veneer 01 by Jenelle van Heerden", CC0. */
const MAPS: TextureMaps = {
  map: "oak_veneer_01/diffuse.webp",
  normalMap: "oak_veneer_01/normal.webp",
}

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
    grain: {
      type: "number",
      fixed: true,
      label: "Grain depth",
      min: 0,
      max: 2,
      step: 0.01,
      default: 1,
    },
  },
  render: ({ color, roughness, clearcoat, grain }) => (
    <TexturedMaterial
      maps={MAPS}
      average="#a27f59"
      color={color}
      metalness={0}
      roughness={roughness}
      clearcoat={clearcoat}
      clearcoatRoughness={0.2}
      normalScale={[grain, grain]}
    />
  ),
})
