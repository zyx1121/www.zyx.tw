import { markdownResponse, worksMarkdown } from "@/lib/markdown"

export const dynamic = "force-static"

export function GET() {
  return markdownResponse(worksMarkdown())
}
