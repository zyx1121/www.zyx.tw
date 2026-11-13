import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@workspace/ui/components/ui/badge"
import { cn } from "@workspace/ui/lib/utils"
import { column, enterRow, page } from "@workspace/ui/lib/layout"

import { Hero, HeroTitle } from "@/components/hero"
import { StarCharts } from "@/components/star-chart"
import {
  findBody,
  findSystem,
  systemChart,
  systemPath,
  systems,
} from "@/lib/map"
import { pageMetadata } from "@/lib/site"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return systems.map(({ slug }) => ({ system: slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ system: string }>
}) {
  const system = findSystem((await params).system)
  if (!system) return {}
  return pageMetadata({
    title: system.name,
    path: systemPath(system),
    markdown: "/map.md",
    description: `${system.name}: ${system.line}`,
  })
}

const LINK =
  "terminal-link underline decoration-muted-foreground/40 underline-offset-4"

export default async function SystemPage({
  params,
}: {
  params: Promise<{ system: string }>
}) {
  const system = findSystem((await params).system)
  if (!system) notFound()

  return (
    <main className={cn(column, page, "flex flex-1 flex-col")}>
      <Hero title={<HeroTitle text={system.name} />} subtitle={system.line} />
      <StarCharts
        label={`${system.name} chart`}
        className={cn("mt-10", enterRow(3))}
        narrow={systemChart(system, {
          cols: 32,
          step: 2,
          stretch: 2.5,
          names: false,
        })}
        wide={systemChart(system, {
          cols: 75,
          step: 2,
          stretch: 3.5,
          names: true,
        })}
        widest={systemChart(system, {
          cols: 102,
          step: 3,
          stretch: 3.5,
          names: true,
        })}
      />
      <ol className="mt-10 flex flex-col">
        {system.bodies.map((body, index) => (
          <li
            key={body.slug}
            id={body.slug}
            className={cn("flex gap-x-3 border-b py-3", enterRow(4 + index))}
          >
            {/* The chart on a phone has room for numbers only. */}
            <span aria-hidden className="text-muted-foreground lg:hidden">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-center justify-between gap-x-5">
                {body.href ? (
                  <Link href={body.href} className={LINK}>
                    {body.name}
                  </Link>
                ) : (
                  <span>{body.name}</span>
                )}
                {!body.href && <Badge variant="muted">Planned</Badge>}
              </div>
              <p className="text-muted-foreground">{body.line}</p>
              {body.needs && (
                <p className="text-muted-foreground">
                  After{" "}
                  {body.needs.map((slug, at) => {
                    const found = findBody(slug)
                    if (!found) return null
                    return (
                      <span key={slug}>
                        {at > 0 && ", "}
                        <Link
                          href={`${systemPath(found.system)}#${slug}`}
                          className={LINK}
                        >
                          {found.body.name}
                        </Link>
                      </span>
                    )
                  })}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </main>
  )
}
