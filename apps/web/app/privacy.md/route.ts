import { markdownResponse, privacyMarkdown } from "@/lib/markdown"

export const dynamic = "force-static"

export function GET() {
  return markdownResponse(privacyMarkdown())
}
