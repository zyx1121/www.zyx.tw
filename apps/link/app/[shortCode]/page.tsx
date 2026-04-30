import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function ShortCodePage({
  params,
}: {
  params: Promise<{ shortCode: string }>
}) {
  const { shortCode } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from("link")
    .select("url")
    .eq("short_code", shortCode)
    .single()

  if (!data?.url) {
    notFound()
  }

  redirect(data.url as string)
}
