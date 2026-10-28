import { cn } from "@workspace/ui/lib/utils"
import { enterRow } from "@workspace/ui/lib/layout"

/**
 * The page title at hero size. It decodes in with the rest of the page
 * (page-decode.tsx).
 */
export function HeroTitle({ text }: { text: string }) {
  return <h1 className="text-title font-medium text-pretty">{text}</h1>
}

/**
 * Title and an optional muted subtitle, 12 px apart, entering as rows 1 and
 * 2. The page decides what follows and how far away; its first block is
 * row 3.
 */
export function Hero({
  title,
  subtitle,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <div className={enterRow(1)}>{title}</div>
      {subtitle && (
        <p className={cn("mt-3 text-muted-foreground", enterRow(2))}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
