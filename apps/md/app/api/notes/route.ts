import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/client"
import { createAdminClient } from "@/lib/supabase/admin"

function isAuthorized(request: NextRequest): boolean {
  return (
    request.headers.get("authorization") === `Bearer ${process.env.ADMIN_TOKEN}`
  )
}

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notes")
    .select("slug, title, updated_at")
    .order("updated_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { slug, title, content } = body

  if (!slug || !title || !content) {
    return NextResponse.json(
      { error: "slug, title, and content are all required" },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("notes")
    .insert({ slug, title, content })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
