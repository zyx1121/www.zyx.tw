import { cn } from "../../lib/utils"

// Reveals its content with a feathered mask sweeping left to right over
// 600ms (`animate-mask-reveal` in globals.css). The delay comes from an
// enter-row utility on the same element, so a revealed image keeps time with
// the row fades around it.
//
// The mask exists only inside the `mask-reveal` keyframes, played with a
// `backwards` fill: it covers the content during the delay and the sweep,
// then disappears, so focus rings, shadows and anything else outside the
// border box render untouched afterwards.
//
// Feather profile: a mask three times as wide as the element slides from
// position 100% to 0%. Its alpha is 1 - smoothstep over the middle third,
// alpha(x) = 1 - (3t^2 - 2t^3) with t = clamp((x - 1/3) / (1/3), 0, 1),
// sampled at t = 0, 1/6, ... 1 (x = 33.333% ... 66.667%). The middle third is
// the widest band that is fully clear at 100% and fully opaque at 0%, so the
// start is empty and the end needs no jump when the mask goes away.
// Reduced motion plays nothing, so the content shows at once with no mask.
function MaskReveal({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="mask-reveal"
      className={cn("w-fit motion-safe:animate-mask-reveal", className)}
      {...props}
    />
  )
}

export { MaskReveal }
