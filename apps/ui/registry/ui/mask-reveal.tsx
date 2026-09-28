import { cn } from "@/lib/utils";

interface MaskRevealProps extends React.ComponentProps<"div"> {
  /** Milliseconds before the sweep starts. The content stays hidden until then. */
  delay?: number;
  /** Milliseconds the sweep takes. */
  duration?: number;
  /** Any CSS easing function. */
  easing?: string;
}

// The mask exists only inside the `mask-reveal` keyframes (see the item's
// `css`), played with a `backwards` fill: it covers the content during the
// delay and the sweep, then disappears, so focus rings, shadows and anything
// else outside the border box render untouched afterwards.
//
// Feather profile: a mask three times as wide as the element slides from
// position 100% to 0%. Its alpha is 1 - smoothstep over the middle third,
// alpha(x) = 1 - (3t^2 - 2t^3) with t = clamp((x - 1/3) / (1/3), 0, 1),
// sampled at t = 0, 1/6, ... 1 (x = 33.333% ... 66.667%). The middle third is
// the widest band that is fully clear at 100% and fully opaque at 0%, so the
// start is empty and the end needs no jump when the mask goes away.
// Reduced motion plays nothing, so the content shows at once with no mask.
function MaskReveal({
  delay = 1000,
  duration = 5000,
  easing = "cubic-bezier(.16,1,.3,1)",
  className,
  style,
  ...props
}: MaskRevealProps) {
  return (
    <div
      data-slot="mask-reveal"
      className={cn(
        "w-fit motion-safe:animate-[mask-reveal_var(--mask-reveal-duration)_var(--mask-reveal-easing)_var(--mask-reveal-delay)_backwards]",
        className
      )}
      style={
        {
          "--mask-reveal-delay": `${delay}ms`,
          "--mask-reveal-duration": `${duration}ms`,
          "--mask-reveal-easing": easing,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { MaskReveal };
