import { cn } from "../lib/utils"

/**
 * A section's heading in brackets and capitals, as the corner nav marks the
 * current page. The brackets are decoration; screen readers hear the title.
 */
export function SectionTitle({
  id,
  title,
  className,
}: {
  id?: string
  title: string
  className?: string
}) {
  return (
    <h2
      id={id}
      data-slot="section-title"
      className={cn("text-body font-medium uppercase", className)}
    >
      <span aria-hidden="true">[</span>
      {title}
      <span aria-hidden="true">]</span>
    </h2>
  )
}
