import { getMarkdown } from "@/lib/markdown"

export async function GET() {
  const { llmsTxt, markdownResponse } = await getMarkdown("en")
  return markdownResponse(llmsTxt(), { type: "text" })
}
