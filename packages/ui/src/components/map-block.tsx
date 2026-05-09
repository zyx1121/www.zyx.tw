"use client"

import { motion } from "motion/react"

import { MapboxMap } from "@workspace/ui/components/mapbox-map"
import { useInView } from "@workspace/ui/hooks/use-in-view"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

type MapBlockProps = {
  accessToken: string
}

export function MapBlock({ accessToken }: MapBlockProps) {
  const { ref, inView } = useInView()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      aria-label="Map"
      className="flex h-dvh w-dvw flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={spring}
        className="text-2xl font-medium sm:text-3xl"
      >
        Places I&apos;ve shot.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ ...spring, delay: 0.1 }}
        className="max-w-md text-sm text-muted-foreground"
      >
        Snapshots from places I&apos;ve wandered. Tap a pin to peek.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ ...spring, delay: 0.2 }}
        className="h-[55dvh] w-full max-w-3xl overflow-hidden rounded-3xl border border-border"
      >
        <MapboxMap accessToken={accessToken} />
      </motion.div>
    </section>
  )
}
