import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "bevel-sunken win98-focusable h-[21px] w-full min-w-0 px-1 py-[3px] text-win98-text disabled:text-button-shadow",
        className
      )}
      {...props}
    />
  )
}

export { Input }
