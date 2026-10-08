import * as React from "react"

import { cn } from "../../lib/utils"

// A chat transcript: messages stack with 16px between them; an end-aligned
// message (the user's) sits on the right.
function MessageGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-group"
      className={cn("flex min-w-0 flex-col gap-4", className)}
      {...props}
    />
  )
}

function Message({
  className,
  align = "start",
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(
        "group/message flex w-full min-w-0 flex-col gap-2 text-body data-[align=end]:items-end",
        className
      )}
      {...props}
    />
  )
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 wrap-break-word group-data-[align=end]/message:items-end",
        className
      )}
      {...props}
    />
  )
}

// Who and when, under the content: secondary text, no smaller size.
function MessageFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-footer"
      className={cn(
        "flex min-w-0 items-center gap-2 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Message, MessageContent, MessageFooter, MessageGroup }
