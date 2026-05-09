import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import { BlockDetail } from "@/components/block-detail"
import type { Block } from "@/components/block"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Props = { params: Promise<{ id: string }> }

export default async function Page({ params }: Props) {
  const { id } = await params
  if (!UUID_RE.test(id)) notFound()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) notFound()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [{ data }, userResult] = await Promise.all([
    supabase
      .from("things_blocks")
      .select(
        "id, kind, title, content, metadata, tags, is_public, owner_id, created_at"
      )
      .eq("id", id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!data) notFound()

  const isOwner = userResult.data.user?.id === data.owner_id
  const block: Block = {
    id: data.id,
    kind: data.kind,
    title: data.title,
    content: data.content,
    metadata: data.metadata,
    tags: data.tags,
    is_public: data.is_public,
    created_at: data.created_at,
  }

  return <BlockDetail block={block} isOwner={isOwner} />
}
