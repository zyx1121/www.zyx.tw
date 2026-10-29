"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { fieldFrameClassName } from "./field-trigger"
import { FrameEdges } from "./frame"
import { Input } from "./input"

// An input with text or a button inside its border: the group draws the
// field (same box as Input) and the input inside it draws nothing.
function InputGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/field relative flex h-10 w-full min-w-0 items-center has-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <FrameEdges className={fieldFrameClassName} />
    </div>
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

// A 32px icon button 4px inside the 40px group.
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
      className={cn("size-8", className)}
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
      bare
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
