import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/client"
import { createAdminClient } from "@/lib/supabase/admin"

function isAuthorized(request: NextRequest): boolean {
  return (
    request.headers.get("authorization") === `Bearer ${process.env.ADMIN_TOKEN}`
  )
}

type Params = { params: Promise<{ slug: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { slug } = await params
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notes")
    .select("slug, title, content, created_at, updated_at")
    .eq("slug", slug)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: Params) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params
  const body = await request.json()
  const { title, content } = body

  const updates: { updated_at: string; title?: string; content?: string } = {
    updated_at: new Date().toISOString(),
  }
  if (title !== undefined) updates.title = title
  if (content !== undefined) updates.content = content

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("notes")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Note not found" },
      { status: error ? 500 : 404 }
    )
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params
  const supabase = createAdminClient()
  const { error } = await supabase.from("notes").delete().eq("slug", slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
