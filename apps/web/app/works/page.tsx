import { T } from "@workspace/ui/components/locale-provider"
import { localizedMetadata } from "@workspace/ui/lib/i18n-server"
import { MESSAGES } from "@/lib/messages"
import { cn } from "@workspace/ui/lib/utils"

import { Hero, HeroTitle } from "@/components/hero"
import { ProjectsJsonLd } from "@/components/json-ld"
import { PreviewStage } from "@/components/preview-stage"
import { ProjectList } from "@/components/project-list"
import { Showcase } from "@/components/showcase"
import { WORKS } from "@/lib/copy"
import { column, page } from "@/lib/layout"
import { projects } from "@/lib/projects"
import { pageMetadata } from "@/lib/site"

const baseMetadata = pageMetadata({ title: WORKS.title, path: "/works" })

export default function Works() {
  return (
    // The stage takes the space between the title and the list, so the list
    // sits at the bottom of the viewport, but it never gets shorter than 45%
    // of the column (45cqw of this container) or 200 px: past that, the page
    // scrolls.
    <main className={cn(column, page, "@container flex flex-1 flex-col")}>
      <ProjectsJsonLd projects={projects} />
      <Showcase projects={projects}>
        <Hero
          title={
            <HeroTitle>
              <T>{WORKS.title}</T>
            </HeroTitle>
          }
        />
        {/* No entrance fade: the first dither can be the page's largest
            paint, and Chrome skipped it as LCP while it faded in. */}
        <PreviewStage className="mt-10 mb-5 min-h-[max(12.5rem,45cqw)] flex-1" />
        <ProjectList />
      </Showcase>
    </main>
  )
}

export async function generateMetadata() {
  return localizedMetadata(baseMetadata, MESSAGES, "/works")
}
