"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors",
        "bg-foreground/15 data-checked:bg-foreground",
        "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="size-4 rounded-full bg-background shadow-sm motion-safe:transition-transform data-checked:translate-x-4"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
