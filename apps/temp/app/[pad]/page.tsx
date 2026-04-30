"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export default function PadPage({
  params,
}: {
  params: Promise<{ pad: string }>
}) {
  const [padId, setPadId] = useState<string | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    params.then(({ pad }) => setPadId(pad))
  }, [params])

  useEffect(() => {
    if (!padId) return

    async function init() {
      const { data } = await supabase
        .from("pads")
        .select("content")
        .eq("id", padId)
        .maybeSingle()

      if (data === null) {
        await supabase.from("pads").insert({ id: padId, content: "" })
        setContent("")
      } else {
        setContent(data.content)
      }
    }

    init()

    const channel = supabase
      .channel("pad:" + padId)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pads",
          filter: "id=eq." + padId,
        },
        (payload: { new: Record<string, unknown> }) => {
          setContent(payload.new["content"] as string)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [padId])

  function handleChange(value: string) {
    setContent(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      await supabase
        .from("pads")
        .update({ content: value, updated_at: new Date().toISOString() })
        .eq("id", padId)
    }, 300)
  }

  if (content === null) return null

  return (
    <textarea
      className="fixed inset-0 h-full w-full resize-none bg-transparent p-16 font-mono text-base focus:outline-none md:p-24"
      value={content}
      onChange={(e) => handleChange(e.target.value)}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
    />
  )
}
