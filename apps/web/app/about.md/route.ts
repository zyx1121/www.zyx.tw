import { getGithubStatus } from "@/lib/github"
import { getMarkdown } from "@/lib/markdown"

// Regenerated with the about page, every 5 minutes (ISR).
export const revalidate = 300

export async function GET() {
  const { aboutMarkdown, markdownResponse } = await getMarkdown()
  return markdownResponse(aboutMarkdown(await getGithubStatus()))
}
