"use client"

import { LazyMotion, domAnimation } from "motion/react"

/**
 * Every animated component rendered under this provider uses `m.*` from "motion/react-m",
 * which only ships the animation features LazyMotion loads (domAnimation)
 * instead of the full `motion` bundle. `strict` turns a stray `motion.*`
 * import back into a runtime error instead of a silently heavier page.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
