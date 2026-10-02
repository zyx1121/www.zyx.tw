import { getMarkdown } from "@/lib/markdown"

export async function GET() {
  const { madeMarkdown, markdownResponse } = await getMarkdown()
  return markdownResponse(madeMarkdown())
}
