import { llmsText } from "@/lib/agent-docs";

export const dynamic = "force-static";

export function GET() {
  return new Response(llmsText(), {
    headers: {
      "Content-Language": "en",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
