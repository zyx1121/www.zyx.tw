import { cn } from "@workspace/ui/lib/utils"

import { enter, enterRow } from "@/lib/layout"

/** The page title at hero size. Pages without an animated title use this. */
export function HeroTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl text-pretty">{children}</h1>
}

/**
 * Title and an optional muted subtitle, 12 px apart, entering as rows 1 and
 * 2. The page decides what follows and how far away; its first block is
 * row 3.
 */
export function Hero({
  title,
  subtitle,
  aside,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Beside the title and subtitle, on the column's right edge. */
  aside?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-5", className)}>
      <div>
        <div className={enter} style={enterRow(1)}>
          {title}
        </div>
        {subtitle && (
          <p
            className={cn("mt-3 text-muted-foreground", enter)}
            style={enterRow(2)}
          >
            {subtitle}
          </p>
        )}
      </div>
      {aside && (
        <div className={enter} style={enterRow(1)}>
          {aside}
        </div>
      )}
    </div>
  )
}
