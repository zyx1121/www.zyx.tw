"use client"

import {
  useRef,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"

import {
  defaultValues,
  effects,
  environmentControls,
  environments,
  findPreset,
  materials,
  shapeControls,
  stagingControls,
  type EffectPreset,
  type ParamValue,
  type SceneV1,
} from "@workspace/3d"
import { Button } from "@workspace/ui/components/ui/button"
import { Label } from "@workspace/ui/components/ui/label"
import { Switch } from "@workspace/ui/components/ui/switch"

import { ParamGroup } from "@/components/param-control"
import { PresetSelect } from "@/components/preset-select"

type PanelProps = {
  scene: SceneV1
  onChange: Dispatch<SetStateAction<SceneV1>>
  onOpenFile: (file: File) => void
  onExport: () => void
  error: string | null
}

export function Panel({
  scene,
  onChange,
  onOpenFile,
  onExport,
  error,
}: PanelProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const material = findPreset(materials, scene.material.id) ?? materials[0]
  const environment =
    findPreset(environments, scene.environment.id) ?? environments[0]

  return (
    <aside className="absolute inset-x-2 bottom-12 flex max-h-[45dvh] flex-col overflow-hidden rounded-2xl border bg-background/85 backdrop-blur-md sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-auto sm:max-h-[calc(100dvh-4rem)] sm:w-72">
      <div className="flex gap-2 border-b p-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => fileInput.current?.click()}
        >
          Open
        </Button>
        <Button className="flex-1" onClick={onExport}>
          Export
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".svg,image/svg+xml,.json,application/json"
          aria-label="Open an SVG or a scene.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            // Clear it so choosing the same file again still fires
            event.target.value = ""
            if (file) onOpenFile(file)
          }}
        />
      </div>
      {error && (
        <p
          role="alert"
          className="border-b px-4 py-2 font-mono text-xs whitespace-pre-line text-destructive"
        >
          {error}
        </p>
      )}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <Section title="Shape">
          <ParamGroup
            id="shape"
            defs={shapeControls}
            values={scene.shape}
            onChange={(key, value) =>
              onChange((current) => ({
                ...current,
                shape: { ...current.shape, [key]: value },
              }))
            }
          />
        </Section>

        <Section title="Material">
          <PresetSelect
            label="Material"
            presets={materials}
            value={material.id}
            onChange={(id) => {
              const preset = findPreset(materials, id) ?? materials[0]
              onChange((current) => ({
                ...current,
                material: {
                  id: preset.id,
                  params: defaultValues(preset.params),
                },
              }))
            }}
          />
          <ParamGroup
            id={`material-${material.id}`}
            defs={material.params}
            values={scene.material.params}
            onChange={(key, value) =>
              onChange((current) => ({
                ...current,
                material: {
                  ...current.material,
                  params: { ...current.material.params, [key]: value },
                },
              }))
            }
          />
        </Section>

        <Section title="Environment">
          <PresetSelect
            label="Environment"
            presets={environments}
            value={environment.id}
            onChange={(id) =>
              onChange((current) => ({
                ...current,
                environment: { ...current.environment, id },
              }))
            }
          />
          <ParamGroup
            id="environment"
            defs={environmentControls}
            values={scene.environment}
            onChange={(key, value) =>
              onChange((current) => ({
                ...current,
                environment: { ...current.environment, [key]: value },
              }))
            }
          />
        </Section>

        <Section title="Staging">
          <ParamGroup
            id="staging"
            defs={stagingControls}
            values={scene.staging}
            onChange={(key, value) =>
              onChange((current) => ({
                ...current,
                staging: { ...current.staging, [key]: value },
              }))
            }
          />
        </Section>

        <Section title="Effects">
          {effects.map((preset) => {
            const active = scene.effects.find(
              (effect) => effect.id === preset.id
            )
            return (
              <div key={preset.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`effect-${preset.id}`}>{preset.label}</Label>
                  <Switch
                    id={`effect-${preset.id}`}
                    checked={active !== undefined}
                    onCheckedChange={(checked) =>
                      onChange((current) =>
                        toggleEffect(current, preset, checked)
                      )
                    }
                  />
                </div>
                {active && (
                  <ParamGroup
                    id={`effect-${preset.id}`}
                    defs={preset.params}
                    values={active.params}
                    onChange={(key, value) =>
                      onChange((current) =>
                        setEffectParam(current, preset.id, key, value)
                      )
                    }
                  />
                )}
              </div>
            )
          })}
        </Section>
      </div>
    </aside>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-medium text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

/** Effects stay in registry order, which is the order they apply in. */
function toggleEffect(
  scene: SceneV1,
  preset: EffectPreset,
  on: boolean
): SceneV1 {
  const rest = scene.effects.filter((effect) => effect.id !== preset.id)
  const next = on
    ? [...rest, { id: preset.id, params: defaultValues(preset.params) }]
    : rest
  const order = effects.map((effect) => effect.id)
  next.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
  return { ...scene, effects: next }
}

function setEffectParam(
  scene: SceneV1,
  id: string,
  key: string,
  value: ParamValue
): SceneV1 {
  return {
    ...scene,
    effects: scene.effects.map((effect) =>
      effect.id === id
        ? { ...effect, params: { ...effect.params, [key]: value } }
        : effect
    ),
  }
}
