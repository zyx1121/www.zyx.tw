import { markdownResponse, notFoundMarkdown } from "@/lib/markdown"

// Prerendered with its 404 status; next.config.mjs rewrites Markdown
// requests for paths that do not exist here.
export const dynamic = "force-static"

export function GET() {
  return markdownResponse(notFoundMarkdown(), { status: 404 })
}
