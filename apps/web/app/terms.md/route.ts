import { getMarkdown } from "@/lib/markdown"

export async function GET() {
  const { markdownResponse, termsMarkdown } = await getMarkdown()
  return markdownResponse(termsMarkdown())
}
