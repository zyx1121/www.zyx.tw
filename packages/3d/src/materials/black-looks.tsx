import { defineMaterial } from "../registry"

/** No light comes back: a flat silhouette, like a hole cut in the scene. */
export const voidBlack = defineMaterial({
  id: "void",
  label: "Void",
  params: {},
  render: () => <meshBasicMaterial color="#000000" toneMapped={false} />,
})

/** Black volcanic glass: dark through and through, with a wet coat on top. */
export const obsidian = defineMaterial({
  id: "obsidian",
  label: "Obsidian",
  params: {},
  render: () => (
    <meshPhysicalMaterial
      color="#0a0a0c"
      metalness={0}
      roughness={0.05}
      transmission={0.35}
      thickness={1.5}
      ior={1.5}
      attenuationColor="#1a1020"
      attenuationDistance={0.15}
      clearcoat={1}
      clearcoatRoughness={0}
      specularIntensity={1}
    />
  ),
})

/** Black with a thin-film rainbow, like a beetle's shell or oil on a road. */
export const oilSlick = defineMaterial({
  id: "oil",
  label: "Oil slick",
  params: {},
  render: () => (
    <meshPhysicalMaterial
      color="#050505"
      metalness={0.6}
      roughness={0.15}
      iridescence={1}
      iridescenceIOR={1.8}
      iridescenceThicknessRange={[250, 900]}
      clearcoat={1}
      clearcoatRoughness={0.05}
    />
  ),
})

/** Smoked mirror chrome. */
export const blackChrome = defineMaterial({
  id: "chrome",
  label: "Black chrome",
  params: {},
  render: () => (
    <meshPhysicalMaterial
      color="#2a2a2e"
      metalness={1}
      roughness={0.05}
      clearcoat={1}
      clearcoatRoughness={0}
    />
  ),
})

/** Matte black velvet: soft glow where the surface turns away. */
export const velvet = defineMaterial({
  id: "velvet",
  label: "Velvet",
  params: {},
  render: () => (
    <meshPhysicalMaterial
      color="#060606"
      metalness={0}
      roughness={1}
      sheen={1}
      sheenRoughness={0.4}
      sheenColor="#6b6b80"
    />
  ),
})
