import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm corner-token",
        "placeholder:text-foreground/50",
        "outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/40",
        "motion-safe:transition-[color,box-shadow]",
        className
      )}
      {...props}
    />
  )
}
