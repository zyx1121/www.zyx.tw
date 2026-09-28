import { defineMaterial } from "../registry"

export const gold = defineMaterial({
  id: "gold",
  label: "Gold",
  params: {
    color: { type: "color", label: "Color", default: "#e8b04a" },
    roughness: {
      type: "number",
      fixed: true,
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.2,
    },
  },
  render: ({ color, roughness }) => (
    <meshPhysicalMaterial color={color} metalness={1} roughness={roughness} />
  ),
})
