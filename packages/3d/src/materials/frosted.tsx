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
      default: 0.5,
    },
    // Under 1, so a little light scatters back and the glass reads milky
    // over a dark background instead of vanishing into it.
    transmission: {
      type: "number",
      fixed: true,
      label: "Transmission",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.9,
    },
    thickness: {
      type: "number",
      fixed: true,
      label: "Thickness",
      min: 0,
      max: 2,
      step: 0.01,
      default: 1.5,
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
  render: ({ color, roughness, transmission, thickness, ior }) => (
    <meshPhysicalMaterial
      color={color}
      metalness={0}
      roughness={roughness}
      transmission={transmission}
      thickness={thickness}
      ior={ior}
    />
  ),
})
