import { componentMarkdown } from "@/lib/agent-docs";
import { DOCS } from "@/lib/docs";

// Each component page as Markdown. The static export writes out/md/<name>;
// vercel.json serves it at /<name>.md as text/markdown.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS.map((item) => ({ slug: item.name }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return new Response(componentMarkdown(slug), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
