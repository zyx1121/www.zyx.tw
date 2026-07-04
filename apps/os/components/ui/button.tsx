import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "win98-focusable inline-flex min-h-[23px] min-w-[75px] shrink-0 items-center justify-center bg-surface px-3 whitespace-nowrap text-win98-text select-none disabled:pointer-events-none disabled:text-button-shadow disabled:[text-shadow:1px_1px_0_var(--color-button-highlight)]",
  {
    variants: {
      tone: {
        normal:
          "bevel-raised active:bevel-pressed active:translate-x-px active:translate-y-px",
        default: "bevel-default-button",
      },
    },
    defaultVariants: {
      tone: "normal",
    },
  }
)

function Button({
  className,
  tone,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ tone, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
