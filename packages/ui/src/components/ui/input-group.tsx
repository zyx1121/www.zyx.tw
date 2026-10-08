"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Input } from "./input"

// An input with text or a button inside its border: the group draws the
// field (same box as Input) and the input inside it draws nothing.
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "relative flex h-10 w-full min-w-0 items-center rounded-control border border-input transition-colors duration-state has-disabled:opacity-50 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-3 has-[[aria-invalid=true]]:ring-destructive/20 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

// Text or an icon before or after the input; a click on it focuses the input.
function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & { align?: "inline-start" | "inline-end" }) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex h-full shrink-0 cursor-text items-center gap-2 text-muted-foreground select-none data-[align=inline-end]:order-last data-[align=inline-end]:pr-1 data-[align=inline-start]:order-first data-[align=inline-start]:pl-3 [&>svg]:size-4",
        className
      )}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("button")) return
        event.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

// A 32px round icon button 4px inside the 40px group, so it never needs a
// radius of its own on the concentric scale.
function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size">) {
  return (
    <Button
      type={type}
      variant={variant}
      size="icon"
      className={cn("size-8 rounded-full", className)}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "h-full flex-1 rounded-none border-0 bg-transparent focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput }
