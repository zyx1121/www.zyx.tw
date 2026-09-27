import type {} from "@react-three/fiber"
import type { ReactElement } from "react"

import type { ParamDefs, ValuesOf } from "./params"

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
  /** An equirectangular .hdr, resolved against the renderer's envBaseUrl. */
  file: string
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

export function findPreset<T extends { id: string }>(
  registry: Registry<T>,
  id: string
): T | undefined {
  return registry.find((preset) => preset.id === id)
}
