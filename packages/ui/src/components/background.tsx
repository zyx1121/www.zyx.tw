"use client"

import { motion, useScroll, useTransform } from "motion/react"

export function Background() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, (y) => {
    if (typeof window === "undefined") return 1
    return Math.max(0.1, 1 - y / window.innerHeight)
  })
  const blur = useTransform(scrollY, (y) => {
    if (typeof window === "undefined") return "blur(0px)"
    const t = Math.min(1, y / window.innerHeight)
    return `blur(${t * 16}px)`
  })

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-10 flex h-dvh w-dvw items-center justify-center"
      style={{ opacity, filter: blur, willChange: "opacity, filter" }}
    >
      <img
        src="/zyx.svg"
        alt=""
        className="h-full w-full object-cover dark:invert"
      />
    </motion.div>
  )
}
