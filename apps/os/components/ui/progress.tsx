import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("bevel-sunken h-5 w-full p-0.5", className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full transition-[width]"
        style={{
          width: `${value ?? 0}%`,
          backgroundImage:
            "repeating-linear-gradient(90deg, navy 0 6px, transparent 6px 8px)",
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
