import * as React from "react"

import { cn } from "../../lib/utils"

// A floating bar of 40px controls over a working surface (a canvas, a map):
// a layer-2 window with 4px around its controls.
function Toolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar"
      className={cn(
        "flex items-center gap-1 border border-muted-foreground bg-background p-1 text-body",
        className
      )}
      {...props}
    />
  )
}

export { Toolbar }
