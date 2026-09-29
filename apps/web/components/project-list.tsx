"use client"

import { cn } from "@workspace/ui/lib/utils"

import { useShowcase } from "@/components/showcase"
import { enter, enterRow } from "@/lib/layout"

/**
 * One row per project: the name on the left and its purpose in muted text on
 * the right, sharing the nav's right edge. When both do not fit on one line,
 * the purpose wraps below the name, left-aligned; the name never truncates.
 * The project on the stage marks its row by turning the purpose foreground.
 * Phones show the names alone, muted, and the name on the stage turns
 * foreground instead; the purpose stays for screen readers. Hovering a row
 * or focusing its link from the keyboard puts that project on the stage.
 */
export function ProjectList({ className }: { className?: string }) {
  const { projects, active, engage, release } = useShowcase()

  return (
    <section aria-labelledby="projects-heading" className={className}>
      <h2 id="projects-heading" className="sr-only">
        Projects
      </h2>
      <ul className="flex flex-col gap-y-3">
        {projects.map((project, index) => (
          <li
            key={project.slug}
            data-active={index === active ? "" : undefined}
            // A lone item on a wrapped line starts at the left edge, so
            // space-between is what moves the purpose between the two places.
            className={cn(
              "group relative flex flex-wrap justify-between gap-x-5",
              enter
            )}
            style={enterRow(2 + index)}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") engage(index)
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") release(index)
            }}
          >
            {/* The link stretches over the whole row, and on phones over
                half the gap on each side, so a tap between rows still lands
                on one (36 px per row instead of 24). */}
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm decoration-muted-foreground underline-offset-4 outline-offset-4 transition-colors after:absolute after:inset-0 hover:underline focus-visible:outline-2 max-sm:text-muted-foreground max-sm:group-data-active:text-foreground max-sm:after:-inset-y-1.5"
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) engage(index)
              }}
              onBlur={() => release(index)}
            >
              {project.name}
            </a>
            <span className="text-muted-foreground transition-colors group-data-active:text-foreground max-sm:sr-only">
              {project.purpose}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
