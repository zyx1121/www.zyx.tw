import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none items-center py-2 select-none",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="bevel-sunken relative h-1 w-full grow">
        <SliderPrimitive.Range className="absolute h-full bg-selection" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="bevel-raised win98-focusable active:bevel-pressed block h-5 w-3 shrink-0 bg-surface"
        aria-label="滑桿"
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
