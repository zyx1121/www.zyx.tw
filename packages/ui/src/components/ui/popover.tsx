"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "../../lib/utils"
import { FrameEdges } from "./frame"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

// A layer-2 window: opaque and outlined, p-1 around its content.
// For a combobox, use ComboboxContent: at least the trigger's width.
function PopoverContent({
  className,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  children,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "relative z-50 flex w-72 origin-(--transform-origin) flex-col bg-background p-1 text-body text-foreground outline-hidden duration-overlay data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            className
          )}
          {...props}
        >
          {children}
          <FrameEdges />
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverContent, PopoverTrigger }
