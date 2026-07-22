"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>
) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectValue(props: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-9 w-fit min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm whitespace-nowrap select-none corner-token",
        "data-placeholder:text-foreground/50",
        "outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/40",
        "motion-safe:transition-[color,box-shadow]",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown aria-hidden className="size-4 text-foreground/50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  sideOffset = 6,
  ...props
}: SelectPrimitive.Popup.Props & {
  sideOffset?: SelectPrimitive.Positioner.Props["sideOffset"];
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        sideOffset={sideOffset}
        className="z-50 select-none"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "min-w-[var(--anchor-width)] origin-[var(--transform-origin)] rounded-md bg-background text-foreground shadow-md",
            "motion-safe:transition-[opacity,transform] motion-safe:duration-150 motion-safe:ease-out",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className
          )}
          {...props}
        >
          <SelectPrimitive.List className="max-h-[var(--available-height)] scroll-py-1 overflow-y-auto p-1">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm py-1.5 pr-3 pl-2 text-sm outline-none select-none",
        "data-highlighted:bg-foreground/5",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="col-start-1">
        <Check aria-hidden className="size-4" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className="col-start-2">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectGroup(props: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-foreground/60", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
};
