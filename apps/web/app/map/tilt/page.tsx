import { cn } from "@workspace/ui/lib/utils"
import { column, enterRow, page } from "@workspace/ui/lib/layout"

import { Hero, HeroTitle } from "@/components/hero"
import { StarCharts } from "@/components/star-chart"
import { MAP } from "@/lib/copy"
import { galaxyChart } from "@/lib/map"
import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({ title: MAP.title, path: "/map/tilt" })

export const dynamic = "force-static"

export default function MapTilted() {
  return (
    <main className={cn(column, page, "flex flex-1 flex-col")}>
      <Hero title={<HeroTitle text={MAP.title} />} />
      <StarCharts
        label="Systems"
        className={cn("mt-10", enterRow(2))}
        narrow={galaxyChart({ cols: 32, rows: 24, tilt: true })}
        wide={galaxyChart({ cols: 75, rows: 22, tilt: true })}
        widest={galaxyChart({ cols: 102, rows: 26, tilt: true })}
      />
    </main>
  )
}
