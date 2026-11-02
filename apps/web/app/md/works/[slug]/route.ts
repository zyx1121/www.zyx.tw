import { markdownResponse, projectMarkdown } from "@/lib/markdown"
import { findProject, projects } from "@/lib/projects"

// Served at /works/<slug>.md through the rewrite in next.config.mjs.
export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const project = findProject((await params).slug)
  if (!project) return new Response("Not found", { status: 404 })
  return markdownResponse(projectMarkdown(project))
}
