import { getMarkdown } from "@/lib/markdown"

// Prerendered with its 404 status; next.config.mjs rewrites Markdown
// requests for paths that do not exist here.

export async function GET() {
  const { markdownResponse, notFoundMarkdown } = await getMarkdown()
  return markdownResponse(notFoundMarkdown(), { status: 404 })
}
