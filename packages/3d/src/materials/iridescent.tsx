import { useEffect, useMemo } from "react"
import * as THREE from "three"

import { defineMaterial } from "../registry"

export const iridescent = defineMaterial({
  id: "iridescent",
  label: "Iridescent",
  params: {
    color: { type: "color", label: "Color", default: "#ffffff" },
    metalness: {
      type: "number",
      fixed: true,
      label: "Metalness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 1,
    },
    roughness: {
      type: "number",
      fixed: true,
      label: "Roughness",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.15,
    },
    iridescence: {
      type: "number",
      fixed: true,
      label: "Iridescence",
      min: 0,
      max: 1,
      step: 0.01,
      default: 1,
    },
    filmIor: {
      type: "number",
      fixed: true,
      label: "Film refraction",
      min: 1,
      max: 2.333,
      step: 0.001,
      default: 1.3,
    },
    filmMin: {
      type: "number",
      fixed: true,
      label: "Thinnest film (nm)",
      min: 0,
      max: 2000,
      step: 10,
      default: 200,
    },
    filmMax: {
      type: "number",
      fixed: true,
      label: "Thickest film (nm)",
      min: 0,
      max: 2000,
      step: 10,
      default: 800,
    },
    pattern: {
      type: "boolean",
      fixed: true,
      label: "Uneven film",
      default: true,
    },
    kind: {
      type: "number",
      fixed: true,
      label: "TUNE pattern",
      min: 0,
      max: 3,
      step: 1,
      default: 0,
    },
  },
  render: (values) => <IridescentMaterial {...values} />,
})

function IridescentMaterial({
  color,
  metalness,
  roughness,
  iridescence,
  filmIor,
  filmMin,
  filmMax,
  pattern,
  kind,
}: {
  color: string
  metalness: number
  roughness: number
  iridescence: number
  filmIor: number
  filmMin: number
  filmMax: number
  pattern: boolean
  kind: number
}) {
  const thickness = useFilmThickness(kind)
  const range = useMemo(
    (): [number, number] => [filmMin, filmMax],
    [filmMin, filmMax]
  )
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      iridescence={iridescence}
      iridescenceIOR={filmIor}
      iridescenceThicknessRange={range}
      iridescenceThicknessMap={pattern ? thickness : null}
    />
  )
}

/**
 * How thick the film is across the shape, in the green channel where three
 * reads it: two slow, crossing waves, so the colors drift in bands the way
 * they do on an oil film instead of changing only with the viewing angle.
 */
function useFilmThickness(kind: number) {
  const texture = useMemo(() => {
    const size = 128
    const data = new Uint8Array(size * size * 4)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size
        const v = y / size
        const TAU = 2 * Math.PI
        let wave: number
        if (kind === 1) {
          // diagonal bands, gently bent
          wave = 0.5 * (u + v) + 0.06 * Math.sin(TAU * (1.5 * u - 0.7 * v))
        } else if (kind === 2) {
          // irregular swirl
          wave =
            0.5 +
            0.2 * Math.sin(TAU * (0.9 * u + 0.35 * v) + 0.4) +
            0.15 * Math.sin(TAU * (0.4 * u - 1.2 * v) + 2.1) +
            0.1 * Math.sin(TAU * (1.9 * u + 1.4 * v) + 4.0) +
            0.05 * Math.sin(TAU * (3.1 * u - 2.3 * v) + 1.0)
        } else if (kind === 3) {
          // vertical gradient, like a draining soap film
          wave = v + 0.04 * Math.sin(TAU * 2.2 * u)
        } else {
          wave =
            0.5 +
            0.25 * Math.sin(TAU * (1.1 * u + 0.6 * v)) +
            0.25 * Math.sin(TAU * (0.5 * u - 1.3 * v) + 1.3)
        }
        const value = Math.round(Math.min(1, Math.max(0, wave)) * 255)
        data.set([value, value, value, 255], (y * size + x) * 4)
      }
    }
    const map = new THREE.DataTexture(data, size, size)
    map.wrapS = map.wrapT = THREE.MirroredRepeatWrapping
    map.magFilter = map.minFilter = THREE.LinearFilter
    map.needsUpdate = true
    return map
  }, [kind])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}
