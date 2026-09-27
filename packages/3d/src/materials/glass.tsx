import { defineMaterial } from "../registry"

export const glass = defineMaterial({
  id: "glass",
  label: "Glass",
  params: {
    color: { type: "color", label: "Tint", default: "#ffffff" },
    roughness: {
      type: "number",
      fixed: true,
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.05,
    },
    thickness: {
      type: "number",
      fixed: true,
      label: "Thickness",
      min: 0,
      max: 2,
      step: 0.01,
      default: 0.6,
    },
    ior: {
      type: "number",
      fixed: true,
      label: "Refraction",
      min: 1,
      max: 2.333,
      step: 0.001,
      default: 1.5,
    },
  },
  render: ({ color, roughness, thickness, ior }) => (
    <meshPhysicalMaterial
      color={color}
      metalness={0}
      roughness={roughness}
      transmission={1}
      thickness={thickness}
      ior={ior}
    />
  ),
})
