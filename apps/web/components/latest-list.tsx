import { RelativeTime } from "@/components/relative-time"
import { LATEST } from "@/lib/copy"
import type { Change } from "@/lib/latest"

/**
 * About's Latest list: one row per shipped change, the subject on the left
 * and its site and age in muted text on the right, on the column's right
 * edge. When both do not fit on one line (phones), the site and age wrap
 * below the subject, left-aligned. Each row links to the site the change
 * shipped to.
 */
export function LatestList({
  changes,
  renderedAt,
  className,
  style,
}: {
  changes: Change[]
  renderedAt: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <section
      aria-labelledby="latest-heading"
      className={className}
      style={style}
    >
      <h2 id="latest-heading" className="text-2xl">
        {LATEST.title}
      </h2>
      <ul className="mt-5 flex flex-col gap-y-3">
        {changes.map((change) => (
          <li
            key={change.sha}
            className="group relative flex flex-wrap justify-between gap-x-5"
          >
            {/* The link stretches over the whole row. */}
            <a
              href={change.site.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm decoration-muted-foreground underline-offset-4 outline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-2"
            >
              {change.subject}
            </a>
            <span className="flex gap-x-5 text-muted-foreground">
              <span>{change.site.name}</span>
              <RelativeTime date={change.date} renderedAt={renderedAt} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
