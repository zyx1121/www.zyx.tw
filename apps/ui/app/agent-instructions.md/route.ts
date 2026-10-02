import { agentInstructions } from "@/lib/agent-docs";

export const dynamic = "force-static";

export function GET() {
  return new Response(agentInstructions(), {
    headers: {
      "Content-Language": "en",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
