"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"

type ActionState =
  | { ok: true; shortCode: string; shortUrl: string }
  | { ok: false; error: string }

function generateShortCode(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => chars[b % chars.length]).join("")
}

export async function createShortLink(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const headerStore = await headers()
  const host = headerStore.get("host") ?? ""

  if (host !== "link.zyx.tw" && host !== "localhost:3000") {
    return { ok: false, error: "Who invited you here?" }
  }

  const url = formData.get("url")?.toString().trim()

  if (!url) {
    return { ok: false, error: "URL cannot be empty, come on." }
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return { ok: false, error: "That doesn't look like a real URL." }
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return { ok: false, error: "Only http/https URLs, please." }
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("link")
    .select("short_code")
    .eq("url", url)
    .single()

  if (existing) {
    const shortCode = existing.short_code as string
    const shortUrl = `https://link.zyx.tw/${shortCode}`
    return { ok: true, shortCode, shortUrl }
  }

  const shortCode = generateShortCode()

  const { error } = await supabase
    .from("link")
    .insert({ short_code: shortCode, url })

  if (error) {
    return { ok: false, error: "Database said no. Try again?" }
  }

  const shortUrl = `https://link.zyx.tw/${shortCode}`
  return { ok: true, shortCode, shortUrl }
}
