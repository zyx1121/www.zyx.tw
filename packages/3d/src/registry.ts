import type {} from "@react-three/fiber"
import type { ReactElement } from "react"

import type { ParamDefs, ValuesOf } from "./params"
import type { SceneView } from "./scene-3d"

export type MaterialPreset<P extends ParamDefs = ParamDefs> = {
  id: string
  label: string
  params: P
  /** A material element, rendered as the child of the shape's mesh. */
  render(values: ValuesOf<P>): ReactElement
}

export type EffectPreset<P extends ParamDefs = ParamDefs> = {
  id: string
  label: string
  /**
   * "scene" effects see the linear, unbounded frame before tone mapping,
   * which is what glow needs. "display" effects see the finished image,
   * background included, which is what a vignette or grain needs.
   */
  stage: "scene" | "display"
  params: P
  /** A postprocessing effect element, rendered inside the EffectComposer. */
  render(values: ValuesOf<P>): ReactElement
}

export type EnvironmentPreset = {
  id: string
  label: string
  /**
   * Resolved against the renderer's envBaseUrl: an equirectangular .hdr, or
   * a gain map's three files (see gainMapFiles).
   */
  files: string | readonly [string, string, string]
}

/** How the shape is shot: where the camera looks from and where the key light comes from. */
export type StagingPreset = {
  id: string
  label: string
  /** The camera's angle, in degrees, unless <Scene3D> is given a view. */
  view: SceneView
  /** The key light's direction in degrees, measured like the view, and its intensity. */
  light: { azimuth: number; elevation: number; intensity: number }
  /** Moves the shape, in scene units, and turns it, in degrees about x, y and z. */
  object?: {
    position?: readonly [number, number, number]
    rotation?: readonly [number, number, number]
  }
  /** An invisible floor under the shape, seen only through its soft shadow. */
  floor?: {
    /** Between the shape's lowest point and the floor, in scene units. */
    gap: number
    /** How dark the shadow is where the shape comes closest, from 0 to 1. */
    opacity: number
    /** How far the shadow spreads past the shape's outline, in scene units. */
    blur: number
  }
}

/** A registry always has a first entry, which stands in for unknown ids. */
export type Registry<T> = readonly [T, ...T[]]

export function defineMaterial<const P extends ParamDefs>(
  preset: MaterialPreset<P>
): MaterialPreset {
  return preset
}

export function defineEffect<const P extends ParamDefs>(
  preset: EffectPreset<P>
): EffectPreset {
  return preset
}

export function defineEnvironment(preset: EnvironmentPreset) {
  return preset
}

export function defineStaging(preset: StagingPreset) {
  return preset
}

/**
 * A gain map rendition in apps/3d/public/env/<name>/: an SDR image, the gain
 * map that restores its HDR range, and their metadata. At 4096 x 2048 it
 * weighs well under a megabyte, where the .hdr it came from is about 25 MB.
 */
export function gainMapFiles(name: string): readonly [string, string, string] {
  return [`${name}/sdr.webp`, `${name}/gainmap.webp`, `${name}/metadata.json`]
}

export function findPreset<T extends { id: string }>(
  registry: Registry<T>,
  id: string
): T | undefined {
  return registry.find((preset) => preset.id === id)
}
