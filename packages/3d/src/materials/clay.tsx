import { defineMaterial } from "../registry"

export const clay = defineMaterial({
  id: "clay",
  label: "Clay",
  params: {
    color: { type: "color", label: "Color", default: "#a65a3a" },
    roughness: {
      type: "number",
      fixed: true,
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 1,
    },
  },
  render: ({ color, roughness }) => (
    <meshPhysicalMaterial color={color} metalness={0} roughness={roughness} />
  ),
})
