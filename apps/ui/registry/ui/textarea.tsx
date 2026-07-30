import * as React from "react";

import { cn } from "@/lib/utils";

type Size = "sm" | "default" | "lg";

const sizes: Record<Size, string> = {
  sm: "min-h-14 px-2.5 py-1.5 text-xs",
  default: "min-h-16 px-3 py-2 text-sm",
  lg: "min-h-20 px-4 py-2.5 text-base",
};

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  size?: Size;
}

export function Textarea({
  className,
  size = "default",
  ...props
}: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      data-size={size}
      className={cn(
        "flex field-sizing-content w-full rounded-md border border-input bg-transparent corner-token",
        "placeholder:text-foreground/50",
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
