"use client"

import { cn } from "@workspace/ui/lib/utils"
import { enterRow } from "@workspace/ui/lib/layout"

import { useShowcase } from "@/components/showcase"

/**
 * One row per project. A ">" marks the project in the window, as a cursor in
 * a terminal menu. Below lg the window sits above the list and each row adds
 * its purpose in muted text on the right, wrapping below the name when both
 * do not fit; phones show the names alone. From lg the list is the left
 * column beside the window, whose title bar carries the purpose, so the rows
 * are names alone there too; the purpose stays for screen readers. Hovering a
 * row or focusing its link from the keyboard puts that project in the window.
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
              enterRow(2 + index)
            )}
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
            <span
              aria-hidden
              className="invisible absolute -left-4 group-data-active:visible"
            >
              &gt;
            </span>
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-control decoration-muted-foreground underline-offset-4 outline-offset-4 transition-colors after:absolute after:inset-0 hover:underline focus-visible:outline-2 max-sm:text-muted-foreground max-sm:group-data-active:text-foreground max-sm:after:-inset-y-1.5"
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) engage(index)
              }}
              onBlur={() => release(index)}
            >
              {project.name}
            </a>
            <span className="text-muted-foreground transition-colors group-data-active:text-foreground max-sm:sr-only lg:sr-only">
              {project.purpose}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
