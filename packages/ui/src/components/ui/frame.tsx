import * as React from "react"

import { cn } from "../../lib/utils"

// The outline of a window or a control, drawn with box-drawing characters
// (globals.css, Glyph frames). It overhangs its parent by half a cell, so the
// parent is positioned, does not clip, and sets the color with text-*.
// label sits on the top edge, detail on the bottom edge at the right.
function FrameEdges({
  className,
  label,
  detail,
  ...props
}: React.ComponentProps<"span"> & {
  label?: React.ReactNode
  detail?: React.ReactNode
}) {
  return (
    <span
      data-slot="frame-edges"
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      <span data-edge="top-left" aria-hidden />
      <span>
        {label && (
          <>
            <span data-edge="lead" aria-hidden />
            <span data-frame-text>{label}</span>
          </>
        )}
        <span data-edge="fill" aria-hidden />
      </span>
      <span data-edge="top-right" aria-hidden />
      <span data-edge="side" aria-hidden />
      <span />
      <span data-edge="side" aria-hidden />
      <span data-edge="bottom-left" aria-hidden />
      <span>
        <span data-edge="fill" aria-hidden />
        {detail && (
          <>
            <span data-frame-text>{detail}</span>
            <span data-edge="lead" aria-hidden />
          </>
        )}
      </span>
      <span data-edge="bottom-right" aria-hidden />
    </span>
  )
}

// One vertical edge, for a surface whose other edges are the viewport's.
function FrameSide({
  className,
  side,
  ...props
}: React.ComponentProps<"span"> & { side: "left" | "right" }) {
  return (
    <span
      data-slot="frame-side"
      data-side={side}
      aria-hidden
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

// A framed panel with a label on its edge, as a terminal dashboard draws one.
function Frame({
  className,
  label,
  detail,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  label?: React.ReactNode
  detail?: React.ReactNode
}) {
  return (
    <div
      data-slot="frame"
      className={cn("relative px-4 py-4", className)}
      {...props}
    >
      {children}
      <FrameEdges label={label} detail={detail} />
    </div>
  )
}

// The frame of a popup whose box scrolls: it sits in the positioner, beside
// the popup, and fades with it.
function WindowEdges() {
  return (
    <FrameEdges className="transition-opacity duration-overlay group-data-closed/window:opacity-0 starting:opacity-0" />
  )
}

export { Frame, FrameEdges, FrameSide, WindowEdges }
