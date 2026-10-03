import { agentInstructions } from "@/lib/agent-docs";

// When and how an agent should use the registry. The static export writes it
// to out/agent-instructions.md; vercel.json serves it as text/markdown.
export const dynamic = "force-static";

export function GET() {
  return new Response(agentInstructions(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
