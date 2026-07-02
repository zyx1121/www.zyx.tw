"use client"

import { motion } from "motion/react"
import dynamic from "next/dynamic"

import { useInView } from "@workspace/ui/hooks/use-in-view"

const spring = { type: "spring" as const, stiffness: 200, damping: 20 }

// mapbox-gl is ~540KB gzipped — load it only once the map is about to
// scroll into view instead of shipping it in the initial page bundle.
const MapboxMap = dynamic(
  () =>
    import("@workspace/ui/components/mapbox-map").then((mod) => mod.MapboxMap),
  { ssr: false, loading: () => <div className="h-full min-h-0 w-full" /> }
)

type MapBlockProps = {
  accessToken: string
}

export function MapBlock({ accessToken }: MapBlockProps) {
  // rootMargin preloads the chunk ~200px before the section enters the
  // viewport so the map is ready by the time it's actually visible.
  const { ref, inView } = useInView(0.2, "200px")

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
        {inView ? (
          <MapboxMap accessToken={accessToken} />
        ) : (
          <div className="h-full min-h-0 w-full" />
        )}
      </motion.div>
    </section>
  )
}
