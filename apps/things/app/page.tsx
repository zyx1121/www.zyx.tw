import { cookies } from "next/headers"

import { BlockCard, type Block } from "@/components/block"
import { NewBlockShell } from "@/components/new-block"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

async function fetchPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { blocks: [] as Block[], authed: false }
  }
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [{ data: blocks }, userResult] = await Promise.all([
    supabase
      .from("things_blocks")
      .select("id, kind, title, content, metadata, tags, created_at")
      .order("created_at", { ascending: false })
      .limit(120),
    supabase.auth.getUser(),
  ])

  return {
    blocks: (blocks ?? []) as Block[],
    authed: userResult.data.user !== null,
  }
}

export default async function Page() {
  const { blocks, authed } = await fetchPage()

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

      {authed ? <NewBlockShell /> : null}
    </main>
  )
}
