import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export default async function ShortCodePage({
  params,
}: {
  params: Promise<{ shortCode: string }>
}) {
  const { shortCode } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from("link_redirects")
    .select("url")
    .eq("short_code", shortCode)
    .single()

  if (!data?.url) {
    notFound()
  }

  redirect(data.url as string)
}
