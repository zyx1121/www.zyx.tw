import * as React from "react"

import { cn } from "../../lib/utils"

type AttachmentState = "idle" | "uploading" | "error" | "done"

// A file chip: a 40px media square 4px inside the chip, so the chip takes
// rounded-menu around the media's rounded-control. Idle (picked, not sent)
// has a dashed border; uploading shimmers the name.
function Attachment({
  className,
  state = "done",
  ...props
}: React.ComponentProps<"div"> & { state?: AttachmentState }) {
  return (
    <div
      data-slot="attachment"
      data-state={state}
      className={cn(
        "group/attachment flex w-fit max-w-full min-w-48 items-center gap-3 rounded-menu border border-border p-1 pr-4 text-body data-[state=error]:border-destructive data-[state=idle]:border-dashed",
        className
      )}
      {...props}
    />
  )
}

function AttachmentMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-media"
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-control bg-muted group-data-[state=error]/attachment:text-destructive [&_svg]:size-4 [&>img]:size-full [&>img]:object-cover",
        className
      )}
      {...props}
    />
  )
}

function AttachmentContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-content"
      className={cn("flex min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  )
}

function AttachmentTitle({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="attachment-title"
      className={cn(
        "truncate font-medium group-data-[state=uploading]/attachment:shimmer",
        className
      )}
      {...props}
    />
  )
}

function AttachmentDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="attachment-description"
      className={cn(
        "truncate text-muted-foreground group-data-[state=error]/attachment:text-destructive",
        className
      )}
      {...props}
    />
  )
}

export {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
}
