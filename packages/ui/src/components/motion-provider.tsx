"use client"

import { LazyMotion, MotionConfig, domMax } from "motion/react"

/**
 * Every animated component rendered under this provider uses `m.*` from "motion/react-m",
 * which only ships the animation features LazyMotion loads instead of the full
 * `motion` bundle. domMax adds layout animations (the site header's layoutId
 * mark) to domAnimation. `strict` turns a stray `motion.*` import back into a
 * runtime error instead of a silently heavier page. reducedMotion="user"
 * turns transform and layout animations off for visitors who ask for less
 * motion.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
