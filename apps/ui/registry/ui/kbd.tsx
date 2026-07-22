import * as React from "react";

import { cn } from "@/lib/utils";

export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-block px-1.5 font-mono text-[11px] font-medium text-foreground/70 select-none",
        className
      )}
      {...props}
    />
  );
}
