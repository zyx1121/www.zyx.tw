"use client"

import {
  resolveValues,
  type ParamDef,
  type ParamDefs,
  type ParamValue,
} from "@workspace/3d"
import { Input } from "@workspace/ui/components/ui/input"
import { Label } from "@workspace/ui/components/ui/label"
import { Slider } from "@workspace/ui/components/ui/slider"
import { Switch } from "@workspace/ui/components/ui/switch"

type ParamGroupProps = {
  /** Prefix for the controls' element ids, unique on the page. */
  id: string
  defs: ParamDefs
  values: Record<string, unknown>
  onChange: (key: string, value: ParamValue) => void
}

/** One control per definition that isn't fixed, so a new preset's params need no panel code. */
export function ParamGroup({ id, defs, values, onChange }: ParamGroupProps) {
  const resolved = resolveValues(defs, values)
  const shown = Object.entries(defs).filter(([, def]) => !def.fixed)
  if (shown.length === 0) return null
  return (
    <div className="space-y-4">
      {shown.map(([key, def]) => (
        <ParamControl
          key={key}
          id={`${id}-${key}`}
          def={def}
          value={resolved[key] ?? def.default}
          onChange={(value) => onChange(key, value)}
        />
      ))}
    </div>
  )
}

type ParamControlProps = {
  id: string
  def: ParamDef
  value: ParamValue
  onChange: (value: ParamValue) => void
}

function ParamControl({ id, def, value, onChange }: ParamControlProps) {
  switch (def.type) {
    case "number": {
      const number = typeof value === "number" ? value : def.default
      return (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label id={`${id}-label`}>{def.label}</Label>
            <span className="text-caption text-muted-foreground tabular-nums">
              {formatNumber(number, def.step)}
            </span>
          </div>
          {/* An array, since the stock Slider draws one thumb per entry and
              two for a bare number. */}
          <Slider
            aria-labelledby={`${id}-label`}
            min={def.min}
            max={def.max}
            step={def.step}
            value={[number]}
            onValueChange={(next) => {
              const picked = typeof next === "number" ? next : next[0]
              if (picked !== undefined) onChange(picked)
            }}
          />
        </div>
      )
    }
    case "color": {
      const color = typeof value === "string" ? value : def.default
      return (
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>{def.label}</Label>
          <Input
            id={id}
            type="color"
            value={color}
            onChange={(event) => onChange(event.target.value)}
            className="w-16 cursor-pointer p-1"
          />
        </div>
      )
    }
    case "boolean":
      return (
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>{def.label}</Label>
          <Switch
            id={id}
            checked={typeof value === "boolean" ? value : def.default}
            onCheckedChange={(checked) => onChange(checked)}
          />
        </div>
      )
  }
}

/** As many decimals as the step has, so 0.005 reads 0.030 and 1 reads 48. */
function formatNumber(value: number, step: number) {
  const decimals = step >= 1 ? 0 : Math.min(3, Math.ceil(-Math.log10(step)))
  return value.toFixed(decimals)
}
