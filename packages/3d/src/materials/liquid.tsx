import { defineMaterial } from "../registry"

export const liquid = defineMaterial({
  id: "liquid",
  label: "Liquid glass",
  params: {
    color: { type: "color", label: "Tint", default: "#ffffff" },
    tintDepth: {
      type: "number",
      label: "Tint depth",
      min: 0.05,
      max: 4,
      step: 0.05,
      default: 1,
    },
    thickness: {
      type: "number",
      fixed: true,
      label: "Thickness",
      min: 0,
      max: 3,
      step: 0.01,
      default: 1.4,
    },
    ior: {
      type: "number",
      fixed: true,
      label: "Refraction",
      min: 1,
      max: 2.333,
      step: 0.001,
      default: 1.45,
    },
    dispersion: {
      type: "number",
      fixed: true,
      label: "Dispersion",
      min: 0,
      max: 10,
      step: 0.1,
      default: 4,
    },
  },
  // Thick, clear and coated, so the edges bend the background hard and split
  // it into color; the tint deepens with the distance light travels inside.
  render: ({ color, tintDepth, thickness, ior, dispersion }) => (
    <meshPhysicalMaterial
      metalness={0}
      roughness={0}
      transmission={1}
      thickness={thickness}
      ior={ior}
      dispersion={dispersion}
      attenuationColor={color}
      attenuationDistance={tintDepth}
      clearcoat={1}
      clearcoatRoughness={0}
      iridescence={0.2}
      specularIntensity={1}
    />
  ),
})
