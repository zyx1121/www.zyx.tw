import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { fetchOgMetadata } from "@/lib/og"
import { createClient } from "@/utils/supabase/server"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type PatchBody = {
  title?: string | null
  content?: string
  tags?: string[]
  is_public?: boolean
  refresh_og?: boolean
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  const body = (await request.json()) as PatchBody

  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.content !== undefined && body.content.trim()) {
    updates.content = body.content.trim()
  }
  if (body.tags !== undefined) updates.tags = body.tags
  if (body.is_public !== undefined) updates.is_public = body.is_public

  if (body.refresh_og) {
    const { data: existing } = await supabase
      .from("things_blocks")
      .select("kind, content")
      .eq("id", id)
      .single()
    if (existing?.kind === "link") {
      const url = (updates.content as string) ?? existing.content
      const og = await fetchOgMetadata(url)
      if (Object.keys(og).length > 0) updates.metadata = og
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no changes" }, { status: 400 })
  }

  // RLS enforces owner_id = auth.uid() — no need to recheck server-side.
  const { data, error } = await supabase
    .from("things_blocks")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  const { error } = await supabase.from("things_blocks").delete().eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
