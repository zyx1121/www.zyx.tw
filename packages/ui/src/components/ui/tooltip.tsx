"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "../../lib/utils"
import { FrameEdges } from "./frame"

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

// Where a line of words has its ink. A line box keeps room above for tall
// letters and below for descenders; words that use neither, such as "zyx",
// would sit low in it. The four edges trim the box to what the words really
// fill: from cap height when a letter is tall, else from x-height, and down
// to the descender when a letter has one, else to the baseline. The tooltip
// shows its words in lowercase, so only the lowercase shapes count.
const TALL = /[bdfhijklt0-9]/
const DESCENDER = /[gjpqy]/
function inkEdges(words: string) {
  const text = words.toLowerCase()
  // Latin only: other scripts have their own proportions and keep the line box.
  if (/[^ -\u024f]/.test(text)) return undefined
  const tall = TALL.test(text)
  const low = DESCENDER.test(text)
  if (tall && low) return "[text-box:trim-both_cap_text]"
  if (tall) return "[text-box:trim-both_cap_alphabetic]"
  if (low) return "[text-box:trim-both_ex_text]"
  return "[text-box:trim-both_ex_alphabetic]"
}

// A small terminal window, opaque and outlined like every layer-2 window, in
// lowercase like a shell. No arrow. Plain words are centered by their ink
// (inkEdges), so the space above and below them is the same.
function TooltipContent({
  className,
  side = "top",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "relative z-50 inline-flex min-h-10 w-fit max-w-xs origin-(--transform-origin) items-center bg-background px-3 py-3 text-body text-foreground lowercase duration-overlay data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            className
          )}
          {...props}
        >
          {typeof children === "string" ? (
            <span className={cn("block", inkEdges(children))}>{children}</span>
          ) : (
            children
          )}
          <FrameEdges />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
