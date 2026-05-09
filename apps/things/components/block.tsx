import Link from "next/link"

export type BlockKind = "text" | "link" | "image" | "video"

export type Block = {
  id: string
  kind: BlockKind
  title: string | null
  content: string
  metadata: Record<string, unknown>
  tags: string[]
  created_at: string
}

type LinkMetadata = {
  title?: string
  description?: string
  image?: string
  site_name?: string
}

type VideoMetadata = {
  thumbnail?: string
  provider?: string
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

function TextBlock({ content }: { content: string }) {
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
  )
}

function LinkBlock({
  content,
  title,
  metadata,
}: {
  content: string
  title: string | null
  metadata: LinkMetadata
}) {
  const heading = title ?? metadata.title ?? content
  let host = content
  try {
    host = new URL(content).host
  } catch {
    // leave host as raw URL if it doesn't parse
  }
  return (
    <Link
      href={content}
      target="_blank"
      rel="noopener noreferrer"
      className="group block space-y-3"
    >
      {metadata.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={metadata.image}
          alt={heading}
          loading="lazy"
          className="aspect-[16/9] w-full rounded-lg border border-border object-cover"
        />
      ) : null}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{host}</p>
        <p className="text-sm group-hover:text-brand">{heading}</p>
        {metadata.description ? (
          <p className="line-clamp-3 text-xs text-muted-foreground">
            {metadata.description}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

function ImageBlock({
  content,
  title,
}: {
  content: string
  title: string | null
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={content}
      alt={title ?? "image"}
      loading="lazy"
      className="w-full rounded-lg border border-border"
    />
  )
}

function VideoBlock({
  content,
  metadata,
}: {
  content: string
  metadata: VideoMetadata
}) {
  const yt = youtubeId(content)
  if (yt) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
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
  const vimeo = vimeoId(content)
  if (vimeo) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
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
  return (
    <video
      src={content}
      controls
      poster={metadata.thumbnail}
      className="w-full rounded-lg border border-border"
    />
  )
}

export function BlockCard({ block }: { block: Block }) {
  return (
    <article className="break-inside-avoid space-y-3 rounded-2xl border border-border bg-card p-5">
      {block.kind === "text" ? <TextBlock content={block.content} /> : null}
      {block.kind === "link" ? (
        <LinkBlock
          content={block.content}
          title={block.title}
          metadata={block.metadata as LinkMetadata}
        />
      ) : null}
      {block.kind === "image" ? (
        <ImageBlock content={block.content} title={block.title} />
      ) : null}
      {block.kind === "video" ? (
        <VideoBlock
          content={block.content}
          metadata={block.metadata as VideoMetadata}
        />
      ) : null}
      {block.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {block.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
