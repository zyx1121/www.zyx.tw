import { getGithubStatus } from "@/lib/github"
import { getLatestChanges } from "@/lib/latest"
import { aboutMarkdown, markdownResponse } from "@/lib/markdown"

// Regenerated with the about page, every 5 minutes (ISR).
export const revalidate = 300
export const dynamic = "force-static"

export async function GET() {
  const [status, latest] = await Promise.all([
    getGithubStatus(),
    getLatestChanges(),
  ])
  return markdownResponse(
    aboutMarkdown(status, latest?.changes ?? null, Date.now())
  )
}
