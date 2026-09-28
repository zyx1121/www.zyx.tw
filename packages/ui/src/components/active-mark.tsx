"use client"

import * as m from "motion/react-m"

import { cn } from "@workspace/ui/lib/utils"

// Settles in about 300 ms with a small overshoot.
const SPRING = { type: "spring", stiffness: 550, damping: 32 } as const

/**
 * A 4 px dot marking the current item of a nav. When it unmounts under one
 * item and mounts under another with the same `layoutId`, it springs across
 * instead of jumping. Needs MotionProvider (domMax has the layout feature);
 * its reducedMotion="user" makes the move instant for visitors who ask.
 */
export function ActiveMark({
  layoutId,
  className,
}: {
  layoutId: string
  className?: string
}) {
  return (
    <m.span
      layoutId={layoutId}
      transition={SPRING}
      aria-hidden
      className={cn("block size-1 rounded-full bg-foreground", className)}
    />
  )
}
