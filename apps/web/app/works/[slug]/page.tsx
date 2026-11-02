import { notFound } from "next/navigation"

import { SectionTitle } from "@workspace/ui/components/section-title"
import { cn } from "@workspace/ui/lib/utils"
import { column, enterRow, page } from "@workspace/ui/lib/layout"

import { Hero, HeroTitle } from "@/components/hero"
import { findProject, projectPath, projects } from "@/lib/projects"
import { pageMetadata } from "@/lib/site"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const project = findProject((await params).slug)
  if (!project) return {}
  return pageMetadata({
    title: project.name,
    path: projectPath(project),
    markdown: `${projectPath(project)}.md`,
    description: `${project.name}: ${project.purpose}.`,
  })
}

const LINK =
  "terminal-link underline decoration-muted-foreground/40 underline-offset-4"

/** "https://github.com/zyx1121/peck" as "github.com/zyx1121/peck". */
function bare(href: string) {
  return href.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

/**
 * One project: its name and purpose, its picture, a few short paragraphs on
 * what it does, then where it lives and what it is built with, in the same
 * label column as About's facts.
 */
export default async function Project({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const project = findProject((await params).slug)
  if (!project) notFound()

  const facts = [
    { label: "Site", value: bare(project.href), href: project.href },
    ...(project.code && project.code !== project.href
      ? [{ label: "Code", value: bare(project.code), href: project.code }]
      : []),
    { label: "Built with", value: project.stack.join(", ") },
  ]
  const factsRow = 4 + project.intro.length

  return (
    <main className={cn(column, page, "flex-1")}>
      <Hero
        title={<HeroTitle text={project.name} />}
        subtitle={project.purpose}
        className="pb-10"
      />

      {/* The capture is 1440x1080, so the box keeps 4:3 before it loads. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={project.preview.image}
        alt=""
        width={1440}
        height={1080}
        className={cn("aspect-4/3 w-full object-cover", enterRow(3))}
      />

      <div className="mt-10 flex max-w-2xl flex-col gap-y-5">
        {project.intro.map((paragraph, index) => (
          <p key={index} className={cn("text-pretty", enterRow(4 + index))}>
            {paragraph}
          </p>
        ))}
      </div>

      <section aria-labelledby="facts-heading" className="mt-20">
        <SectionTitle
          id="facts-heading"
          title="Details"
          className={enterRow(factsRow)}
        />
        <dl className="mt-5 flex flex-col gap-y-3">
          {facts.map(({ label, value, href }, index) => (
            <div
              key={label}
              className={cn("flex gap-x-5", enterRow(factsRow + 1 + index))}
            >
              <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
              <dd className="min-w-0 break-words">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK}
                  >
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  )
}
