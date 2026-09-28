import { defineMaterial } from "../registry"

export const chrome = defineMaterial({
  id: "chrome",
  label: "Chrome",
  params: {
    color: { type: "color", label: "Color", default: "#ffffff" },
    roughness: {
      type: "number",
      fixed: true,
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.02,
    },
  },
  render: ({ color, roughness }) => (
    <meshPhysicalMaterial color={color} metalness={1} roughness={roughness} />
  ),
})
