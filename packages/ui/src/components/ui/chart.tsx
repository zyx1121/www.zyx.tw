"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "../../lib/utils"

// Charts use the theme's own colors, not chart tokens (DESIGN.md, Color):
// the main series is primary, a comparison muted-foreground and a series
// with a meaning destructive. More than two series to tell apart by color
// means small multiples or a table instead.
const SERIES_COLORS = {
  primary: "var(--primary)",
  muted: "var(--muted-foreground)",
  destructive: "var(--destructive)",
} as const

export type ChartConfig = Record<
  string,
  { label: React.ReactNode; color: keyof typeof SERIES_COLORS }
>

const ChartContext = React.createContext<ChartConfig | null>(null)

function useChartConfig() {
  const config = React.useContext(ChartContext)
  if (!config)
    throw new Error("useChartConfig must be used in <ChartContainer>")
  return config
}

// Series colors reach Recharts as --color-<key>, so a Bar takes
// fill="var(--color-count)". Axis text is caption size in muted-foreground;
// grid lines are the border color.
function ChartContainer({
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const id = `chart-${React.useId().replace(/:/g, "")}`
  const colors = Object.entries(config)
    .map(([key, { color }]) => `--color-${key}: ${SERIES_COLORS[color]};`)
    .join(" ")

  return (
    <ChartContext.Provider value={config}>
      <div
        data-slot="chart"
        data-chart={id}
        className={cn(
          "flex aspect-video justify-center text-caption [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-layer]:outline-none [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-surface]:outline-none [&_.recharts-text]:text-caption",
          className
        )}
        {...props}
      >
        <style>{`[data-chart=${id}] { ${colors} }`}</style>
        {/* A first size for the server render, so Recharts does not warn
            before it measures the container. */}
        <RechartsPrimitive.ResponsiveContainer
          initialDimension={{ width: 320, height: 200 }}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type TooltipEntry = {
  dataKey?: string | number
  name?: string | number
  value?: unknown
}

// A series' dot in its config color.
function Swatch({ color }: { color?: keyof typeof SERIES_COLORS }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-2 shrink-0 rounded-full",
        color === "muted"
          ? "bg-muted-foreground"
          : color === "destructive"
            ? "bg-destructive"
            : "bg-primary"
      )}
    />
  )
}

// The tooltip of a data point: a frosted layer-2 surface listing each series
// with its color swatch.
function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: readonly TooltipEntry[]
  label?: React.ReactNode
}) {
  const config = useChartConfig()
  if (!active || !payload?.length) return null

  return (
    <div className="flex min-w-32 flex-col gap-1 rounded-control border border-border bg-transparent px-3 py-2 text-body shadow-lg backdrop-blur-md">
      {label !== undefined && <div className="font-medium">{label}</div>}
      {payload.map((entry) => {
        const key = String(entry.dataKey ?? entry.name)
        return (
          <div key={key} className="flex items-center gap-2">
            <Swatch color={config[key]?.color} />
            <span className="text-muted-foreground">
              {config[key]?.label ?? key}
            </span>
            <span className="ml-auto font-medium tabular-nums">
              {String(entry.value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

// Series names under the chart, each beside its swatch, so color is never
// the only label. Listed in the config's order, whatever order Recharts
// passes them in.
function ChartLegendContent({
  payload,
  className,
}: {
  payload?: readonly { dataKey?: string | number; value?: string }[]
  className?: string
}) {
  const config = useChartConfig()
  if (!payload?.length) return null
  const order = Object.keys(config)
  const keys = payload
    .map((entry) => String(entry.dataKey ?? entry.value ?? ""))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))

  return (
    <div
      data-slot="chart-legend"
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 pt-4 text-caption text-muted-foreground",
        className
      )}
    >
      {keys.map((key) => (
        <span key={key} className="flex items-center gap-2">
          <Swatch color={config[key]?.color} />
          {config[key]?.label ?? key}
        </span>
      ))}
    </div>
  )
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
}
