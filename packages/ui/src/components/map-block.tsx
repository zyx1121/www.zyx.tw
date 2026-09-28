"use client"

import dynamic from "next/dynamic"

import { useInView } from "@workspace/ui/hooks/use-in-view"
import { cn } from "@workspace/ui/lib/utils"

// mapbox-gl is ~540KB gzipped — load it only once the map is about to
// scroll into view instead of shipping it in the initial page bundle.
const MapboxMap = dynamic(
  () =>
    import("@workspace/ui/components/mapbox-map").then((mod) => mod.MapboxMap),
  { ssr: false, loading: () => <div className="size-full" /> }
)

type MapBlockProps = {
  accessToken: string
  className?: string
  style?: React.CSSProperties
}

/** The photo map: a pin per photo in public/map, a tap opens it full screen. */
export function MapBlock({ accessToken, className, style }: MapBlockProps) {
  // rootMargin preloads the chunk ~200px before the section enters the
  // viewport so the map is ready by the time it's actually visible.
  const { ref, inView } = useInView(0.2, "200px")

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      aria-label="Map"
      className={cn(
        "h-[55dvh] min-h-80 overflow-hidden rounded-lg ring-1 ring-foreground/10",
        className
      )}
      style={style}
    >
      {inView ? (
        <MapboxMap accessToken={accessToken} />
      ) : (
        <div className="size-full" />
      )}
    </section>
  )
}
