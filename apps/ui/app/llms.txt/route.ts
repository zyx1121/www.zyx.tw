import { llmsText } from "@/lib/agent-docs";

// The llmstxt.org index. The static export writes it to out/llms.txt;
// vercel.json serves it as text/plain and links it from "/".
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsText(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
