"use client"

import { FlutedGlass } from "@paper-design/shaders-react"
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
      <div className="dark:filter-[brightness(0)_invert(1)]">
        <FlutedGlass
          width="90dvw"
          height="90dvh"
          image="/zyx.svg"
          colorBack="#00000000"
          colorShadow="#000000"
          colorHighlight="#ffffff"
          size={0.5}
          shadows={0.25}
          highlights={0.1}
          shape="lines"
          angle={0}
          distortionShape="prism"
          distortion={0.5}
          shift={0}
          stretch={0}
          blur={0}
          edges={0.25}
          margin={0.1}
          grainMixer={0}
          grainOverlay={0}
          fit="cover"
        />
      </div>
    </motion.div>
  )
}
