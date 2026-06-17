import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm corner-token",
        "selection:bg-foreground selection:text-background placeholder:text-foreground/50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
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
