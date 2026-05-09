export type OgMetadata = {
  title?: string
  description?: string
  image?: string
  site_name?: string
}

const META_TAG_RE = /<meta\s+([^>]+?)\/?>/gi
const ATTR_RE = /([\w:-]+)\s*=\s*"([^"]*)"|([\w:-]+)\s*=\s*'([^']*)'/g
const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i

const FETCH_TIMEOUT_MS = 5000
const BOT_UA = "Mozilla/5.0 (compatible; thingsbot/1.0; +https://things.zyx.tw)"

function parseAttrs(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of raw.matchAll(ATTR_RE)) {
    const key = (m[1] ?? m[3])?.toLowerCase()
    const value = m[2] ?? m[4]
    if (key && value !== undefined) out[key] = value
  }
  return out
}

function absolutize(maybe: string, base: string): string {
  try {
    return new URL(maybe, base).toString()
  } catch {
    return maybe
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

export async function fetchOgMetadata(url: string): Promise<OgMetadata> {
  let target: URL
  try {
    target = new URL(url)
  } catch {
    return {}
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") return {}

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(target, {
      headers: {
        "user-agent": BOT_UA,
        accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
      signal: controller.signal,
      redirect: "follow",
    })
    if (!res.ok) return {}

    const reader = res.body?.getReader()
    if (!reader) return {}

    // Cap at ~256 KiB — meta tags should always live in <head>.
    const chunks: Uint8Array[] = []
    let total = 0
    while (total < 262_144) {
      const { value, done } = await reader.read()
      if (done) break
      chunks.push(value)
      total += value.length
    }
    await reader.cancel().catch(() => {})
    const html = new TextDecoder("utf-8").decode(
      Buffer.concat(chunks.map((c) => Buffer.from(c)))
    )

    const metas: Record<string, string> = {}
    for (const m of html.matchAll(META_TAG_RE)) {
      const attrs = parseAttrs(m[1] ?? "")
      const key = attrs.property ?? attrs.name
      const value = attrs.content
      if (key && value) metas[key.toLowerCase()] = decodeEntities(value)
    }

    const titleMatch = html.match(TITLE_RE)
    const titleTag = titleMatch?.[1]
      ? decodeEntities(titleMatch[1].trim())
      : null

    const pick = (key: string) =>
      metas[`og:${key}`] ?? metas[`twitter:${key}`] ?? undefined

    const result: OgMetadata = {}
    const title = pick("title") ?? titleTag ?? undefined
    const description = pick("description") ?? metas["description"]
    const image =
      pick("image") ?? metas["twitter:image:src"] ?? metas["og:image:url"]
    const siteName = pick("site_name")

    if (title) result.title = title
    if (description) result.description = description
    if (image) result.image = absolutize(image, target.toString())
    if (siteName) result.site_name = siteName
    return result
  } catch {
    return {}
  } finally {
    clearTimeout(timer)
  }
}
