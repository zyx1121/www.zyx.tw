import Link from "next/link"

import { createClient } from "@/lib/supabase/client"

type Note = {
  slug: string
  title: string
  updated_at: string
}

export const revalidate = 60

export default async function Page() {
  const supabase = createClient()
  const { data: notes } = await supabase
    .from("notes")
    .select("slug, title, updated_at")
    .order("updated_at", { ascending: false })

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-8 py-32">
      {!notes || notes.length === 0 ? (
        <p className="text-muted-foreground">no notes yet</p>
      ) : (
        notes.map((note: Note) => (
          <Link key={note.slug} href={`/${note.slug}`} className="group block">
            <p className="underline-offset-4 group-hover:underline">
              {note.slug} — {note.title || "(untitled)"}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(note.updated_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </Link>
        ))
      )}
    </main>
  )
}
