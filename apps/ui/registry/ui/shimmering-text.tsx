import { cn } from "@/lib/utils";

interface ShimmeringTextProps extends React.ComponentProps<"span"> {
  /** Animation duration in seconds. */
  duration?: number;
  /** Shimmer spread in px per character. */
  spread?: number;
}

function ShimmeringText({
  className,
  duration = 2,
  spread = 2,
  children,
  style,
  ...props
}: ShimmeringTextProps) {
  const length = typeof children === "string" ? children.length : 12;

  return (
    <span
      data-slot="shimmering-text"
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        "bg-[length:250%_100%,auto] [background-repeat:no-repeat,padding-box]",
        "[--base-color:var(--muted-foreground)] [--shimmer-color:var(--foreground)]",
        "[--shimmer-bg:linear-gradient(90deg,transparent_calc(50%-var(--spread)),var(--shimmer-color),transparent_calc(50%+var(--spread)))]",
        "motion-safe:animate-[shimmering-text_var(--duration)_linear_infinite]",
        className
      )}
      style={
        {
          "--spread": `${length * spread}px`,
          "--duration": `${duration}s`,
          backgroundImage:
            "var(--shimmer-bg), linear-gradient(var(--base-color), var(--base-color))",
          backgroundPosition: "100% center",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </span>
  );
}

export { ShimmeringText };
