import { getLocale } from "@workspace/ui/lib/i18n-server";
import { indexMarkdown } from "@/lib/agent-docs";

export async function GET() {
  const locale = await getLocale();
  return new Response(indexMarkdown(locale), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Language": locale,
      "Cache-Control": "private, no-store",
      Vary: "Accept, Cookie",
    },
  });
}
