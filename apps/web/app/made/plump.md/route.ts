import { getMarkdown } from "@/lib/markdown"

export async function GET() {
  const { markdownResponse, plumpMarkdown } = await getMarkdown()
  return markdownResponse(plumpMarkdown())
}
