import * as React from "react";

import { cn } from "@/lib/utils";

type Size = "sm" | "default" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-8 px-2.5 py-1 text-xs",
  default: "h-9 px-3 py-1 text-sm",
  lg: "h-10 px-4 py-2 text-base",
};

// The native `size` attribute (a character count) is shadowed on purpose so the
// prop means the same thing here as it does on Button / Badge / Textarea.
export interface InputProps extends Omit<
  React.ComponentProps<"input">,
  "size"
> {
  size?: Size;
}

export function Input({
  className,
  type,
  size = "default",
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        "flex w-full min-w-0 rounded-md border border-input bg-transparent corner-token",
        "selection:bg-foreground selection:text-background placeholder:text-foreground/50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "motion-safe:transition-[color,box-shadow]",
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
