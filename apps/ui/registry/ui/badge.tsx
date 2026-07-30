import * as React from "react";

import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "destructive";
type Size = "sm" | "default" | "lg";

const variants: Record<Variant, string> = {
  default: "bg-foreground text-background",
  secondary: "bg-block text-foreground/80",
  outline: "border border-foreground/20 text-foreground",
  destructive: "bg-destructive text-white",
};

const sizes: Record<Size, string> = {
  sm: "px-2 py-0.5 text-xs",
  default: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
}

export function Badge({
  className,
  variant = "default",
  size = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
