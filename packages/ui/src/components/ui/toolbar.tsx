import * as React from "react"

import { cn } from "../../lib/utils"
import { FrameEdges } from "./frame"

// A floating bar of 40px controls over a working surface (a canvas, a map):
// a layer-2 window with 4px around its controls.
function Toolbar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar"
      className={cn(
        "relative flex items-center gap-1 bg-background p-1 text-body",
        className
      )}
      {...props}
    >
      {children}
      <FrameEdges />
    </div>
  )
}

export { Toolbar }
