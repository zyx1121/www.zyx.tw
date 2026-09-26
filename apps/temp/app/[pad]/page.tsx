"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { Textarea } from "@workspace/ui/components/ui/textarea"

import { createClient } from "@/utils/supabase/client"

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
        .from("temp_pads")
        .select("content")
        .eq("id", padId)
        .maybeSingle()

      if (data === null) {
        await supabase.from("temp_pads").insert({ id: padId, content: "" })
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
          table: "temp_pads",
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
  }, [padId, supabase])

  function handleChange(value: string) {
    setContent(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      await supabase
        .from("temp_pads")
        .update({ content: value, updated_at: new Date().toISOString() })
        .eq("id", padId)
    }, 300)
  }

  if (content === null) return null

  return (
    <Textarea
      className="fixed inset-0 field-sizing-fixed h-full w-full resize-none rounded-none border-0 bg-transparent p-16 font-mono text-base focus-visible:ring-0 md:p-24 md:text-base dark:bg-transparent"
      aria-label="Note"
      value={content}
      onChange={(e) => handleChange(e.target.value)}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
    />
  )
}
