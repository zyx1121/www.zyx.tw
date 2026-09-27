"use client"

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
  return (
    <Select
      items={presets.map((preset) => ({
        value: preset.id,
        label: preset.label,
      }))}
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next)
      }}
    >
      <SelectTrigger aria-label={label} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {presets.map((preset) => (
          <SelectItem key={preset.id} value={preset.id}>
            {preset.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
