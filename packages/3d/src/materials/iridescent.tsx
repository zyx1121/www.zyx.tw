import { useEffect, useMemo } from "react"
import * as THREE from "three"

import { defineMaterial } from "../registry"

export const iridescent = defineMaterial({
  id: "iridescent",
  label: "Iridescent",
  params: {
    color: { type: "color", label: "Color", default: "#a1a1aa" },
    roughness: {
      type: "number",
      fixed: true,
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.15,
    },
    filmIor: {
      type: "number",
      fixed: true,
      label: "Film refraction",
      min: 1,
      max: 2.333,
      step: 0.001,
      default: 1.5,
    },
    filmMin: {
      type: "number",
      fixed: true,
      label: "Thinnest film (nm)",
      min: 0,
      max: 1000,
      step: 10,
      default: 250,
    },
    filmMax: {
      type: "number",
      fixed: true,
      label: "Thickest film (nm)",
      min: 0,
      max: 1000,
      step: 10,
      default: 650,
    },
  },
  render: (values) => <IridescentMaterial {...values} />,
})

function IridescentMaterial({
  color,
  roughness,
  filmIor,
  filmMin,
  filmMax,
}: {
  color: string
  roughness: number
  filmIor: number
  filmMin: number
  filmMax: number
}) {
  const film = useFilmThickness()
  const range = useMemo(
    (): [number, number] => [filmMin, filmMax],
    [filmMin, filmMax]
  )
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={1}
      roughness={roughness}
      iridescence={1}
      iridescenceIOR={filmIor}
      iridescenceThicknessRange={range}
      iridescenceThicknessMap={film}
    />
  )
}

/**
 * How thick the film is across the shape, in the green channel three reads:
 * a few slow waves at odd angles. A film of one thickness changes color only
 * with the viewing angle, so each flat face would show a single hue; this
 * spreads the rainbow over the face the way an oil film does.
 */
function useFilmThickness() {
  const texture = useMemo(() => {
    const size = 128
    const data = new Uint8Array(size * size * 4)
    const turn = 2 * Math.PI
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size
        const v = y / size
        const thickness =
          0.5 +
          0.2 * Math.sin(turn * (0.9 * u + 0.35 * v) + 0.4) +
          0.15 * Math.sin(turn * (0.4 * u - 1.2 * v) + 2.1) +
          0.1 * Math.sin(turn * (1.9 * u + 1.4 * v) + 4) +
          0.05 * Math.sin(turn * (3.1 * u - 2.3 * v) + 1)
        const value = Math.round(thickness * 255)
        data.set([value, value, value, 255], (y * size + x) * 4)
      }
    }
    const map = new THREE.DataTexture(data, size, size)
    // Mirrored, so the waves stay continuous past the edge of the map.
    map.wrapS = map.wrapT = THREE.MirroredRepeatWrapping
    map.magFilter = map.minFilter = THREE.LinearFilter
    map.needsUpdate = true
    return map
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}
