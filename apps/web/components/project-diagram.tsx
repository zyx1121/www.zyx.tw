import { cn } from "@workspace/ui/lib/utils"

import type { Diagram } from "@/lib/projects"

function Lines({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <div aria-hidden className={cn("diagram", className)}>
      {lines.map((line, index) => (
        // An empty line still takes its row.
        <span key={index} className="block">
          {line || " "}
        </span>
      ))}
    </div>
  )
}

/**
 * A drawing in box-drawing characters (app/globals.css, `diagram`): real
 * text in the page's own face, so it is exactly as legible as the paragraphs
 * beside it and decodes in with them. Phones get the narrow drawing.
 */
export function ProjectDiagram({
  diagram,
  className,
}: {
  diagram: Diagram
  className?: string
}) {
  return (
    <div
      role="img"
      aria-label={diagram.alt}
      className={cn("overflow-x-auto text-muted-foreground", className)}
    >
      <Lines lines={diagram.wide} className="max-sm:hidden" />
      <Lines lines={diagram.narrow} className="sm:hidden" />
    </div>
  )
}
