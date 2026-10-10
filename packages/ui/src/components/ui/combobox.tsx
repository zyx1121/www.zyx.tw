"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "../../lib/utils"
import { fieldTriggerClassName } from "./field-trigger"
import { PopoverContent, PopoverTrigger } from "./popover"

// Pieces for a searchable picker: wrap them in Popover and put a Command in
// the content. Single or multiple choice is up to the Command inside.
function ComboboxTrigger({
  className,
  children,
  placeholder,
  ...props
}: React.ComponentProps<typeof PopoverTrigger> & {
  placeholder?: React.ReactNode
}) {
  const empty =
    children === undefined ||
    children === null ||
    children === false ||
    children === ""
  return (
    <PopoverTrigger
      data-slot="combobox-trigger"
      data-placeholder={empty ? "" : undefined}
      className={cn(fieldTriggerClassName, className)}
      {...props}
    >
      <span className="flex-1 truncate text-left">
        {empty ? placeholder : children}
      </span>
      <ChevronDownIcon className="text-muted-foreground" />
    </PopoverTrigger>
  )
}

// At least as wide as the trigger and as wide as a popover, so a short
// trigger never squeezes its menu and truncates the options.
function ComboboxContent({
  className,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      data-slot="combobox-content"
      className={cn("min-w-(--anchor-width)", className)}
      {...props}
    />
  )
}

export { ComboboxContent, ComboboxTrigger }
