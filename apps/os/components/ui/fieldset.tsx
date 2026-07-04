import * as React from "react"

import { cn } from "@/lib/utils"

function Fieldset({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="fieldset"
      className={cn(
        "border-2 [border-style:groove] border-button-face-light p-2.5",
        className
      )}
      {...props}
    />
  )
}

function FieldsetLegend({
  className,
  ...props
}: React.ComponentProps<"legend">) {
  return (
    <legend
      data-slot="fieldset-legend"
      className={cn("px-1", className)}
      {...props}
    />
  )
}

export { Fieldset, FieldsetLegend }
