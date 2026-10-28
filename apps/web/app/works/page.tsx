import { cn } from "@workspace/ui/lib/utils"
import { column, enterRow, page } from "@workspace/ui/lib/layout"

import { Hero, HeroTitle } from "@/components/hero"
import { ProjectsJsonLd } from "@/components/json-ld"
import { ProjectList } from "@/components/project-list"
import { ProjectWindow } from "@/components/project-window"
import { Showcase } from "@/components/showcase"
import { WORKS } from "@/lib/copy"
import { projects } from "@/lib/projects"
import { pageMetadata } from "@/lib/site"

export const metadata = pageMetadata({ title: WORKS.title, path: "/works" })

export const dynamic = "force-static"

export default function Works() {
  return (
    // The window takes the space the title and the list leave, but never
    // less than its min-height: past that, the page scrolls.
    <main className={cn(column, page, "flex flex-1 flex-col")}>
      <ProjectsJsonLd projects={projects} />
      <Showcase projects={projects}>
        <Hero title={<HeroTitle text={WORKS.title} />} />
        {/* Below lg the window sits above the list and takes the height
            between the title and the list; from lg the list is the left
            column and the window fills the rest. */}
        <div className="mt-10 flex flex-1 flex-col gap-5 lg:flex-row lg:gap-10">
          <ProjectWindow
            className={cn(
              "min-h-60 flex-1 lg:order-last lg:min-h-82 2xl:min-h-110",
              enterRow(2)
            )}
          />
          <ProjectList className="lg:w-52 lg:shrink-0" />
        </div>
      </Showcase>
    </main>
  )
}
