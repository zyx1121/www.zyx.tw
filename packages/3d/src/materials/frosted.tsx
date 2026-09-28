import { defineMaterial } from "../registry"

export const frosted = defineMaterial({
  id: "frosted",
  label: "Frosted glass",
  params: {
    color: { type: "color", label: "Tint", default: "#ffffff" },
    roughness: {
      type: "number",
      fixed: true,
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.45,
    },
    transmission: {
      type: "number",
      fixed: true,
      label: "Transmission",
      min: 0,
      max: 1,
      step: 0.01,
      default: 1,
    },
    thickness: {
      type: "number",
      fixed: true,
      label: "Thickness",
      min: 0,
      max: 2,
      step: 0.01,
      default: 1,
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
    sheen: {
      type: "number",
      fixed: true,
      label: "Sheen",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0,
    },
  },
  render: ({ color, roughness, transmission, thickness, ior, sheen }) => (
    <meshPhysicalMaterial
      color={color}
      metalness={0}
      roughness={roughness}
      transmission={transmission}
      thickness={thickness}
      ior={ior}
      sheen={sheen}
      sheenRoughness={0.6}
      sheenColor="#ffffff"
    />
  ),
})
