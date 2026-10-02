import { getMarkdown } from "@/lib/markdown"

export async function GET() {
  const { agentInstructions, markdownResponse } = await getMarkdown("en")
  return markdownResponse(agentInstructions())
}
