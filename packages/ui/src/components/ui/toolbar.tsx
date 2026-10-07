import * as React from "react"
import { cn } from "cn"

// A floating bar of 40px controls over a working surface (a canvas, a map):
// the frosted layer-2 surface with 4px around its controls, so it takes
// rounded-menu around their rounded-control.
function Toolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar"
      className={cn(
        "flex items-center gap-1 rounded-menu border border-border bg-transparent p-1 text-body shadow-lg backdrop-blur-md",
        className
      )}
      {...props}
    />
  )
}

export { Toolbar }
