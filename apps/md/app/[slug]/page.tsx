import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"

import "highlight.js/styles/github-dark.css"
import { createClient } from "@/utils/supabase/server"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data } = await supabase
    .from("md_notes")
    .select("title")
    .eq("slug", slug)
    .single()

  return {
    title: data?.title || slug,
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: note } = await supabase
    .from("md_notes")
    .select("slug, title, content, created_at, updated_at")
    .eq("slug", slug)
    .single()

  if (!note) notFound()

  return (
    <main className="prose prose-neutral dark:prose-invert mx-auto max-w-2xl px-8 py-32">
      <Markdown rehypePlugins={[rehypeHighlight]}>{note.content}</Markdown>
    </main>
  )
}
