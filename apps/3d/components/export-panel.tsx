"use client"

import { useEffect, useState, type RefObject } from "react"

import type { CaptureSize, Scene3DHandle } from "@workspace/3d"
import { Button } from "@workspace/ui/components/ui/button"
import { Label } from "@workspace/ui/components/ui/label"
import { Separator } from "@workspace/ui/components/ui/separator"
import { Switch } from "@workspace/ui/components/ui/switch"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/ui/toggle-group"

import { download } from "@/lib/download"

const FORMATS = {
  png: { label: "PNG", type: "image/png", extension: "png" },
  jpeg: { label: "JPEG", type: "image/jpeg", extension: "jpg" },
} as const

type Format = keyof typeof FORMATS

/** Each size sets the image's long side; the other follows the canvas. */
const SIZES = {
  hd: { label: "HD", side: 1920 },
  "4k": { label: "4K", side: 3840 },
  "8k": { label: "8K", side: 7680 },
} as const

type Size = keyof typeof SIZES

/** A size as asked for, and as this device's GPU will render it. */
type Output = { asked: CaptureSize; rendered: CaptureSize }

/** Kept by the dock, since the popover's contents unmount when it closes. */
export type ExportSettings = {
  format: Format
  size: Size
  transparent: boolean
}

export const DEFAULT_EXPORT: ExportSettings = {
  format: "png",
  size: "4k",
  transparent: false,
}

type ExportPanelProps = {
  view: RefObject<Scene3DHandle | null>
  stage: RefObject<HTMLElement | null>
  settings: ExportSettings
  onSettingsChange: (settings: ExportSettings) => void
  /** The environment shows as the background, which can't be left out. */
  environmentBackground: boolean
  onExportScene: () => void
}

/** The Export popover: the view as a PNG or JPEG, or the scene as scene.json. */
export function ExportPanel({
  view,
  stage,
  settings,
  onSettingsChange,
  environmentBackground,
  onExportScene,
}: ExportPanelProps) {
  const { format, size, transparent } = settings
  const change = (next: Partial<ExportSettings>) =>
    onSettingsChange({ ...settings, ...next })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const outputs = useOutputs(view, stage)
  const output = outputs?.[size]
  const canBeTransparent = format === "png" && !environmentBackground

  async function saveImage() {
    const handle = view.current
    if (!handle || !output) return
    setBusy(true)
    setError(null)
    try {
      // Rendering holds up the page, so let it show the busy button first.
      await new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve))
      )
      const { width, height } = output.rendered
      const { type, extension } = FORMATS[format]
      const blob = await handle.capture({
        width,
        height,
        type,
        transparent: transparent && canBeTransparent,
      })
      download(blob, `scene-${width}x${height}.${extension}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="space-y-2.5">
        <Label id="export-format-label">Format</Label>
        <ToggleGroup
          aria-labelledby="export-format-label"
          variant="outline"
          size="sm"
          className="w-full"
          value={[format]}
          onValueChange={([next]) => {
            if (next && next in FORMATS) change({ format: next as Format })
          }}
        >
          {Object.entries(FORMATS).map(([id, { label }]) => (
            <ToggleGroupItem key={id} value={id} className="flex-1">
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label id="export-size-label">Size</Label>
          {output && (
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {output.rendered.width} × {output.rendered.height}
            </span>
          )}
        </div>
        <ToggleGroup
          aria-labelledby="export-size-label"
          variant="outline"
          size="sm"
          className="w-full"
          value={[size]}
          onValueChange={([next]) => {
            if (next && next in SIZES) change({ size: next as Size })
          }}
        >
          {Object.entries(SIZES).map(([id, { label }]) => (
            <ToggleGroupItem key={id} value={id} className="flex-1">
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {output && isClamped(output) && (
          <p className="text-xs text-muted-foreground">
            {`Shrunk from ${output.asked.width} × ${output.asked.height} to fit this browser's WebGL limits.`}
          </p>
        )}
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="export-transparent">Transparent background</Label>
          <Switch
            id="export-transparent"
            checked={transparent && canBeTransparent}
            disabled={!canBeTransparent}
            onCheckedChange={(checked) => change({ transparent: checked })}
          />
        </div>
        {environmentBackground && (
          <p className="text-xs text-muted-foreground">
            Off while the environment is the background.
          </p>
        )}
      </div>

      <Button disabled={busy || !output} onClick={() => void saveImage()}>
        {busy ? "Rendering…" : `Download ${FORMATS[format].label}`}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <Separator />

      <Button variant="outline" onClick={onExportScene}>
        Download scene.json
      </Button>
    </>
  )
}

function isClamped({ asked, rendered }: Output) {
  return asked.width !== rendered.width || asked.height !== rendered.height
}

/**
 * Every size at the canvas's aspect ratio, as the GPU will render it; null
 * until the view is up. Kept current as the canvas resizes.
 */
function useOutputs(
  view: RefObject<Scene3DHandle | null>,
  stage: RefObject<HTMLElement | null>
) {
  const [outputs, setOutputs] = useState<Record<Size, Output> | null>(null)
  useEffect(() => {
    const element = stage.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      const handle = view.current
      const { width, height } = element.getBoundingClientRect()
      setOutputs(
        handle && width > 0 && height > 0
          ? measure(handle, width / height)
          : null
      )
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [view, stage])
  return outputs
}

function measure(handle: Scene3DHandle, aspect: number): Record<Size, Output> {
  const output = (side: number): Output => {
    const asked =
      aspect >= 1
        ? { width: side, height: Math.round(side / aspect) }
        : { width: Math.round(side * aspect), height: side }
    return { asked, rendered: handle.captureSize(asked.width, asked.height) }
  }
  return {
    hd: output(SIZES.hd.side),
    "4k": output(SIZES["4k"].side),
    "8k": output(SIZES["8k"].side),
  }
}
