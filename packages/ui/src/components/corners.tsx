import Link from "next/link"

import { ZyxMark } from "@workspace/ui/components/zyx-mark"
import { cn } from "@workspace/ui/lib/utils"

/*
 * The frame every zyx.tw site shares: the logo top left, the page nav top
 * right, secondary links bottom left and the copyright bottom right. Each
 * corner is fixed 20 px in from the viewport's corner and sets 14 px text on
 * 20 px lines, so all four share one size and one line.
 */

type At = "top-left" | "top-right" | "bottom-left" | "bottom-right"

const AT: Record<At, string> = {
  "top-left": "top-5 left-5",
  "top-right": "top-5 right-5",
  "bottom-left": "bottom-5 left-5",
  "bottom-right": "right-5 bottom-5",
}

/**
 * Text links in a corner: muted, lit on hover and for the current page. The
 * hit area reaches 8 px past the text to either side and 2 px above and
 * below, so it is 24 px tall and meets, but never covers, its neighbours in
 * the 16 px gaps and on a wrapped row 4 px down.
 */
export const cornerLink =
  "relative rounded-sm text-muted-foreground outline-offset-4 transition-colors after:absolute after:-inset-x-2 after:-inset-y-0.5 hover:text-foreground focus-visible:outline-2 aria-[current=page]:text-foreground"

/** One corner of the viewport. A page can fill one the layout leaves empty. */
export function Corner({
  at,
  className,
  ...props
}: React.ComponentProps<"div"> & { at: At }) {
  return (
    <div
      className={cn(
        "fixed z-50 flex items-center gap-4 text-sm/5 text-foreground",
        AT[at],
        className
      )}
      {...props}
    />
  )
}

/**
 * The background color fading out from a viewport edge, under the corners,
 * so text scrolling beneath them never runs into theirs: 64 px, solid for the
 * first 60%. At the bottom of a phone it is 100 px, solid for 70%, to cover
 * links that wrap onto a second row. Pages that do not scroll leave it off.
 */
function EdgeFade({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 z-40 from-background to-transparent",
        edge === "top"
          ? "top-0 h-16 bg-linear-to-b from-60%"
          : "bottom-0 h-25 bg-linear-to-t from-70% sm:h-16 sm:from-60%"
      )}
    />
  )
}

/*
 * `className` and `style` go on each corner rather than on the <header> or
 * <footer> around them: an entrance animation there would leave a transform
 * on the wrapper, and a transformed ancestor becomes the box that fixed
 * elements are placed in, which pulls the corners off the viewport's.
 */

/**
 * The top corners: the zyx mark, which mirrors itself on hover, and the page
 * nav. The mark links to `home`: "/" on www.zyx.tw, www.zyx.tw everywhere
 * else.
 */
export function TopCorners({
  home = "https://www.zyx.tw",
  label = "zyx.tw",
  nav,
  fade = false,
  className,
  style,
}: {
  home?: string
  /** The mark's accessible name. */
  label?: string
  nav?: React.ReactNode
  fade?: boolean
  /** On each corner, e.g. an entrance animation or a theme scope. */
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <header>
      {fade && <EdgeFade edge="top" />}
      <Corner at="top-left" className={className} style={style}>
        <Link
          href={home}
          aria-label={label}
          className="group rounded-sm outline-offset-4 focus-visible:outline-2"
        >
          {/* 20 px tall, the corners' line height. */}
          <ZyxMark className="h-5 w-auto group-hover:-scale-x-100 motion-safe:transition-transform motion-safe:duration-300" />
        </Link>
      </Corner>
      {nav && (
        <Corner at="top-right" className={className} style={style}>
          {nav}
        </Corner>
      )}
    </header>
  )
}

/**
 * The bottom corners: secondary links (privacy, source, Markdown) and the
 * copyright. On a narrow screen the links wrap upward instead of running
 * into the copyright.
 */
export function BottomCorners({
  links,
  fade = false,
  className,
  style,
}: {
  links?: React.ReactNode
  fade?: boolean
  /** On each corner, e.g. an entrance animation or a theme scope. */
  className?: string
  style?: React.CSSProperties
}) {
  const year = new Date().getFullYear()

  return (
    <footer>
      {fade && <EdgeFade edge="bottom" />}
      {links && (
        // Leaves 116 px for the insets, the copyright and a 20 px gap.
        <Corner
          at="bottom-left"
          className={cn(
            "max-w-[calc(100%-7.25rem)] flex-wrap gap-y-1",
            className
          )}
          style={style}
        >
          {links}
        </Corner>
      )}
      <Corner at="bottom-right" className={className} style={style}>
        {/* A prerendered page keeps the year it was built in; a client
            render in a later year leaves that text rather than tearing the
            tree down over one number. */}
        <p
          className="text-muted-foreground tabular-nums"
          suppressHydrationWarning
        >
          © {year}
        </p>
      </Corner>
    </footer>
  )
}
