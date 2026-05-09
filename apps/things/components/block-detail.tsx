import Link from "next/link"

import { BlockActions } from "@/components/block-actions"
import type { Block } from "@/components/block"

type LinkMetadata = {
  title?: string
  description?: string
  image?: string
  image_width?: number
  image_height?: number
  site_name?: string
}

type ImageMetadata = {
  width?: number
  height?: number
}

type VideoMetadata = {
  thumbnail?: string
}

function youtubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  )
  return match?.[1] ?? null
}

function vimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match?.[1] ?? null
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

function aspectRatioFrom(w: number | undefined, h: number | undefined) {
  if (!w || !h) return undefined
  return `${w} / ${h}`
}

export function BlockDetail({
  block,
  isOwner,
}: {
  block: Block
  isOwner: boolean
}) {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl space-y-8 px-6 pt-24 pb-32">
      <Body block={block} />

      {block.title ? (
        <h1 className="text-xl font-medium sm:text-2xl">{block.title}</h1>
      ) : null}

      {isOwner ? <BlockActions block={block} /> : null}

      {block.kind === "link" ? (
        <Link
          href={block.content}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="font-mono">{block.content}</span>
          <span className="text-xs">↗</span>
        </Link>
      ) : null}

      {block.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {block.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {dateFmt.format(new Date(block.created_at))}
      </p>

      <Link
        href="/"
        className="inline-block text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        ← back to all things
      </Link>
    </main>
  )
}

function Body({ block }: { block: Block }) {
  if (block.kind === "text") {
    return (
      <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
        {block.content}
      </pre>
    )
  }

  if (block.kind === "image") {
    const md = block.metadata as ImageMetadata
    const aspect = aspectRatioFrom(md.width, md.height)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={block.content}
        alt={block.title ?? "image"}
        style={{ aspectRatio: aspect }}
        className="w-full rounded-2xl border border-border"
      />
    )
  }

  if (block.kind === "video") {
    const yt = youtubeId(block.content)
    if (yt) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border">
          <iframe
            src={`https://www.youtube.com/embed/${yt}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )
    }
    const vimeo = vimeoId(block.content)
    if (vimeo) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border">
          <iframe
            src={`https://player.vimeo.com/video/${vimeo}`}
            title="Vimeo video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )
    }
    const md = block.metadata as VideoMetadata
    return (
      <video
        src={block.content}
        controls
        poster={md.thumbnail}
        className="w-full rounded-2xl border border-border"
      />
    )
  }

  // link
  const md = block.metadata as LinkMetadata
  const aspect = aspectRatioFrom(md.image_width, md.image_height)
  if (!md.image) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={md.image}
      alt={md.title ?? block.title ?? block.content}
      style={{ aspectRatio: aspect ?? "16 / 9" }}
      className="w-full rounded-2xl border border-border object-cover"
    />
  )
}
