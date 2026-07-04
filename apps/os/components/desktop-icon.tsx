"use client"

import { PixelIcon, type IconName } from "@/components/pixel-icon"
import { cn } from "@/lib/utils"

interface DesktopIconProps {
  label: string
  icon: IconName
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}

export function DesktopIcon({
  label,
  icon,
  selected,
  onSelect,
  onOpen,
}: DesktopIconProps) {
  return (
    <button
      type="button"
      className="win98-focusable flex w-20 flex-col items-center gap-1 p-1"
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onDoubleClick={(event) => {
        event.stopPropagation()
        onOpen()
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen()
      }}
    >
      <PixelIcon
        name={icon}
        size={32}
        className={cn(selected && "opacity-70")}
      />
      <span
        className={cn(
          "px-1 text-center text-[11px] text-white [text-shadow:1px_1px_1px_black]",
          selected &&
            "bg-selection text-selection-foreground [text-shadow:none]"
        )}
      >
        {label}
      </span>
    </button>
  )
}
