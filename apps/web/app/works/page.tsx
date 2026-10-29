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
    // The picture keeps the capture's aspect ratio at every viewport size.
    <main className={cn(column, page, "flex flex-1 flex-col")}>
      <ProjectsJsonLd projects={projects} />
      <Showcase projects={projects}>
        <Hero title={<HeroTitle text={WORKS.title} />} />
        {/* Below lg the window sits above the list; from lg the list is the
            left column and the window takes the remaining width. */}
        <div className="mt-10 flex flex-1 flex-col gap-5 lg:flex-row lg:gap-10">
          <ProjectWindow
            className={cn(
              "w-full self-start lg:order-last lg:flex-1",
              enterRow(2)
            )}
          />
          <ProjectList className="lg:w-52 lg:shrink-0" />
        </div>
      </Showcase>
    </main>
  )
}
