import { notFound } from "next/navigation"

import { SectionTitle } from "@workspace/ui/components/section-title"
import { cn } from "@workspace/ui/lib/utils"
import { column, enterRow, page } from "@workspace/ui/lib/layout"

import { Hero, HeroTitle } from "@/components/hero"
import { ProjectDiagram } from "@/components/project-diagram"
import { ProjectPicture } from "@/components/project-picture"
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

/** Rows of a term and its line, in the label column About's facts use. */
function Rows({
  rows,
  className,
}: {
  rows: { label: string; value: string; href?: string }[]
  className?: string
}) {
  return (
    <dl className={cn("flex flex-col gap-y-3", className)}>
      {rows.map(({ label, value, href }) => (
        <div key={label} className="flex gap-x-5 max-sm:flex-col">
          <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
          <dd className="min-w-0 text-pretty break-words">
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
  )
}

/**
 * One project: its name and purpose, its picture and a few short paragraphs
 * on what it does. A project with more to say goes on from that overview
 * into sections, each with its own figure. The page ends with where the
 * project lives and what it is built with, in the same label column as
 * About's facts.
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
  const sections = project.sections ?? []
  // Rows below the first screen all enter together: the decoder caps the
  // stagger, and nobody waits for row 30 while scrolling.
  const below = enterRow(4 + project.intro.length)

  return (
    <main className={cn(column, page, "flex-1")}>
      <Hero
        title={<HeroTitle text={project.name} />}
        subtitle={project.purpose}
        className="pb-10"
      />

      {/* The capture is 1440x1080, so the box keeps 4:3 before it loads. */}
      <ProjectPicture
        src={project.preview.image}
        focus={project.preview.focus}
        className={enterRow(3)}
      />

      <div className="mt-10 flex max-w-2xl flex-col gap-y-5">
        {project.intro.map((paragraph, index) => (
          <p key={index} className={cn("text-pretty", enterRow(4 + index))}>
            {paragraph}
          </p>
        ))}
      </div>

      {sections.map((section, index) => (
        <section
          key={section.title}
          aria-labelledby={`section-${index}`}
          className={cn("mt-20", below)}
        >
          <SectionTitle id={`section-${index}`} title={section.title} />
          <div className="mt-5 flex max-w-2xl flex-col gap-y-5">
            {section.body.map((paragraph, at) => (
              <p key={at} className="text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
          {section.figure?.kind === "picture" && (
            <ProjectPicture
              src={section.figure.src}
              ratio={section.figure.ratio}
              alt={section.figure.alt}
              className="mt-10"
            />
          )}
          {section.figure?.kind === "diagram" && (
            <ProjectDiagram diagram={section.figure} className="mt-10" />
          )}
          {section.points && (
            <Rows
              className="mt-10"
              rows={section.points.map(({ term, text }) => ({
                label: term,
                value: text,
              }))}
            />
          )}
        </section>
      ))}

      <section aria-labelledby="facts-heading" className={cn("mt-20", below)}>
        <SectionTitle id="facts-heading" title="Details" />
        <Rows className="mt-5" rows={facts} />
      </section>
    </main>
  )
}
