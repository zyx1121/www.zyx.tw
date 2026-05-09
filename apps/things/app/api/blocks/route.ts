import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/utils/supabase/server"

const ALLOWED_KINDS = new Set(["text", "link", "image", "video"])

type CreateBody = {
  kind?: string
  title?: string | null
  content?: string
  tags?: string[]
  is_public?: boolean
  metadata?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  const body = (await request.json()) as CreateBody

  if (!body.kind || !ALLOWED_KINDS.has(body.kind)) {
    return NextResponse.json({ error: "invalid kind" }, { status: 400 })
  }
  if (!body.content?.trim()) {
    return NextResponse.json({ error: "content required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("things_blocks")
    .insert({
      kind: body.kind,
      title: body.title ?? null,
      content: body.content.trim(),
      metadata: body.metadata ?? {},
      tags: body.tags ?? [],
      is_public: body.is_public ?? false,
      owner_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
