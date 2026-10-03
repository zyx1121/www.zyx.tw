import { indexMarkdown } from "@/lib/agent-docs";

// The home page as Markdown. The static export writes it to out/index.md;
// vercel.json serves it as text/markdown and links it from "/".
export const dynamic = "force-static";

export function GET() {
  return new Response(indexMarkdown(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
