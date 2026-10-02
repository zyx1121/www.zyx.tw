import { getMarkdown } from "@/lib/markdown"

export async function GET() {
  const { markdownResponse, worksMarkdown } = await getMarkdown()
  return markdownResponse(worksMarkdown())
}
