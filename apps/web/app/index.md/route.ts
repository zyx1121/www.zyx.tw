import { getMarkdown } from "@/lib/markdown"

export async function GET() {
  const { homeMarkdown, markdownResponse } = await getMarkdown()
  return markdownResponse(homeMarkdown())
}
