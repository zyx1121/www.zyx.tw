import { getMarkdown } from "@/lib/markdown"

export async function GET() {
  const { markdownResponse, privacyMarkdown } = await getMarkdown()
  return markdownResponse(privacyMarkdown())
}
