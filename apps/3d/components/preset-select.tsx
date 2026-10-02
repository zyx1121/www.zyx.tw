"use client"
import { T, useT } from "@workspace/ui/components/locale-provider"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/ui/select"

type PresetSelectProps = {
  label: string
  presets: readonly { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}

export function PresetSelect({
  label,
  presets,
  value,
  onChange,
}: PresetSelectProps) {
  const t = useT()

  return (
    <Select
      items={presets.map((preset) => ({
        value: preset.id,
        label: t(preset.label),
      }))}
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next)
      }}
    >
      <SelectTrigger aria-label={t(label)} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {presets.map((preset) => (
          <SelectItem key={preset.id} value={preset.id}>
            <T>{preset.label}</T>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
