import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "../../lib/utils"
import { fieldFrameClassName } from "./field-trigger"
import { FrameEdges } from "./frame"

const inputClassName =
  "h-10 w-full min-w-0 bg-transparent px-3 text-body outline-none file:h-full file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"

// Same height as Button so they line up in a row. The field is a box around
// the input that carries the glyph frame, so className sizes and places the
// field; bare drops the box for an input that sits inside another field.
function Input({
  className,
  type,
  bare = false,
  ...props
}: React.ComponentProps<"input"> & { bare?: boolean }) {
  if (bare) {
    return (
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(inputClassName, className)}
        {...props}
      />
    )
  }
  return (
    <span
      data-slot="input-field"
      className={cn("group/field relative flex w-full min-w-0", className)}
    >
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(inputClassName, type === "color" && "cursor-pointer p-1")}
        {...props}
      />
      <FrameEdges className={fieldFrameClassName} />
    </span>
  )
}

export { Input }
