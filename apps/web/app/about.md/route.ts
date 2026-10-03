import { getGithubStatus } from "@/lib/github"
import { aboutMarkdown, markdownResponse } from "@/lib/markdown"

// Regenerated with the about page, every 5 minutes (ISR).
export const revalidate = 300
export const dynamic = "force-static"

export async function GET() {
  return markdownResponse(aboutMarkdown(await getGithubStatus()))
}
