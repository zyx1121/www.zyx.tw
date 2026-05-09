import { cookies } from "next/headers"

import { BlockCard, type Block } from "@/components/block"
import { createClient } from "@/utils/supabase/server"

export const revalidate = 60

async function fetchBlocks(): Promise<Block[]> {
  // Build-time / CI prerender without supabase env — render an empty grid
  // instead of crashing. Vercel runtime has the real env.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data } = await supabase
    .from("things_blocks")
    .select("id, kind, title, content, metadata, tags, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(120)
  return (data ?? []) as Block[]
}

export default async function Page() {
  const blocks = await fetchBlocks()

  return (
    <main className="min-h-dvh px-6 pt-24 pb-32 sm:px-10">
      <header className="mx-auto mb-12 max-w-5xl space-y-2 text-center">
        <h1 className="text-2xl font-medium sm:text-3xl">Things.</h1>
        <p className="text-sm text-muted-foreground">
          A scrapbook of texts, links, images, and videos worth keeping.
        </p>
      </header>

      {blocks.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          The shelf is empty for now.
        </p>
      ) : (
        <div className="mx-auto max-w-5xl columns-1 gap-4 sm:columns-2 lg:columns-3">
          {blocks.map((block) => (
            <div key={block.id} className="mb-4 break-inside-avoid">
              <BlockCard block={block} />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
