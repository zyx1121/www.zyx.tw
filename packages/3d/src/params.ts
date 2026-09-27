export type ParamValue = number | string | boolean

export type NumberParam = {
  type: "number"
  label: string
  fixed?: boolean
  min: number
  max: number
  step: number
  default: number
}

export type ColorParam = {
  type: "color"
  label: string
  fixed?: boolean
  /** `#rrggbb` */
  default: string
}

export type BooleanParam = {
  type: "boolean"
  label: string
  fixed?: boolean
  default: boolean
}

/**
 * One adjustable value. The editor builds its control from this, the
 * renderer reads the value. A `fixed` param always takes its default: the
 * editor doesn't show it and the renderer ignores anything else, so a look
 * that needs another value becomes a preset rather than one more slider.
 */
export type ParamDef = NumberParam | ColorParam | BooleanParam

export type ParamDefs = Record<string, ParamDef>

export type ParamValues = Record<string, ParamValue>

type ValueOf<D extends ParamDef> = D extends NumberParam
  ? number
  : D extends ColorParam
    ? string
    : boolean

export type ValuesOf<P extends ParamDefs> = { [K in keyof P]: ValueOf<P[K]> }

const HEX_COLOR = /^#[0-9a-f]{6}$/i

/** Coerces a stored value to its definition: numbers are clamped, a value of the wrong type becomes the default. */
export function resolveValue(def: ParamDef, value: unknown): ParamValue {
  if (def.fixed) return def.default
  switch (def.type) {
    case "number":
      return typeof value === "number" && Number.isFinite(value)
        ? Math.min(def.max, Math.max(def.min, value))
        : def.default
    case "color":
      return typeof value === "string" && HEX_COLOR.test(value)
        ? value
        : def.default
    case "boolean":
      return typeof value === "boolean" ? value : def.default
  }
}

/** Every value a definition declares, so a renderer never sees one missing or out of range. */
export function resolveValues<P extends ParamDefs>(
  defs: P,
  values: Record<string, unknown> = {}
): ValuesOf<P> {
  const resolved: ParamValues = {}
  for (const [key, def] of Object.entries(defs)) {
    resolved[key] = resolveValue(def, values[key])
  }
  return resolved as ValuesOf<P>
}

export function defaultValues<P extends ParamDefs>(defs: P): ValuesOf<P> {
  return resolveValues(defs)
}
