import { z } from "zod"

import { environmentControls, shapeControls, stagingControls } from "./controls"
import { effects } from "./effects"
import { environments } from "./environments"
import { materials } from "./materials"
import { defaultValues, resolveValues } from "./params"
import { findPreset } from "./registry"

export const SCENE_VERSION = "v1"

const paramValues = z.record(
  z.string(),
  z.union([z.number(), z.string(), z.boolean()])
)

/**
 * scene.json, version 1. Numbers outside a control's range are clamped when
 * rendered. An unknown material or environment id falls back to the first
 * preset and an unknown effect is skipped, so older files keep working as
 * presets come and go.
 */
export const sceneSchema = z.object({
  version: z.literal(SCENE_VERSION),
  shape: z.object({
    svg: z.string().min(1),
    depth: z.number(),
    bevel: z.number(),
    bevelSegments: z.number(),
    curveSegments: z.number(),
  }),
  material: z.object({ id: z.string(), params: paramValues }),
  environment: z.object({
    id: z.string(),
    intensity: z.number(),
    rotation: z.number(),
    background: z.boolean(),
  }),
  staging: z.object({
    background: z.string(),
    lightAzimuth: z.number(),
    lightElevation: z.number(),
    lightIntensity: z.number(),
  }),
  effects: z.array(z.object({ id: z.string(), params: paramValues })),
})

export type SceneV1 = z.infer<typeof sceneSchema>

export type ParseSceneResult =
  { ok: true; scene: SceneV1 } | { ok: false; error: string }

/** Reads a scene.json you ship with your app; throws when it doesn't match v1. */
export function parseScene(input: unknown): SceneV1 {
  return normalizeScene(sceneSchema.parse(input))
}

/** Reads an untrusted scene.json, such as a file someone dropped in. */
export function safeParseScene(input: unknown): ParseSceneResult {
  const result = sceneSchema.safeParse(input)
  return result.success
    ? { ok: true, scene: normalizeScene(result.data) }
    : { ok: false, error: z.prettifyError(result.error) }
}

/**
 * The scene exactly as the renderer draws it: numbers clamped, fixed params
 * at their defaults, unknown presets replaced or dropped, effects in
 * registry order. Files the editor saves are always in this form.
 */
export function normalizeScene(scene: SceneV1): SceneV1 {
  const material = findPreset(materials, scene.material.id) ?? materials[0]
  const environment =
    findPreset(environments, scene.environment.id) ?? environments[0]
  return {
    version: SCENE_VERSION,
    shape: {
      svg: scene.shape.svg,
      ...resolveValues(shapeControls, scene.shape),
    },
    material: {
      id: material.id,
      params: resolveValues(material.params, scene.material.params),
    },
    environment: {
      id: environment.id,
      ...resolveValues(environmentControls, scene.environment),
    },
    staging: resolveValues(stagingControls, scene.staging),
    effects: effects.flatMap((preset) => {
      const stored = scene.effects.find((effect) => effect.id === preset.id)
      return stored
        ? [
            {
              id: preset.id,
              params: resolveValues(preset.params, stored.params),
            },
          ]
        : []
    }),
  }
}

/** A scene for this SVG with every other setting at its default. */
export function createScene(svg: string): SceneV1 {
  const [material] = materials
  const [environment] = environments
  return {
    version: SCENE_VERSION,
    shape: { svg, ...defaultValues(shapeControls) },
    material: { id: material.id, params: defaultValues(material.params) },
    environment: { id: environment.id, ...defaultValues(environmentControls) },
    staging: defaultValues(stagingControls),
    effects: [],
  }
}
