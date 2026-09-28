"use client"

import { useLoader, useThree, type ThreeElements } from "@react-three/fiber"
import {
  Component,
  createContext,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react"
import * as THREE from "three"

/** The editor at 3d.zyx.tw serves the material textures, with CORS open to other sites. */
export const DEFAULT_TEXTURE_BASE_URL = "https://3d.zyx.tw/textures/"

/** Where texture files live; <Scene3D> provides its textureBaseUrl. */
export const TextureBaseUrl = createContext(DEFAULT_TEXTURE_BASE_URL)

/** The material props an image can fill. */
type TextureSlot = "map" | "normalMap" | "roughnessMap"

type TexturedMaterialProps = Omit<
  ThreeElements["meshPhysicalMaterial"],
  TextureSlot | "color"
> & {
  /** Paths below the texture base URL, by the material prop each one fills. */
  maps: Partial<Record<TextureSlot, string>>
  /** The color map's average, drawn until the files arrive or if they can't. */
  average: string
  /** Multiplies the color map. */
  color: string
}

/**
 * A physical material with image maps. Until they load, or if they can't be,
 * it draws the color map's average instead, so the shape never goes blank
 * and a missing file doesn't take the scene down.
 */
export function TexturedMaterial({
  maps,
  average,
  ...props
}: TexturedMaterialProps) {
  const baseUrl = useContext(TextureBaseUrl)
  const slots = Object.keys(maps) as TextureSlot[]
  const urls = slots.map((slot) => baseUrl + maps[slot])
  const plain = (
    <meshPhysicalMaterial
      {...props}
      color={new THREE.Color(average).multiply(new THREE.Color(props.color))}
    />
  )
  return (
    // Keyed by URL, so other files get another try after a failed load.
    <TextureBoundary key={String(urls)} fallback={plain}>
      <Suspense fallback={plain}>
        <LoadedMaterial slots={slots} urls={urls} {...props} />
      </Suspense>
    </TextureBoundary>
  )
}

function LoadedMaterial({
  slots,
  urls,
  ...props
}: Omit<TexturedMaterialProps, "maps" | "average"> & {
  slots: TextureSlot[]
  urls: string[]
}) {
  const gl = useThree((state) => state.gl)
  const textures = useLoader(THREE.TextureLoader, urls)
  const filled = useMemo(() => {
    // Sharper at grazing angles, which is how the walls are seen.
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    return Object.fromEntries(
      slots.map((slot, index) => {
        const texture = textures[index]
        if (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping
          texture.anisotropy = anisotropy
          if (slot === "map") texture.colorSpace = THREE.SRGBColorSpace
        }
        return [slot, texture]
      })
    )
  }, [slots, textures, gl])
  // The loader keeps the images for the next time the preset is picked;
  // only their GPU copies are freed. three uploads them again when needed.
  useEffect(
    () => () => {
      for (const texture of textures) texture.dispose()
    },
    [textures]
  )
  return <meshPhysicalMaterial {...props} {...filled} />
}

class TextureBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
