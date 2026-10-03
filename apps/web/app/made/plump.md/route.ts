import { markdownResponse, plumpMarkdown } from "@/lib/markdown"

export const dynamic = "force-static"

export function GET() {
  return markdownResponse(plumpMarkdown())
}
