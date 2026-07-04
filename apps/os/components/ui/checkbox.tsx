import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "bevel-sunken win98-focusable flex size-[13px] shrink-0 items-center justify-center disabled:opacity-60",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-win98-text">
        <svg viewBox="0 0 10 10" width={9} height={9} aria-hidden>
          <polyline
            points="1,5 4,8 9,1"
            fill="none"
            stroke="#000"
            strokeWidth={2}
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
