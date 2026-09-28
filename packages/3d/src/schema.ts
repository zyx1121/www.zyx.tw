import { z } from "zod"

import {
  environmentControls,
  motionControls,
  shapeControls,
  stagingControls,
} from "./controls"
import { effects } from "./effects"
import { environments } from "./environments"
import { materials } from "./materials"
import { defaultValues, resolveValues } from "./params"
import { findPreset } from "./registry"
import { stagings } from "./stagings"

export const SCENE_VERSION = "v1"

const paramValues = z.record(
  z.string(),
  z.union([z.number(), z.string(), z.boolean()])
)

/**
 * scene.json, version 1. Numbers outside a control's range are clamped when
 * rendered. An unknown material, environment or staging id falls back to the
 * first preset and an unknown effect is skipped, so older files keep working
 * as presets come and go.
 */
export const sceneSchema = z.object({
  version: z.literal(SCENE_VERSION),
  shape: z.object({
    svg: z.string().min(1),
    depth: z.number(),
    bevel: z.number(),
    bevelSegments: z.number(),
    curveSegments: z.number(),
    /**
     * Set when the SVG was made from text: what was typed and the editor's
     * font id, so the editor can reopen it. Renderers only read `svg`.
     */
    text: z.object({ value: z.string(), font: z.string() }).optional(),
  }),
  material: z.object({ id: z.string(), params: paramValues }),
  environment: z.object({
    id: z.string(),
    intensity: z.number(),
    rotation: z.number(),
    background: z.boolean(),
  }),
  staging: z.object({
    // Files saved before staging presets have no id, and their light
    // settings are dropped: Oblique is the look they had.
    id: z.string().default("oblique"),
    background: z.string(),
  }),
  motion: z
    .object({ hover: z.boolean().default(motionControls.hover.default) })
    .prefault({}),
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
  const staging = findPreset(stagings, scene.staging.id) ?? stagings[0]
  return {
    version: SCENE_VERSION,
    shape: {
      svg: scene.shape.svg,
      ...resolveValues(shapeControls, scene.shape),
      ...(scene.shape.text && { text: scene.shape.text }),
    },
    material: {
      id: material.id,
      params: resolveValues(material.params, scene.material.params),
    },
    environment: {
      id: environment.id,
      ...resolveValues(environmentControls, scene.environment),
    },
    staging: {
      id: staging.id,
      ...resolveValues(stagingControls, scene.staging),
    },
    motion: resolveValues(motionControls, scene.motion),
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
  const [staging] = stagings
  return {
    version: SCENE_VERSION,
    shape: { svg, ...defaultValues(shapeControls) },
    material: { id: material.id, params: defaultValues(material.params) },
    environment: { id: environment.id, ...defaultValues(environmentControls) },
    staging: { id: staging.id, ...defaultValues(stagingControls) },
    motion: defaultValues(motionControls),
    effects: [],
  }
}
