import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

// Two kinds of chat text: muted is the person's message in a filled bubble,
// ghost is the assistant's reply set as plain page text at full width.
const bubbleVariants = cva(
  "w-fit min-w-0 wrap-break-word group-data-[align=end]/message:self-end",
  {
    variants: {
      variant: {
        muted: "max-w-4/5 rounded-control bg-muted px-4 py-2",
        ghost: "w-full",
      },
    },
    defaultVariants: {
      variant: "muted",
    },
  }
)

function Bubble({
  className,
  variant = "muted",
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof bubbleVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      { className: cn(bubbleVariants({ variant }), className) },
      props
    ),
    render,
    state: {
      slot: "bubble",
      variant,
    },
  })
}

export { Bubble, bubbleVariants }
