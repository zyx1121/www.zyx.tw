import { getMarkdown } from "@/lib/markdown"

export async function GET() {
  const { markdownResponse, productMarkdown } = await getMarkdown()
  return markdownResponse(productMarkdown("link"))
}
