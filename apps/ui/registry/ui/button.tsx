import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "raw";
type Size = "sm" | "default" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default: "bg-foreground text-background hover:bg-foreground/90",
  secondary: "bg-block text-foreground hover:bg-foreground/10",
  outline: "border border-foreground/20 hover:bg-foreground/5",
  ghost: "hover:bg-foreground/5",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  link: "h-auto px-0 py-0 text-foreground underline-offset-4 hover:underline",
  raw: "h-auto bg-transparent px-0 py-0 text-foreground/60 hover:bg-transparent hover:text-foreground",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  default: "h-9 px-4 text-sm",
  lg: "h-10 px-6 text-base",
  icon: "size-9 px-0",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        sizes[size],
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" />
      ) : null}
      <span className={loading ? "opacity-70" : undefined}>{children}</span>
    </button>
  );
}
