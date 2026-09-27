import { defineMaterial } from "../registry"

export const plastic = defineMaterial({
  id: "plastic",
  label: "Plastic",
  params: {
    color: { type: "color", label: "Color", default: "#f4f4f5" },
    roughness: {
      type: "number",
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.35,
    },
    clearcoat: {
      type: "number",
      label: "Clearcoat",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.6,
    },
  },
  render: ({ color, roughness, clearcoat }) => (
    <meshPhysicalMaterial
      color={color}
      metalness={0}
      roughness={roughness}
      clearcoat={clearcoat}
      clearcoatRoughness={0.1}
    />
  ),
})
