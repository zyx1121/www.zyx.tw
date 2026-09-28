"use client"

import { useLoader, useThree, type ThreeElements } from "@react-three/fiber"
import {
  Component,
  createContext,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from "react"
import * as THREE from "three"

/** The editor at 3d.zyx.tw serves the material textures, with CORS open to other sites. */
export const DEFAULT_TEXTURE_BASE_URL = "https://3d.zyx.tw/textures/"

/** Where texture files live; <Scene3D> provides its textureBaseUrl. */
export const TextureBaseUrl = createContext(DEFAULT_TEXTURE_BASE_URL)

/** Image files by the material prop each one fills, as paths below the texture base URL. */
export type TextureMaps = Partial<
  Record<"map" | "normalMap" | "roughnessMap", string>
>

type MaterialProps = Omit<
  ThreeElements["meshPhysicalMaterial"],
  keyof TextureMaps | "color"
> & {
  /** Multiplies the color map. */
  color: string
}

type TexturedMaterialProps = MaterialProps & {
  /** Keep it outside render, so the files aren't resolved again every render. */
  maps: TextureMaps
  /** The color map's mean color, drawn until the files arrive or if they can't. */
  average: string
}

type TextureFile = { slot: string; url: string }

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
  const files = useMemo(
    () =>
      Object.entries(maps).flatMap(([slot, path]) =>
        path ? [{ slot, url: baseUrl + path }] : []
      ),
    [maps, baseUrl]
  )
  const plain = (
    <meshPhysicalMaterial
      {...props}
      color={new THREE.Color(average).multiply(new THREE.Color(props.color))}
    />
  )
  return (
    // Keyed by URL, so other files get another try after a failed load.
    <TextureBoundary
      key={files.map((file) => file.url).join()}
      fallback={plain}
    >
      <Suspense fallback={plain}>
        <LoadedMaterial files={files} {...props} />
      </Suspense>
    </TextureBoundary>
  )
}

function LoadedMaterial({
  files,
  ...props
}: MaterialProps & { files: TextureFile[] }) {
  const gl = useThree((state) => state.gl)
  const textures = useLoader(
    THREE.TextureLoader,
    files.map((file) => file.url)
  )
  const filled = useMemo(
    () =>
      Object.fromEntries(
        files.map(({ slot }, index) => [slot, textures[index]])
      ),
    [files, textures]
  )
  // Set up before the first frame draws, and so before three uploads them.
  useLayoutEffect(() => {
    // Sharper at grazing angles, which is how the walls are seen.
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    files.forEach(({ slot }, index) => {
      const texture = textures[index]
      if (!texture) return
      // The bevel and walls reach a little past the lids' 0 to 1.
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.anisotropy = anisotropy
      if (slot === "map") texture.colorSpace = THREE.SRGBColorSpace
    })
  }, [files, textures, gl])
  // The loader keeps the images for the next time the preset is picked;
  // only their GPU copies are freed, and three uploads them again on use.
  useEffect(
    () => () => {
      for (const texture of textures) texture.dispose()
    },
    [textures]
  )
  return <meshPhysicalMaterial {...props} {...filled} />
}

/** A missing or blocked texture shows the fallback rather than taking the scene down. */
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
