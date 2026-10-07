"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cn } from "cn"

// Same box as a ghost Button; pressed shows the muted fill.
function Toggle({ className, ...props }: TogglePrimitive.Props) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(
        "inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-control px-3 text-body font-medium whitespace-nowrap transition-colors duration-state outline-none select-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-pressed:bg-muted [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

export { Toggle }
