import { defineMaterial } from "../registry"

const tint = { type: "color", label: "Tint", default: "#ffffff" } as const

/** A thin soap film: almost no bend, rainbow sheen that shifts with the angle. */
export const bubble = defineMaterial({
  id: "bubble",
  label: "Bubble",
  params: { color: tint },
  render: ({ color }) => (
    <meshPhysicalMaterial
      metalness={0}
      roughness={0}
      transmission={1}
      thickness={0.15}
      ior={1.15}
      attenuationColor={color}
      attenuationDistance={2}
      iridescence={1}
      iridescenceIOR={1.33}
      iridescenceThicknessRange={[200, 800]}
      clearcoat={1}
      clearcoatRoughness={0}
    />
  ),
})

/** Dense crystal: hard bends and strong rainbow fringes, like a prism. */
export const prism = defineMaterial({
  id: "prism",
  label: "Prism",
  params: { color: tint },
  render: ({ color }) => (
    <meshPhysicalMaterial
      metalness={0}
      roughness={0}
      transmission={1}
      thickness={2.5}
      ior={2}
      dispersion={10}
      attenuationColor={color}
      attenuationDistance={2}
      clearcoat={1}
      clearcoatRoughness={0}
      specularIntensity={1}
    />
  ),
})

/** Frosted glass: the sky behind it blurs into soft color. */
export const frosted = defineMaterial({
  id: "frosted",
  label: "Frosted",
  params: { color: tint },
  render: ({ color }) => (
    <meshPhysicalMaterial
      metalness={0}
      roughness={0.35}
      transmission={1}
      thickness={1.5}
      ior={1.45}
      dispersion={2}
      attenuationColor={color}
      attenuationDistance={1}
      clearcoat={1}
      clearcoatRoughness={0.1}
    />
  ),
})
