import { defineMaterial } from "../registry"

export const metal = defineMaterial({
  id: "metal",
  label: "Metal",
  params: {
    color: { type: "color", label: "Color", default: "#e4e4e7" },
    roughness: {
      type: "number",
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.12,
    },
  },
  render: ({ color, roughness }) => (
    <meshPhysicalMaterial color={color} metalness={1} roughness={roughness} />
  ),
})
