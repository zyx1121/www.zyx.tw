import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "bevel-sunken win98-focusable flex h-[21px] w-full items-center justify-between gap-1 pl-1 text-win98-text data-[placeholder]:text-button-shadow",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <span className="bevel-raised flex h-[19px] w-[17px] shrink-0 items-center justify-center">
          <svg viewBox="0 0 8 5" width={8} height={5} aria-hidden>
            <polygon points="0,0 8,0 4,5" fill="#000" />
          </svg>
        </span>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectValue(
  props: React.ComponentProps<typeof SelectPrimitive.Value>
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={0}
        className={cn(
          "bevel-raised z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-y-auto bg-white p-0.5",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "flex cursor-default items-center px-1.5 py-0.5 text-win98-text outline-none select-none data-[highlighted]:bg-selection data-[highlighted]:text-selection-foreground",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
