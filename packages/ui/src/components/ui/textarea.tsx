import * as React from "react"

import { cn } from "../../lib/utils"
import { fieldFrameClassName } from "./field-trigger"
import { FrameEdges } from "./frame"

// Framed like Input: className sizes and places the field around the textarea.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <span
      data-slot="textarea-field"
      className={cn("group/field relative flex w-full min-w-0", className)}
    >
      <textarea
        data-slot="textarea"
        className="flex field-sizing-content min-h-24 w-full bg-transparent px-3 py-2 text-body outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      <FrameEdges className={fieldFrameClassName} />
    </span>
  )
}

export { Textarea }
