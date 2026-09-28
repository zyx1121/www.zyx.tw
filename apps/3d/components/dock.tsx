"use client"

import {
  Box,
  Camera,
  Download,
  FolderOpen,
  PaintBucket,
  Palette,
  Sparkles,
  Sun,
} from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
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
  motionControls,
  shapeControls,
  stagingControls,
  stagings,
  type EffectPreset,
  type ParamValue,
  type SceneV1,
} from "@workspace/3d"
import { Button } from "@workspace/ui/components/ui/button"
import { Label } from "@workspace/ui/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/ui/popover"
import { Separator } from "@workspace/ui/components/ui/separator"
import { Switch } from "@workspace/ui/components/ui/switch"

import { ParamGroup } from "@/components/param-control"
import { PresetSelect } from "@/components/preset-select"
import { ShapeSource, type ShapeSourceProps } from "@/components/shape-source"

type DockProps = {
  scene: SceneV1
  source: ShapeSourceProps
  onChange: Dispatch<SetStateAction<SceneV1>>
  onOpenFile: (file: File) => void
  onExport: () => void
  error: string | null
}

/** A bar floating along the bottom; each section opens its controls in a popover above it. */
export function Dock({
  scene,
  source,
  onChange,
  onOpenFile,
  onExport,
  error,
}: DockProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  // One section open at a time, by label.
  const [open, setOpen] = useState<string | null>(null)
  useCloseOnCanvasPress(setOpen)
  const section = (label: string) => ({
    label,
    open: open === label,
    onOpenChange: (next: boolean) =>
      setOpen((current) => (next ? label : current === label ? null : current)),
  })
  const material = findPreset(materials, scene.material.id) ?? materials[0]
  const environment =
    findPreset(environments, scene.environment.id) ?? environments[0]
  const staging = findPreset(stagings, scene.staging.id) ?? stagings[0]

  return (
    // The row spans the width so it can centre the bar; only the bar and
    // the error take pointer events, the rest stays the canvas's.
    <div className="pointer-events-none absolute inset-x-0 bottom-12 flex flex-col items-center gap-2 px-2">
      {error && (
        <p
          role="alert"
          className="pointer-events-auto max-w-md rounded-xl border bg-background/85 px-3 py-2 font-mono text-xs whitespace-pre-line text-destructive backdrop-blur-md"
        >
          {error}
        </p>
      )}
      <nav
        aria-label="Editor"
        className="pointer-events-auto flex items-center gap-0.5 rounded-full border bg-background/85 p-1 backdrop-blur-md"
      >
        <Section icon={<Box />} {...section("Shape")}>
          <ShapeSource {...source} />
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

        <Section icon={<Palette />} {...section("Material")}>
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

        <Section icon={<Sun />} {...section("Environment")}>
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

        <Section icon={<PaintBucket />} {...section("Background")}>
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

        <Section icon={<Camera />} {...section("Staging")}>
          <PresetSelect
            label="Staging"
            presets={stagings}
            value={staging.id}
            onChange={(id) =>
              onChange((current) => ({
                ...current,
                staging: { ...current.staging, id },
              }))
            }
          />
          <ParamGroup
            id="motion"
            defs={motionControls}
            values={scene.motion}
            onChange={(key, value) =>
              onChange((current) => ({
                ...current,
                motion: { ...current.motion, [key]: value },
              }))
            }
          />
        </Section>

        <Section icon={<Sparkles />} {...section("Effects")}>
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

        {/* Stretches to the bar's full height; -my-1 cancels the bar's
            padding so the line meets its top and bottom edges. */}
        <Separator orientation="vertical" className="mx-1 -my-1" />

        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          aria-label="Open an SVG or a scene.json"
          onClick={() => fileInput.current?.click()}
        >
          <FolderOpen />
          <span className="hidden sm:inline">Open</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          aria-label="Export scene.json"
          onClick={onExport}
        >
          <Download />
          <span className="hidden sm:inline">Export</span>
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
      </nav>
    </div>
  )
}

/**
 * Closes the open section when the canvas is pressed. Base UI dismisses on
 * outside presses too, but it skips the first one after a press inside the
 * popup, such as flipping a switch, and the canvas is where people click.
 */
function useCloseOnCanvasPress(
  setOpen: Dispatch<SetStateAction<string | null>>
) {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof HTMLCanvasElement) setOpen(null)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [setOpen])
}

/** One button on the bar; its controls open in a popover above it. */
function Section({
  icon,
  label,
  open,
  onOpenChange,
  children,
}: {
  icon: ReactNode
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={label}
            className="rounded-full data-popup-open:bg-muted"
          />
        }
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </PopoverTrigger>
      <PopoverContent side="top" sideOffset={10} className="w-72 gap-4 p-4">
        <PopoverTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </PopoverTitle>
        {children}
      </PopoverContent>
    </Popover>
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
