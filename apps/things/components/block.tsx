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

function aspectRatioFrom(
  width: number | undefined,
  height: number | undefined
): string | undefined {
  if (!width || !height) return undefined
  return `${width} / ${height}`
}

function TextBlock({ content }: { content: string }) {
  return (
    <div className="relative max-h-72 overflow-hidden">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t from-card to-transparent"
      />
    </div>
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
  const aspect = aspectRatioFrom(metadata.image_width, metadata.image_height)
  return (
    <div className="space-y-3">
      {metadata.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={metadata.image}
          alt={heading}
          loading="lazy"
          style={{ aspectRatio: aspect ?? "16 / 9" }}
          className="w-full rounded-lg border border-border object-cover"
        />
      ) : null}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{host}</p>
        <p className="text-sm">{heading}</p>
        {metadata.description ? (
          <p className="line-clamp-3 text-xs text-muted-foreground">
            {metadata.description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function ImageBlock({
  content,
  title,
  metadata,
}: {
  content: string
  title: string | null
  metadata: ImageMetadata
}) {
  const aspect = aspectRatioFrom(metadata.width, metadata.height)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={content}
      alt={title ?? "image"}
      loading="lazy"
      style={{ aspectRatio: aspect }}
      className="block max-h-[480px] w-full object-cover"
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
      <div className="aspect-video w-full overflow-hidden">
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
      <div className="aspect-video w-full overflow-hidden">
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
      className="block w-full"
    />
  )
}

export function BlockCard({ block }: { block: Block }) {
  const flush = block.kind === "image" || block.kind === "video"
  const hasTags = block.tags.length > 0

  return (
    <Link
      href={`/${block.id}`}
      className="group block break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/30"
    >
      {flush ? (
        block.kind === "image" ? (
          <ImageBlock
            content={block.content}
            title={block.title}
            metadata={block.metadata as ImageMetadata}
          />
        ) : (
          <VideoBlock
            content={block.content}
            metadata={block.metadata as VideoMetadata}
          />
        )
      ) : (
        <div className="space-y-3 p-5">
          {block.kind === "text" ? <TextBlock content={block.content} /> : null}
          {block.kind === "link" ? (
            <LinkBlock
              content={block.content}
              title={block.title}
              metadata={block.metadata as LinkMetadata}
            />
          ) : null}
        </div>
      )}
      {hasTags ? (
        <ul
          className={
            flush
              ? "flex flex-wrap gap-1.5 border-t border-border px-5 py-3"
              : "flex flex-wrap gap-1.5 px-5 pb-5"
          }
        >
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
    </Link>
  )
}
